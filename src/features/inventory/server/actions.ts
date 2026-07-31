"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/session";
import { OperationsError } from "@/lib/operations-error";
import { locationIdSchema } from "../schemas/inventory";
import { getInventoryRepository } from "../data/repository-factory";
import type { InventoryActionState } from "./action-state";

const text = (form: FormData, key: string) =>
  String(form.get(key) ?? "").trim();
const command = (form: FormData) =>
  text(form, "idempotencyKey") || crypto.randomUUID();
const locationAllowed = (branchId: string | null, locationId: string) =>
  !branchId || branchId === locationId;
const stateError = (error: unknown): InventoryActionState => {
  if (error instanceof OperationsError)
    return { status: "error", message: error.message };
  if (error instanceof z.ZodError)
    return {
      status: "error",
      message: error.issues[0]?.message ?? "Check the inventory information.",
    };
  return {
    status: "error",
    message: "Inventory could not be updated. Try again.",
  };
};
const refreshInventory = () => {
  revalidatePath("/inventory");
  revalidatePath("/stock-movements");
  revalidatePath("/products");
  revalidatePath("/dashboard");
};

export async function adjustStockAction(
  _previous: InventoryActionState,
  form: FormData,
): Promise<InventoryActionState> {
  try {
    const user = await requirePermission("inventory.adjust");
    const parsed = z
      .object({
        variantId: z.string().min(1),
        locationId: locationIdSchema,
        quantity: z.coerce
          .number()
          .int()
          .refine((value) => value !== 0, "Quantity cannot be zero."),
        kind: z.enum(["receipt", "adjustment", "damage", "return"]),
        reason: z.string().trim().min(3).max(240),
        reference: z.string().trim().min(1).max(80),
        expectedVersion: z.coerce.number().int().positive(),
      })
      .parse({
        variantId: text(form, "variantId"),
        locationId: text(form, "locationId"),
        quantity: text(form, "quantity"),
        kind: text(form, "kind"),
        reason: text(form, "reason"),
        reference: text(form, "reference") || "manual",
        expectedVersion: text(form, "expectedVersion"),
      });
    if (!locationAllowed(user.branchId, parsed.locationId))
      throw new OperationsError(
        "FORBIDDEN",
        "You can only update your assigned branch.",
      );
    const movement = await getInventoryRepository().adjust({
      ...parsed,
      idempotencyKey: command(form),
      actorId: user.id,
    });
    refreshInventory();
    return {
      status: "success",
      message: "Stock movement recorded.",
      id: movement.id,
    };
  } catch (error) {
    return stateError(error);
  }
}

export async function setThresholdAction(
  _previous: InventoryActionState,
  form: FormData,
): Promise<InventoryActionState> {
  try {
    const user = await requirePermission("inventory.adjust");
    const parsed = z
      .object({
        variantId: z.string().min(1),
        locationId: locationIdSchema,
        threshold: z.union([
          z.coerce.number().int().nonnegative(),
          z.literal(""),
        ]),
        expectedVersion: z.coerce.number().int().positive(),
      })
      .parse({
        variantId: text(form, "variantId"),
        locationId: text(form, "locationId"),
        threshold: text(form, "threshold"),
        expectedVersion: text(form, "expectedVersion"),
      });
    if (!locationAllowed(user.branchId, parsed.locationId))
      throw new OperationsError(
        "FORBIDDEN",
        "You can only update your assigned branch.",
      );
    await getInventoryRepository().setThreshold(
      parsed.variantId,
      parsed.locationId,
      parsed.threshold === "" ? null : parsed.threshold,
      parsed.expectedVersion,
    );
    refreshInventory();
    revalidatePath(`/inventory/${parsed.variantId}`);
    return { status: "success", message: "Location threshold updated." };
  } catch (error) {
    return stateError(error);
  }
}

export async function createTransferAction(
  _previous: InventoryActionState,
  form: FormData,
): Promise<InventoryActionState> {
  try {
    const user = await requirePermission("inventory.transfer");
    const parsed = z
      .object({
        sourceLocationId: locationIdSchema,
        destinationLocationId: locationIdSchema,
        lines: z
          .array(
            z.object({
              variantId: z.string().min(1),
              quantity: z.coerce.number().int().positive(),
            }),
          )
          .min(1),
        note: z.string().trim().max(500),
      })
      .parse({
        sourceLocationId: text(form, "sourceLocationId"),
        destinationLocationId: text(form, "destinationLocationId"),
        lines: form.getAll("variantId").map((variantId, index) => ({
          variantId: String(variantId),
          quantity: form.getAll("quantity")[index],
        })),
        note: text(form, "note"),
      });
    const transfer = await getInventoryRepository().createTransfer({
      sourceLocationId: parsed.sourceLocationId,
      destinationLocationId: parsed.destinationLocationId,
      lines: parsed.lines,
      note: parsed.note,
      actorId: user.id,
    });
    revalidatePath("/inventory/transfers");
    return {
      status: "success",
      message: "Transfer draft created.",
      id: transfer.id,
    };
  } catch (error) {
    return stateError(error);
  }
}

export async function dispatchTransferAction(id: string, version: number) {
  try {
    const user = await requirePermission("inventory.transfer");
    const transfer = await getInventoryRepository().dispatchTransfer(
      id,
      version,
      crypto.randomUUID(),
      user.id,
    );
    refreshInventory();
    revalidatePath(`/inventory/transfers/${id}`);
    return {
      status: "success",
      message: "Transfer dispatched.",
      id: transfer.id,
    } satisfies InventoryActionState;
  } catch (error) {
    return stateError(error);
  }
}
export async function receiveTransferAction(id: string, version: number) {
  try {
    const user = await requirePermission("inventory.transfer");
    const transfer = await getInventoryRepository().receiveTransfer(
      id,
      version,
      crypto.randomUUID(),
      user.id,
    );
    refreshInventory();
    revalidatePath(`/inventory/transfers/${id}`);
    return {
      status: "success",
      message: "Transfer received.",
      id: transfer.id,
    } satisfies InventoryActionState;
  } catch (error) {
    return stateError(error);
  }
}

export async function createCountAction(
  _previous: InventoryActionState,
  form: FormData,
): Promise<InventoryActionState> {
  try {
    const user = await requirePermission("inventory.count");
    const parsed = z
      .object({
        locationId: locationIdSchema,
        scope: z.string().trim().min(2).max(120),
        scheduledDate: z.string().date(),
      })
      .parse({
        locationId: text(form, "locationId"),
        scope: text(form, "scope"),
        scheduledDate: text(form, "scheduledDate"),
      });
    if (!locationAllowed(user.branchId, parsed.locationId))
      throw new OperationsError(
        "FORBIDDEN",
        "You can only count your assigned branch.",
      );
    const count = await getInventoryRepository().createCount({
      ...parsed,
      actorId: user.id,
    });
    revalidatePath("/stock-counts");
    return {
      status: "success",
      message: "Stock count scheduled.",
      id: count.id,
    };
  } catch (error) {
    return stateError(error);
  }
}

export async function startCountAction(id: string, version: number) {
  try {
    const user = await requirePermission("inventory.count");
    const existing = await getInventoryRepository().getCount(id);
    if (existing && !locationAllowed(user.branchId, existing.locationId))
      throw new OperationsError(
        "FORBIDDEN",
        "This count belongs to another branch.",
      );
    const count = await getInventoryRepository().startCount(id, version);
    revalidatePath(`/stock-counts/${id}`);
    return {
      status: "success",
      message: "Count started.",
      id: count.id,
    } satisfies InventoryActionState;
  } catch (error) {
    return stateError(error);
  }
}
export async function recordCountAction(
  id: string,
  variantId: string,
  counted: number,
  version: number,
) {
  try {
    const user = await requirePermission("inventory.count");
    const existing = await getInventoryRepository().getCount(id);
    if (existing && !locationAllowed(user.branchId, existing.locationId))
      throw new OperationsError(
        "FORBIDDEN",
        "This count belongs to another branch.",
      );
    const count = await getInventoryRepository().recordCount(
      id,
      variantId,
      counted,
      version,
    );
    revalidatePath(`/stock-counts/${id}`);
    return {
      status: "success",
      message: "Count recorded.",
      id: count.id,
    } satisfies InventoryActionState;
  } catch (error) {
    return stateError(error);
  }
}
export async function submitCountAction(id: string, version: number) {
  try {
    const user = await requirePermission("inventory.count");
    const existing = await getInventoryRepository().getCount(id);
    if (existing && !locationAllowed(user.branchId, existing.locationId))
      throw new OperationsError(
        "FORBIDDEN",
        "This count belongs to another branch.",
      );
    const count = await getInventoryRepository().submitCount(id, version);
    revalidatePath(`/stock-counts/${id}`);
    return {
      status: "success",
      message: "Count submitted for review.",
      id: count.id,
    } satisfies InventoryActionState;
  } catch (error) {
    return stateError(error);
  }
}
export async function approveCountAction(id: string, version: number) {
  try {
    const user = await requirePermission("inventory.approve");
    const count = await getInventoryRepository().approveCount(
      id,
      version,
      crypto.randomUUID(),
      user.id,
    );
    refreshInventory();
    revalidatePath(`/stock-counts/${id}`);
    return {
      status: "success",
      message: "Variance approved and stock reconciled.",
      id: count.id,
    } satisfies InventoryActionState;
  } catch (error) {
    return stateError(error);
  }
}
