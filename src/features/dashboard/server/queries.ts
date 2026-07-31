import "server-only";
import { requirePermission } from "@/lib/auth/session";
import { MockDashboardRepository } from "../data/mock-repository";
import { SupabaseDashboardRepository } from "../data/supabase-repository";
import { dashboardQuerySchema } from "../schemas/dashboard-schema";
import { env } from "@/lib/env";
export async function getDashboardSummary(input: unknown) {
  await requirePermission("dashboard.view");
  const query = dashboardQuerySchema.parse(input);
  return env.COMMERCE_SOURCE === "supabase"
    ? new SupabaseDashboardRepository().getSummary(query)
    : new MockDashboardRepository().getSummary(query);
}
