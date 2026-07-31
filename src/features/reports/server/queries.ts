import "server-only";
import { requirePermission } from "@/lib/auth/session";
import { reportQuerySchema } from "../schemas/reports";
import { getReportRepository } from "../data/repository-factory";
export async function runReport(input: unknown) {
  await requirePermission("reports.view");
  return getReportRepository().run(reportQuerySchema.parse(input));
}
