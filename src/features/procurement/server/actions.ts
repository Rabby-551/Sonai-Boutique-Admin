"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/session";
import { OperationsError } from "@/lib/operations-error";
import { locationIdSchema } from "@/features/inventory/schemas/inventory";
import { getProcurementRepository } from "../data/repository-factory";
import type { ProcurementActionState } from "./action-state";
const value = (form: FormData, key: string) =>
  String(form.get(key) ?? "").trim();
const errorState = (error: unknown): ProcurementActionState => {
  if (error instanceof OperationsError)
    return { status: "error", message: error.message };
  if (error instanceof z.ZodError)
    return {
      status: "error",
      message: error.issues[0]?.message ?? "Check the procurement information.",
    };
  return {
    status: "error",
    message: "The procurement record could not be updated.",
  };
};
const refresh = (id?: string) => {
  revalidatePath("/suppliers");
  revalidatePath("/purchase-orders");
  revalidatePath("/inventory");
  revalidatePath("/stock-movements");
  revalidatePath("/dashboard");
  if (id) revalidatePath(`/purchase-orders/${id}`);
};
function supplierInput(form: FormData) {
  const variantIds = form.getAll("variantId");
  return {
    name: z.string().min(2).max(160).parse(value(form, "name")),
    contactName: z.string().min(2).max(120).parse(value(form, "contactName")),
    phone: z.string().min(7).max(30).parse(value(form, "phone")),
    email:
      z.string().email().or(z.literal("")).parse(value(form, "email")) || null,
    address: z.string().min(8).max(500).parse(value(form, "address")),
    paymentTerms: z.string().min(2).max(160).parse(value(form, "paymentTerms")),
    leadTimeDays: z.coerce
      .number()
      .int()
      .nonnegative()
      .max(365)
      .parse(value(form, "leadTimeDays")),
    notes: z.string().max(1_000).parse(value(form, "notes")),
    variants: variantIds.filter(Boolean).map((variantId, index) => ({
      variantId: String(variantId),
      supplierSku: z
        .string()
        .min(1)
        .parse(String(form.getAll("supplierSku")[index] ?? "")),
      minimumQuantity: z.coerce
        .number()
        .int()
        .positive()
        .parse(form.getAll("minimumQuantity")[index]),
      lastUnitCostMinor: Math.round(
        z.coerce
          .number()
          .nonnegative()
          .parse(form.getAll("lastUnitCost")[index]) * 100,
      ),
      leadTimeDays: z.coerce
        .number()
        .int()
        .nonnegative()
        .max(365)
        .parse(form.getAll("variantLeadTime")[index]),
    })),
  };
}
function poInput(form: FormData, actorId: string) {
  return {
    supplierId: z.string().min(1).parse(value(form, "supplierId")),
    destinationLocationId: locationIdSchema.parse(
      value(form, "destinationLocationId"),
    ),
    expectedDeliveryDate: z
      .string()
      .date()
      .parse(value(form, "expectedDeliveryDate")),
    lines: form
      .getAll("variantId")
      .filter(Boolean)
      .map((variantId, index) => ({
        variantId: String(variantId),
        supplierSku: z
          .string()
          .min(1)
          .parse(String(form.getAll("supplierSku")[index] ?? "")),
        orderedQuantity: z.coerce
          .number()
          .int()
          .positive()
          .parse(form.getAll("orderedQuantity")[index]),
        unitCostMinor: Math.round(
          z.coerce
            .number()
            .nonnegative()
            .parse(form.getAll("unitCost")[index]) * 100,
        ),
      })),
    shippingMinor: Math.round(
      z.coerce
        .number()
        .nonnegative()
        .parse(value(form, "shipping") || 0) * 100,
    ),
    otherMinor: Math.round(
      z.coerce
        .number()
        .nonnegative()
        .parse(value(form, "other") || 0) * 100,
    ),
    note: z.string().max(1_000).parse(value(form, "note")),
    actorId,
  };
}
export async function createSupplierAction(
  _previous: ProcurementActionState,
  form: FormData,
): Promise<ProcurementActionState> {
  try {
    const user = await requirePermission("procurement.create");
    const item = await getProcurementRepository().createSupplier(
      supplierInput(form),
      user.id,
    );
    refresh();
    return { status: "success", message: "Supplier created.", id: item.id };
  } catch (error) {
    return errorState(error);
  }
}
export async function updateSupplierAction(
  id: string,
  _previous: ProcurementActionState,
  form: FormData,
): Promise<ProcurementActionState> {
  try {
    const user = await requirePermission("procurement.create");
    const item = await getProcurementRepository().updateSupplier(
      id,
      supplierInput(form),
      z.coerce.number().int().positive().parse(value(form, "expectedVersion")),
      user.id,
    );
    refresh();
    return { status: "success", message: "Supplier updated.", id: item.id };
  } catch (error) {
    return errorState(error);
  }
}
export async function archiveSupplierAction(id: string, version: number) {
  try {
    const user = await requirePermission("procurement.create");
    await getProcurementRepository().archiveSupplier(id, version, user.id);
    refresh();
    return {
      status: "success",
      message: "Supplier archived.",
      id,
    } satisfies ProcurementActionState;
  } catch (error) {
    return errorState(error);
  }
}
export async function createPurchaseOrderAction(
  _previous: ProcurementActionState,
  form: FormData,
): Promise<ProcurementActionState> {
  try {
    const user = await requirePermission("procurement.create");
    const item = await getProcurementRepository().createPurchaseOrder(
      poInput(form, user.id),
    );
    refresh(item.id);
    return {
      status: "success",
      message: "Purchase order draft created.",
      id: item.id,
    };
  } catch (error) {
    return errorState(error);
  }
}
export async function submitPurchaseOrderAction(id: string, version: number) {
  try {
    const user = await requirePermission("procurement.create");
    await getProcurementRepository().submitPurchaseOrder(
      id,
      version,
      crypto.randomUUID(),
      user.id,
    );
    refresh(id);
    return {
      status: "success",
      message: "Purchase order submitted.",
      id,
    } satisfies ProcurementActionState;
  } catch (error) {
    return errorState(error);
  }
}
export async function decidePurchaseOrderAction(
  id: string,
  decision: "approved" | "rejected",
  reason: string,
  version: number,
) {
  try {
    const user = await requirePermission("procurement.approve");
    await getProcurementRepository().decidePurchaseOrder(
      id,
      decision,
      reason,
      version,
      user.id,
    );
    refresh(id);
    return {
      status: "success",
      message: `Purchase order ${decision}.`,
      id,
    } satisfies ProcurementActionState;
  } catch (error) {
    return errorState(error);
  }
}
export async function transitionPurchaseOrderAction(
  id: string,
  next: "supplier_confirmed" | "in_transit",
  reference: string,
  version: number,
) {
  try {
    const user = await requirePermission("procurement.create");
    await getProcurementRepository().transitionPurchaseOrder(
      id,
      next,
      reference,
      version,
      user.id,
    );
    refresh(id);
    return {
      status: "success",
      message: `Purchase order marked ${next}.`,
      id,
    } satisfies ProcurementActionState;
  } catch (error) {
    return errorState(error);
  }
}
export async function receivePurchaseOrderAction(
  id: string,
  _previous: ProcurementActionState,
  form: FormData,
): Promise<ProcurementActionState> {
  try {
    const user = await requirePermission("procurement.receive");
    await getProcurementRepository().receivePurchaseOrder(id, {
      lines: form.getAll("variantId").map((variantId, index) => ({
        variantId: String(variantId),
        acceptedQuantity: z.coerce
          .number()
          .int()
          .nonnegative()
          .parse(form.getAll("acceptedQuantity")[index]),
        damagedQuantity: z.coerce
          .number()
          .int()
          .nonnegative()
          .parse(form.getAll("damagedQuantity")[index]),
        rejectedQuantity: z.coerce
          .number()
          .int()
          .nonnegative()
          .parse(form.getAll("rejectedQuantity")[index]),
      })),
      reference: z.string().min(2).max(160).parse(value(form, "reference")),
      note: z.string().max(500).parse(value(form, "note")),
      expectedVersion: z.coerce
        .number()
        .int()
        .positive()
        .parse(value(form, "expectedVersion")),
      commandId: value(form, "idempotencyKey") || crypto.randomUUID(),
      actorId: user.id,
    });
    refresh(id);
    return {
      status: "success",
      message: "Receipt recorded and accepted stock posted.",
      id,
    };
  } catch (error) {
    return errorState(error);
  }
}
export async function finishPurchaseOrderAction(
  id: string,
  action: "close" | "cancel",
  reason: string,
  version: number,
) {
  try {
    const user = await requirePermission("procurement.approve");
    await getProcurementRepository().finishPurchaseOrder(
      id,
      action,
      reason,
      version,
      user.id,
    );
    refresh(id);
    return {
      status: "success",
      message: `Purchase order ${action === "close" ? "closed" : "cancelled"}.`,
      id,
    } satisfies ProcurementActionState;
  } catch (error) {
    return errorState(error);
  }
}
