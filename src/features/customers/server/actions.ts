"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/session";
import { OperationsError } from "@/lib/operations-error";
import { getCustomerRepository } from "../data/repository-factory";
import type { CustomerActionState } from "./action-state";

const value = (form: FormData, key: string) =>
  String(form.get(key) ?? "").trim();
const mutationSchema = z.object({
  name: z.string().min(2).max(120),
  phone: z.string().min(11).max(20),
  email: z.string().email().or(z.literal("")),
  birthday: z.string().date().or(z.literal("")),
  notes: z.string().max(1_000),
  address: z.string().max(500),
  enrollLoyalty: z.boolean(),
});
const errorState = (error: unknown): CustomerActionState => {
  if (error instanceof OperationsError)
    return { status: "error", message: error.message };
  if (error instanceof z.ZodError)
    return {
      status: "error",
      message: error.issues[0]?.message ?? "Check the customer information.",
    };
  return {
    status: "error",
    message: "The customer could not be updated. Try again.",
  };
};
const refresh = (id?: string) => {
  revalidatePath("/customers");
  revalidatePath("/orders");
  if (id) revalidatePath(`/customers/${id}`);
};

function parseMutation(form: FormData) {
  const parsed = mutationSchema.parse({
    name: value(form, "name"),
    phone: value(form, "phone"),
    email: value(form, "email"),
    birthday: value(form, "birthday"),
    notes: value(form, "notes"),
    address: value(form, "address"),
    enrollLoyalty: form.get("enrollLoyalty") === "on",
  });
  return {
    ...parsed,
    email: parsed.email || null,
    birthday: parsed.birthday || null,
    address: parsed.address || null,
  };
}

export async function createCustomerAction(
  _previous: CustomerActionState,
  form: FormData,
): Promise<CustomerActionState> {
  try {
    const user = await requirePermission("customers.manage");
    const customer = await getCustomerRepository().create(
      parseMutation(form),
      user.id,
    );
    refresh(customer.id);
    return { status: "success", message: "Customer created.", id: customer.id };
  } catch (error) {
    return errorState(error);
  }
}

export async function updateCustomerAction(
  id: string,
  _previous: CustomerActionState,
  form: FormData,
): Promise<CustomerActionState> {
  try {
    const user = await requirePermission("customers.manage");
    const customer = await getCustomerRepository().update(
      id,
      parseMutation(form),
      z.coerce.number().int().positive().parse(value(form, "expectedVersion")),
      user.id,
    );
    refresh(id);
    return { status: "success", message: "Customer updated.", id: customer.id };
  } catch (error) {
    return errorState(error);
  }
}

export async function archiveCustomerAction(
  id: string,
  expectedVersion: number,
): Promise<CustomerActionState> {
  try {
    const user = await requirePermission("customers.manage");
    await getCustomerRepository().archive(id, expectedVersion, user.id);
    refresh(id);
    return { status: "success", message: "Customer archived.", id };
  } catch (error) {
    return errorState(error);
  }
}

export async function adjustLoyaltyAction(
  id: string,
  points: number,
  reason: string,
): Promise<CustomerActionState> {
  try {
    const user = await requirePermission("loyalty.adjust");
    await getCustomerRepository().adjustLoyalty(
      id,
      z
        .number()
        .int()
        .refine((item) => item !== 0)
        .parse(points),
      z.string().trim().min(3).max(300).parse(reason),
      crypto.randomUUID(),
      user.id,
    );
    refresh(id);
    return { status: "success", message: "Loyalty balance adjusted.", id };
  } catch (error) {
    return errorState(error);
  }
}

export async function updateLoyaltySettingsAction(
  _previous: CustomerActionState,
  form: FormData,
): Promise<CustomerActionState> {
  try {
    const user = await requirePermission("loyalty.configure");
    await getCustomerRepository().updateLoyaltySettings(
      Math.round(
        z.coerce.number().positive().parse(value(form, "spend")) * 100,
      ),
      z.coerce.number().int().positive().parse(value(form, "points")),
      z.coerce.number().int().positive().parse(value(form, "expectedVersion")),
      user.id,
    );
    revalidatePath("/customers/loyalty-settings");
    return { status: "success", message: "Loyalty settings updated." };
  } catch (error) {
    return errorState(error);
  }
}
