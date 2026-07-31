import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { IntegrationTable } from "@/features/platform/components/integration-table";
import { PlatformMetrics } from "@/features/platform/components/platform-metrics";
import { ServiceHealthGrid } from "@/features/platform/components/service-health-grid";
import { getPlatformOverview } from "@/features/platform/server/queries";

export default async function PlatformPage() {
  const overview = await getPlatformOverview();
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Phase 7 · Fictional staging"
        title="Platform control center"
        description="A production-readiness design using deterministic health, provider and operational mock signals."
        action={
          <Link className="button" href="/platform/release-readiness">
            Review release gates
          </Link>
        }
      />
      <div className="notice">
        No live identity, database, payment, courier, messaging, media or backup
        provider is connected. This page demonstrates the intended operational
        experience.
      </div>
      <PlatformMetrics overview={overview} />
      <ServiceHealthGrid services={overview.services} />
      <IntegrationTable integrations={overview.integrations} />
    </div>
  );
}
