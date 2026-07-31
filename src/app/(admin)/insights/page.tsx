import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { DemandForecast } from "@/features/optimization/components/demand-forecast";
import { MockDesignNotice } from "@/features/optimization/components/mock-design-notice";
import { OptimizationMetrics } from "@/features/optimization/components/optimization-metrics";
import { SupplierScorecards } from "@/features/optimization/components/supplier-scorecards";
import { getInsightsWorkspace } from "@/features/optimization/server/queries";

export default async function InsightsPage() {
  const workspace = await getInsightsWorkspace();
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Phase 8 · Decision support"
        title="Demand and operations intelligence"
        description={`Explainable mock signals built from ${workspace.dataWindow}.`}
        action={
          <Link className="button" href="/inventory/reorder-suggestions">
            Review reorder suggestions
          </Link>
        }
      />
      <MockDesignNotice>
        No production events, warehouse or forecasting service is connected.
      </MockDesignNotice>
      <OptimizationMetrics metrics={workspace.metrics} />
      <DemandForecast points={workspace.forecast} />
      <SupplierScorecards scorecards={workspace.supplierScorecards} />
    </div>
  );
}
