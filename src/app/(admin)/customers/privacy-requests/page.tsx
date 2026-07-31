import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { MockDesignNotice } from "@/features/optimization/components/mock-design-notice";
import { PrivacyRequests } from "@/features/optimization/components/privacy-requests";
import { getCustomerGrowthWorkspace } from "@/features/optimization/server/queries";

export default async function PrivacyRequestsPage() {
  const workspace = await getCustomerGrowthWorkspace();
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Phase 8 · Privacy operations"
        title="Customer privacy requests"
        description="Identity, legal-hold, merge and anonymization review states without exposing real personal data."
        action={
          <Link className="button secondary" href="/customers/segments">
            Customer segments
          </Link>
        }
      />
      <MockDesignNotice>
        No export package is generated and no customer record is changed.
      </MockDesignNotice>
      <PrivacyRequests requests={workspace.privacyRequests} />
    </div>
  );
}
