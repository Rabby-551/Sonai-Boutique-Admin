import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { MigrationRehearsals } from "@/features/platform/components/migration-rehearsals";
import { getPlatformOverview } from "@/features/platform/server/queries";

export default async function PlatformMigrationsPage() {
  const overview = await getPlatformOverview();
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Phase 7 · Data readiness"
        title="Migration rehearsals"
        description="Dry-run evidence and reconciliation outcomes for fictional schema-v4 cutover exercises."
        action={
          <Link className="button secondary" href="/platform">
            Platform overview
          </Link>
        }
      />
      <div className="notice">
        These rows are safe mock evidence. No development fixture has been
        imported into a real database.
      </div>
      <MigrationRehearsals rehearsals={overview.migrations} />
    </div>
  );
}
