import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { CampaignForm } from "@/features/campaigns/components/campaign-form";
import { CampaignControls } from "@/features/campaigns/components/campaign-controls";
import { getCampaign } from "@/features/campaigns/server/queries";
import { can } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";
export default async function CampaignPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = await params;
  const [campaign, user] = await Promise.all([
    getCampaign(campaignId).catch(() => null),
    getCurrentUser(),
  ]);
  if (!campaign) notFound();
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Growth"
        title={campaign.name}
        description={`${campaign.code} · ${campaign.percentageOff}% ${campaign.scope} discount`}
      />
      {can(user.role, "campaigns.manage") && (
        <CampaignControls campaign={campaign} />
      )}
      <CampaignForm campaign={campaign} />
    </div>
  );
}
