"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/session";
import { OperationsError } from "@/lib/operations-error";
import { locationIdSchema } from "@/features/inventory/schemas/inventory";
import { complaintStatusSchema } from "../schemas/complaints";
import { getComplaintRepository } from "../data/repository-factory";
import type { ComplaintActionState } from "./action-state";
const value = (form: FormData, key: string) =>
  String(form.get(key) ?? "").trim();
const errorState = (error: unknown): ComplaintActionState => {
  if (error instanceof OperationsError)
    return { status: "error", message: error.message };
  if (error instanceof z.ZodError)
    return {
      status: "error",
      message: error.issues[0]?.message ?? "Check the case information.",
    };
  return { status: "error", message: "The complaint could not be updated." };
};
const refresh = (id?: string) => {
  revalidatePath("/complaints");
  revalidatePath("/customers");
  if (id) revalidatePath(`/complaints/${id}`);
};
export async function createComplaintAction(
  _previous: ComplaintActionState,
  form: FormData,
): Promise<ComplaintActionState> {
  try {
    const user = await requirePermission("complaints.create");
    const location = value(form, "locationId");
    const item = await getComplaintRepository().create({
      type: z
        .enum(["complaint", "query", "support_request"])
        .parse(value(form, "type")),
      category: z
        .enum([
          "product_quality",
          "delivery",
          "payment",
          "return",
          "staff",
          "other",
        ])
        .parse(value(form, "category")),
      priority: z
        .enum(["low", "normal", "high", "urgent"])
        .parse(value(form, "priority")),
      source: z
        .enum(["phone", "email", "whatsapp", "messenger", "branch"])
        .parse(value(form, "source")),
      customerId: z.string().min(1).parse(value(form, "customerId")),
      orderId: value(form, "orderId") || null,
      productId: null,
      locationId: user.branchId
        ? locationIdSchema.parse(user.branchId)
        : location
          ? locationIdSchema.parse(location)
          : null,
      dueAt: value(form, "dueAt")
        ? new Date(value(form, "dueAt")).toISOString()
        : null,
      description: z
        .string()
        .min(10)
        .max(2_000)
        .parse(value(form, "description")),
      actorId: user.id,
    });
    refresh(item.id);
    return { status: "success", message: "Complaint logged.", id: item.id };
  } catch (error) {
    return errorState(error);
  }
}
export async function assignComplaintAction(
  id: string,
  assigneeId: string,
  version: number,
) {
  try {
    const user = await requirePermission("complaints.manage");
    await getComplaintRepository().assign(
      id,
      z.string().min(1).parse(assigneeId),
      version,
      user.id,
    );
    refresh(id);
    return {
      status: "success",
      message: "Complaint assigned.",
      id,
    } satisfies ComplaintActionState;
  } catch (error) {
    return errorState(error);
  }
}
export async function transitionComplaintAction(
  id: string,
  next: string,
  detail: string,
  version: number,
) {
  try {
    const user = await requirePermission("complaints.manage");
    await getComplaintRepository().transition(
      id,
      complaintStatusSchema.parse(next),
      z.string().max(2_000).parse(detail),
      version,
      user.id,
    );
    refresh(id);
    return {
      status: "success",
      message: `Complaint moved to ${next}.`,
      id,
    } satisfies ComplaintActionState;
  } catch (error) {
    return errorState(error);
  }
}
export async function addComplaintNoteAction(
  id: string,
  visibility: "internal" | "customer_update",
  body: string,
  version: number,
) {
  try {
    const user = await requirePermission("complaints.manage");
    await getComplaintRepository().addNote(
      id,
      visibility,
      z.string().trim().min(3).max(1_000).parse(body),
      version,
      user.id,
    );
    refresh(id);
    return {
      status: "success",
      message: "Note added.",
      id,
    } satisfies ComplaintActionState;
  } catch (error) {
    return errorState(error);
  }
}
