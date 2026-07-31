import { PageHeader } from "@/components/ui/page-header";
import { AuditFilters } from "@/features/administration/components/audit-filters";
import { AuditTable } from "@/features/administration/components/audit-table";
import { listAudit } from "@/features/administration/server/queries";
export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const input = {
    query: typeof raw.query === "string" ? raw.query : undefined,
    module: typeof raw.module === "string" ? raw.module : undefined,
    from: typeof raw.from === "string" ? raw.from : undefined,
    to: typeof raw.to === "string" ? raw.to : undefined,
  };
  const events = await listAudit(input);
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Governance"
        title="Audit log"
        description="Append-only Phase 5 administrative and financial activity."
      />
      <AuditFilters defaults={input} />
      <AuditTable events={events} />
    </div>
  );
}
