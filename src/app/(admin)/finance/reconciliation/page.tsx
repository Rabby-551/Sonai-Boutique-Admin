import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { MockDesignNotice } from "@/features/optimization/components/mock-design-notice";
import { ReconciliationRuns } from "@/features/optimization/components/reconciliation-runs";
import { getFinanceWorkspace } from "@/features/optimization/server/queries";
import { PosReconciliationSummary } from "@/features/pos/components/pos-reconciliation-summary";
import { getPosReconciliationSummary } from "@/features/pos/server/queries";

export default async function ReconciliationPage() {
  const [workspace, posRows] = await Promise.all([
    getFinanceWorkspace(),
    getPosReconciliationSummary(),
  ]);
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Phase 8 · Financial control"
        title="Payment reconciliation"
        description="Deterministic settlement matching with exact-match automation and review-required exceptions."
        action={
          <Link className="button secondary" href="/reports/schedules">
            Scheduled reports
          </Link>
        }
      />
      <MockDesignNotice>
        Amounts and references are fictional; no provider settlement or
        accounting entry is changed.
      </MockDesignNotice>
      <ReconciliationRuns runs={workspace.reconciliationRuns} />
      <PosReconciliationSummary rows={posRows} />
    </div>
  );
}
