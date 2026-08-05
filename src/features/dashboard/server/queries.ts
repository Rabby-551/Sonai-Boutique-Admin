import "server-only";
import { requirePermission } from "@/lib/auth/session";
import { MockDashboardRepository } from "../data/mock-repository";
import { SupabaseDashboardRepository } from "../data/supabase-repository";
import {
  dashboardQuerySchema,
  dashboardWorkspaceSchema,
} from "../schemas/dashboard-schema";
import { env } from "@/lib/env";
export async function getDashboardWorkspace(input: unknown) {
  await requirePermission("dashboard.view");
  const query = dashboardQuerySchema.parse(input);
  const repository =
    env.COMMERCE_SOURCE === "supabase"
      ? new SupabaseDashboardRepository()
      : new MockDashboardRepository();
  const [overview, sales, operations, growth, activity] = await Promise.all([
    repository.getOverview(query),
    repository.getSales(query),
    repository.getOperations(query),
    repository.getGrowth(query),
    repository.getActivity(query),
  ]);
  return dashboardWorkspaceSchema.parse({
    query,
    ...overview,
    ...sales,
    ...operations,
    ...growth,
    ...activity,
  });
}
