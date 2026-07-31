import "server-only";
import { requirePermission } from "@/lib/auth/session";
import { getOrderRepository } from "../data/repository-factory";
import type { OrderListInput } from "../data/repository";
import { getInventoryRepository } from "@/features/inventory/data/repository-factory";
import { OperationsError } from "@/lib/operations-error";

export async function listOrders(input: OrderListInput) {
  const user = await requirePermission("orders.view");
  return getOrderRepository().listOrders({
    ...input,
    locationId: user.branchId
      ? (user.branchId as OrderListInput["locationId"])
      : input.locationId,
  });
}
export async function getOrder(id: string) {
  const user = await requirePermission("orders.view");
  const order = await getOrderRepository().getOrder(id);
  if (user.branchId && order?.fulfillmentLocationId !== user.branchId)
    throw new OperationsError(
      "FORBIDDEN",
      "This order belongs to another branch.",
    );
  return order;
}
export async function listOrderLocations() {
  await requirePermission("orders.view");
  return getInventoryRepository().listLocations();
}
