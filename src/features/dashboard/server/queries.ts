import "server-only";
import { requirePermission } from "@/lib/auth/session";
import { MockDashboardRepository } from "../data/mock-repository";
import { dashboardQuerySchema } from "../schemas/dashboard-schema";
export async function getDashboardSummary(input: unknown) {
  await requirePermission("dashboard.view");
  const query = dashboardQuerySchema.parse(input);
  return new MockDashboardRepository().getSummary(query);
}
