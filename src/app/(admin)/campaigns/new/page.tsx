import { PageHeader } from "@/components/ui/page-header";
import { CampaignForm } from "@/features/campaigns/components/campaign-form";
import { requirePermission } from "@/lib/auth/session";
export default async function NewCampaignPage() {
  await requirePermission("campaigns.manage");
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Growth"
        title="New campaign"
        description="Create a validated non-stacking discount rule and schedule."
      />
      <CampaignForm />
    </div>
  );
}
