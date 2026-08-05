"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { can } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/session";
import { OperationsError } from "@/lib/operations-error";
import { getPosRepository } from "../data/repository-factory";
import type { CompleteSaleInput, TenderInput } from "../data/repository";
import type { PosActionState } from "./action-state";

const text = (form: FormData, key: string) =>
  String(form.get(key) ?? "").trim();
const money = (form: FormData, key: string) =>
  Math.round(Number(text(form, key) || 0) * 100);
const refresh = () => {
  for (const path of [
    "/pos",
    "/pos/shifts",
    "/pos/transactions",
    "/pos/approvals",
    "/inventory",
    "/stock-movements",
    "/reports",
    "/finance/reconciliation",
  ])
    revalidatePath(path);
};
const failure = (error: unknown): PosActionState => ({
  status: "error",
  message:
    error instanceof OperationsError
      ? error.message
      : error instanceof z.ZodError
        ? (error.issues[0]?.message ?? "Check the POS information.")
        : "The POS command could not be completed.",
});
const parseJson = <T>(form: FormData, key: string) =>
  JSON.parse(text(form, key)) as T;

export async function openShiftAction(
  _state: PosActionState,
  form: FormData,
): Promise<PosActionState> {
  try {
    const user = await requirePermission("pos.shift");
    const registerId = z.string().min(1).parse(text(form, "registerId"));
    const repo = getPosRepository();
    const register = (await repo.listRegisters()).find(
      (item) => item.id === registerId,
    );
    if (!register || (user.branchId && register.locationId !== user.branchId))
      throw new OperationsError(
        "FORBIDDEN",
        "Choose a register assigned to your store.",
      );
    const shift = await repo.openShift({
      registerId,
      openingFloatMinor: z
        .number()
        .int()
        .nonnegative()
        .parse(money(form, "openingFloat")),
      cashierId: user.id,
      commandId: text(form, "commandId") || crypto.randomUUID(),
    });
    refresh();
    return {
      status: "success",
      message: "Register shift opened.",
      id: shift.id,
    };
  } catch (error) {
    return failure(error);
  }
}

export async function closeShiftAction(
  _state: PosActionState,
  form: FormData,
): Promise<PosActionState> {
  try {
    const user = await requirePermission("pos.shift");
    const shiftId = text(form, "shiftId");
    const shift = (await getPosRepository().listShifts()).find(
      (item) => item.id === shiftId,
    );
    if (!shift) throw new OperationsError("NOT_FOUND", "Shift not found.");
    const override = shift.cashierId !== user.id;
    if (override && !can(user.role, "pos.approve"))
      throw new OperationsError(
        "FORBIDDEN",
        "Only a manager can close another cashier's shift.",
      );
    const reason = text(form, "reason") || null;
    if (override && !reason)
      throw new OperationsError(
        "VALIDATION",
        "Manager override requires a reason.",
      );
    const closed = await getPosRepository().closeShift({
      shiftId,
      countedCashMinor: z
        .number()
        .int()
        .nonnegative()
        .parse(money(form, "countedCash")),
      actorId: user.id,
      reason,
      expectedVersion: Number(text(form, "version")),
      commandId: text(form, "commandId") || crypto.randomUUID(),
    });
    refresh();
    return {
      status: "success",
      message: "Shift closed and variance recorded.",
      id: closed.id,
    };
  } catch (error) {
    return failure(error);
  }
}

export async function completeSaleAction(
  _state: PosActionState,
  form: FormData,
): Promise<PosActionState> {
  try {
    const user = await requirePermission("pos.sell");
    const payload = parseJson<Omit<CompleteSaleInput, "actorId" | "commandId">>(
      form,
      "payload",
    );
    if (user.branchId && payload.locationId !== user.branchId)
      throw new OperationsError(
        "FORBIDDEN",
        "You can only sell from your assigned store.",
      );
    const sale = await getPosRepository().completeSale({
      ...payload,
      actorId: user.id,
      commandId: text(form, "commandId") || crypto.randomUUID(),
    });
    refresh();
    return {
      status: "success",
      message: "Sale completed and stock updated.",
      id: sale.id,
    };
  } catch (error) {
    return failure(error);
  }
}

export async function requestDiscountApprovalAction(
  _state: PosActionState,
  form: FormData,
): Promise<PosActionState> {
  try {
    const user = await requirePermission("pos.sell");
    const approval = await getPosRepository().requestApproval({
      type: "discount",
      entityId: "cart",
      fingerprint: z.string().min(2).parse(text(form, "fingerprint")),
      reason: z.string().min(3).max(300).parse(text(form, "reason")),
      amountMinor: z.number().int().positive().parse(money(form, "amount")),
      actorId: user.id,
    });
    refresh();
    return {
      status: "success",
      message: "Discount sent for manager approval.",
      id: approval.id,
    };
  } catch (error) {
    return failure(error);
  }
}

export async function decidePosApprovalAction(
  id: string,
  decision: "approved" | "rejected",
  version: number,
) {
  try {
    const user = await requirePermission("pos.approve");
    const approval = await getPosRepository().decideApproval(
      id,
      decision,
      version,
      user.id,
    );
    refresh();
    return {
      status: "success",
      message: `Request ${decision}.`,
      id: approval.id,
    } satisfies PosActionState;
  } catch (error) {
    return failure(error);
  }
}

export async function requestPosReturnAction(
  _state: PosActionState,
  form: FormData,
): Promise<PosActionState> {
  try {
    const user = await requirePermission("pos.return");
    const payload = parseJson<
      Parameters<ReturnType<typeof getPosRepository>["requestReturn"]>[0]
    >(form, "payload");
    if (user.branchId && payload.locationId !== user.branchId)
      throw new OperationsError(
        "FORBIDDEN",
        "You can only receive returns at your assigned store.",
      );
    const result = await getPosRepository().requestReturn({
      ...payload,
      actorId: user.id,
    });
    refresh();
    return {
      status: "success",
      message: "Return prepared for manager approval.",
      id: result.id,
    };
  } catch (error) {
    return failure(error);
  }
}

export async function completePosReturnAction(
  _state: PosActionState,
  form: FormData,
): Promise<PosActionState> {
  try {
    const user = await requirePermission("pos.approve");
    const result = await getPosRepository().completeReturn({
      returnId: text(form, "returnId"),
      approvalId: text(form, "approvalId"),
      refundTenders: parseJson<TenderInput[]>(form, "tenders"),
      actorId: user.id,
      expectedVersion: Number(text(form, "version")),
      commandId: text(form, "commandId") || crypto.randomUUID(),
    });
    refresh();
    return {
      status: "success",
      message: "Return and refund completed.",
      id: result.id,
    };
  } catch (error) {
    return failure(error);
  }
}

export async function completePosExchangeAction(
  _state: PosActionState,
  form: FormData,
): Promise<PosActionState> {
  try {
    const user = await requirePermission("pos.approve");
    const payload = parseJson<{
      returnId: string;
      approvalId: string;
      registerId: string;
      shiftId: string;
      replacementLines: { variantId: string; quantity: number }[];
      tenders: TenderInput[];
    }>(form, "payload");
    const exchange = await getPosRepository().completeExchange({
      ...payload,
      actorId: user.id,
      commandId: text(form, "commandId") || crypto.randomUUID(),
    });
    refresh();
    return {
      status: "success",
      message: "Exchange completed atomically.",
      id: exchange.id,
    };
  } catch (error) {
    return failure(error);
  }
}

export async function createPosCustomerAction(
  _state: PosActionState,
  form: FormData,
): Promise<PosActionState> {
  try {
    const user = await requirePermission("pos.sell");
    const customer = await getPosRepository().createCustomer(
      z.string().trim().min(2).max(120).parse(text(form, "name")),
      text(form, "phone"),
      user.id,
    );
    revalidatePath("/pos");
    return {
      status: "success",
      message: "Customer created and ready to select.",
      id: customer.id,
    };
  } catch (error) {
    return failure(error);
  }
}

export async function lookupPosCustomerAction(
  _state: PosActionState,
  form: FormData,
): Promise<PosActionState> {
  try {
    await requirePermission("pos.sell");
    const customer = await getPosRepository().findCustomer(text(form, "phone"));
    return customer
      ? {
          status: "success",
          message: `${customer.name} selected.`,
          id: customer.id,
          customer: {
            id: customer.id,
            name: customer.name,
            phone: customer.phone,
          },
        }
      : {
          status: "success",
          message: "No customer found. Enter a name to create one at checkout.",
          customer: null,
        };
  } catch (error) {
    return failure(error);
  }
}

export async function savePosProviderAction(
  _state: PosActionState,
  form: FormData,
): Promise<PosActionState> {
  try {
    const user = await requirePermission("pos.configure");
    const provider = await getPosRepository().saveProvider({
      id: text(form, "id") || undefined,
      category: z.enum(["card", "mfs"]).parse(text(form, "category")),
      code: z.string().trim().min(2).max(40).parse(text(form, "code")),
      name: z.string().trim().min(2).max(80).parse(text(form, "name")),
      active: form.get("active") === "on",
      expectedVersion: Number(text(form, "version")) || undefined,
      actorId: user.id,
    });
    revalidatePath("/settings/pos");
    revalidatePath("/pos");
    return {
      status: "success",
      message: "Payment provider saved.",
      id: provider.id,
    };
  } catch (error) {
    return failure(error);
  }
}

export async function savePosRegisterAction(
  _state: PosActionState,
  form: FormData,
): Promise<PosActionState> {
  try {
    const user = await requirePermission("pos.configure");
    const register = await getPosRepository().saveRegister({
      id: text(form, "id") || undefined,
      locationId: text(form, "locationId"),
      code: z.string().trim().min(2).max(30).parse(text(form, "code")),
      name: z.string().trim().min(2).max(80).parse(text(form, "name")),
      active: form.get("active") === "on",
      expectedVersion: Number(text(form, "version")) || undefined,
      actorId: user.id,
    });
    revalidatePath("/settings/pos");
    revalidatePath("/pos");
    return { status: "success", message: "Register saved.", id: register.id };
  } catch (error) {
    return failure(error);
  }
}

export async function savePosLocationAction(
  _state: PosActionState,
  form: FormData,
): Promise<PosActionState> {
  try {
    const user = await requirePermission("pos.configure");
    const location = await getPosRepository().saveLocation({
      id: z
        .string()
        .trim()
        .min(2)
        .max(80)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .parse(text(form, "id")),
      name: z.string().trim().min(2).max(100).parse(text(form, "name")),
      active: form.get("active") === "on",
      actorId: user.id,
    });
    revalidatePath("/settings/pos");
    revalidatePath("/pos");
    return {
      status: "success",
      message: "Physical store saved.",
      id: location.id,
    };
  } catch (error) {
    return failure(error);
  }
}
