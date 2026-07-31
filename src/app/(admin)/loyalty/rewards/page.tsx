import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { MockDesignNotice } from "@/features/optimization/components/mock-design-notice";
import { RewardPrograms } from "@/features/optimization/components/reward-programs";
import { getCustomerGrowthWorkspace } from "@/features/optimization/server/queries";

export default async function RewardsPage() {
  const workspace = await getCustomerGrowthWorkspace();
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Phase 8 · Loyalty"
        title="Rewards and redemption"
        description="Ledger-first mock reward programs with visible eligibility, liability and redemption boundaries."
        action={
          <Link className="button secondary" href="/customers/loyalty-settings">
            Earning settings
          </Link>
        }
      />
      <MockDesignNotice>
        No voucher is issued and no points are reserved or redeemed from this
        design.
      </MockDesignNotice>
      <RewardPrograms rewards={workspace.rewards} />
    </div>
  );
}
