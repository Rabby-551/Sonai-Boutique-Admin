import "server-only";
import { requirePermission } from "@/lib/auth/session";
import { getCatalogRepository } from "../data/repository-factory";
import type { ProductListInput } from "../data/repository";

export async function listProducts(input: ProductListInput) {
  await requirePermission("catalog.view");
  return getCatalogRepository().listProducts(input);
}
export async function getProduct(id: string) {
  await requirePermission("catalog.view");
  return getCatalogRepository().getProduct(id);
}
export async function listCategories() {
  await requirePermission("catalog.view");
  return getCatalogRepository().listCategories();
}
