import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { CustomerSegments } from "@/features/optimization/components/customer-segments";
import { MockDesignNotice } from "@/features/optimization/components/mock-design-notice";
import { getCustomerGrowthWorkspace } from "@/features/optimization/server/queries";

export default async function CustomerSegmentsPage() {
  const workspace = await getCustomerGrowthWorkspace();
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Phase 8 · Consent-aware growth"
        title="Customer segments"
        description="Versioned fictional audiences with explicit rules, eligible-contact counts and minimum-size protection."
        action={
          <div className="button-group">
            <Link
              className="button secondary"
              href="/customers/privacy-requests"
            >
              Privacy queue
            </Link>
            <Link className="button" href="/loyalty/rewards">
              Rewards
            </Link>
          </div>
        }
      />
      <MockDesignNotice>
        No customer is contacted and no campaign audience is published.
      </MockDesignNotice>
      <CustomerSegments segments={workspace.segments} />
    </div>
  );
}
