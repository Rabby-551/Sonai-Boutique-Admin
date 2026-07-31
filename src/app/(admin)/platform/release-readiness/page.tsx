import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { ReleaseGates } from "@/features/platform/components/release-gates";
import { getPlatformOverview } from "@/features/platform/server/queries";

export default async function ReleaseReadinessPage() {
  const overview = await getPlatformOverview();
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Phase 7 · Release control"
        title="Go / no-go readiness"
        description="Evidence-focused launch gates that distinguish verified design checks from external production blockers."
        action={
          <Link className="button secondary" href="/platform/migrations">
            Migration evidence
          </Link>
        }
      />
      <ReleaseGates gates={overview.releaseGates} />
    </div>
  );
}
