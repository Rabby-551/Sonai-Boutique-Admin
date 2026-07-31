import "server-only";
import { requirePermission } from "@/lib/auth/session";
import { getProcurementRepository } from "../data/repository-factory";
import type { PurchaseOrderListInput } from "../data/repository";
import { getCatalogRepository } from "@/features/catalog/data/repository-factory";
import { getInventoryRepository } from "@/features/inventory/data/repository-factory";
export async function listSuppliers() {
  await requirePermission("procurement.view");
  return getProcurementRepository().listSuppliers();
}
export async function getSupplier(id: string) {
  await requirePermission("procurement.view");
  return getProcurementRepository().getSupplier(id);
}
export async function listPurchaseOrders(input: PurchaseOrderListInput) {
  await requirePermission("procurement.view");
  return getProcurementRepository().listPurchaseOrders(input);
}
export async function getPurchaseOrder(id: string) {
  await requirePermission("procurement.view");
  return getProcurementRepository().getPurchaseOrder(id);
}
export async function procurementOptions() {
  await requirePermission("procurement.view");
  const [suppliers, products, locations] = await Promise.all([
    getProcurementRepository().listSuppliers(),
    getCatalogRepository().listProducts({ pageSize: 100 }),
    getInventoryRepository().listLocations(),
  ]);
  return { suppliers, products: products.items, locations };
}
