import "server-only";
import { requirePermission } from "@/lib/auth/session";
import { getCustomerRepository } from "../data/repository-factory";
import type { CustomerListInput } from "../data/repository";

export async function listCustomers(input: CustomerListInput) {
  const user = await requirePermission("customers.view");
  return getCustomerRepository().list({ ...input, branchId: user.branchId });
}

export async function getCustomer(id: string) {
  await requirePermission("customers.view");
  return getCustomerRepository().get(id);
}

export async function getLoyaltySettings() {
  await requirePermission("customers.view");
  return getCustomerRepository().getLoyaltySettings();
}
