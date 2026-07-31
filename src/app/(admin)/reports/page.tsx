import { PageHeader } from "@/components/ui/page-header";
import { ReportFilters } from "@/features/reports/components/report-filters";
import { ReportMetrics } from "@/features/reports/components/report-metrics";
import { ReportTable } from "@/features/reports/components/report-table";
import { runReport } from "@/features/reports/server/queries";
import { reportQuerySchema } from "@/features/reports/schemas/reports";
import { listLocations } from "@/features/inventory/server/queries";
import { can } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";
export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const query = reportQuerySchema.parse(
    Object.fromEntries(
      Object.entries(raw).filter(([, value]) => typeof value === "string"),
    ),
  );
  const [report, locations, user] = await Promise.all([
    runReport(query),
    listLocations(),
    getCurrentUser(),
  ]);
  const exportUrl = `/api/reports/export?${new URLSearchParams(Object.entries(query).filter(([, value]) => value != null) as [string, string][]).toString()}`;
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Intelligence"
        title={report.title}
        description={report.description}
        action={
          can(user.role, "reports.export") ? (
            <a className="button" href={exportUrl}>
              Export CSV
            </a>
          ) : undefined
        }
      />
      <ReportFilters defaults={query} locations={[...locations]} />
      <ReportMetrics metrics={report.metrics} />
      <ReportTable report={report} />
    </div>
  );
}
