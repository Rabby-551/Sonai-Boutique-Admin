import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { MockDesignNotice } from "@/features/optimization/components/mock-design-notice";
import { ReorderSuggestions } from "@/features/optimization/components/reorder-suggestions";
import { SupplierScorecards } from "@/features/optimization/components/supplier-scorecards";
import { getInsightsWorkspace } from "@/features/optimization/server/queries";

export default async function ReorderSuggestionsPage() {
  const workspace = await getInsightsWorkspace();
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Phase 8 · Inventory intelligence"
        title="Reorder review"
        description="Explainable location and supplier recommendations that never bypass normal purchase-order approval."
        action={
          <Link className="button secondary" href="/purchase-orders/new">
            Create purchase order
          </Link>
        }
      />
      <MockDesignNotice>
        Statuses demonstrate review decisions; no draft PO is created from these
        rows.
      </MockDesignNotice>
      <ReorderSuggestions suggestions={workspace.reorderSuggestions} />
      <SupplierScorecards scorecards={workspace.supplierScorecards} />
    </div>
  );
}
