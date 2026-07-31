import "server-only";
import { requirePermission } from "@/lib/auth/session";
import { getInventoryRepository } from "../data/repository-factory";
import type { InventoryListInput, MovementListInput } from "../data/repository";

export async function listInventory(input: InventoryListInput) {
  await requirePermission("inventory.view");
  return getInventoryRepository().listInventory(input);
}
export async function getVariantInventory(id: string) {
  await requirePermission("inventory.view");
  return getInventoryRepository().getVariantInventory(id);
}
export async function listLocations() {
  await requirePermission("inventory.view");
  return getInventoryRepository().listLocations();
}
export async function listMovements(input: MovementListInput) {
  await requirePermission("inventory.view");
  return getInventoryRepository().listMovements(input);
}
export async function listTransfers() {
  await requirePermission("inventory.view");
  return getInventoryRepository().listTransfers();
}
export async function getTransfer(id: string) {
  await requirePermission("inventory.view");
  return getInventoryRepository().getTransfer(id);
}
export async function listCounts() {
  await requirePermission("inventory.count");
  return getInventoryRepository().listCounts();
}
export async function getCount(id: string) {
  await requirePermission("inventory.count");
  return getInventoryRepository().getCount(id);
}
