import "server-only";
import { requirePermission } from "@/lib/auth/session";
import { MockOptimizationRepository } from "../data/mock-repository";

const repository = new MockOptimizationRepository();

export async function getInsightsWorkspace() {
  await requirePermission("reports.view");
  return repository.getWorkspace();
}

export async function getCustomerGrowthWorkspace() {
  await requirePermission("customers.view");
  return repository.getWorkspace();
}

export async function getFinanceWorkspace() {
  await requirePermission("reports.view");
  return repository.getWorkspace();
}

export async function getChannelsWorkspace() {
  await requirePermission("orders.view");
  return repository.getWorkspace();
}

export async function getAutomationWorkspace() {
  await requirePermission("settings.view");
  return repository.getWorkspace();
}

export async function getLocalizationWorkspace() {
  await requirePermission("settings.view");
  return repository.getWorkspace();
}
