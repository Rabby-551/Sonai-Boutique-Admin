import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { CampaignFilters } from "@/features/campaigns/components/campaign-filters";
import { CampaignTable } from "@/features/campaigns/components/campaign-table";
import { listCampaigns } from "@/features/campaigns/server/queries";
import { can } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";
export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const input = {
    query: typeof raw.query === "string" ? raw.query : undefined,
    status: typeof raw.status === "string" ? raw.status : undefined,
  };
  const [campaigns, user] = await Promise.all([
    listCampaigns(input),
    getCurrentUser(),
  ]);
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Growth"
        title="Campaigns"
        description="Schedule controlled discounts and inspect attributable performance."
        action={
          can(user.role, "campaigns.manage") ? (
            <Link className="button" href="/campaigns/new">
              New campaign
            </Link>
          ) : undefined
        }
      />
      <CampaignFilters defaults={input} />
      <CampaignTable campaigns={campaigns} />
    </div>
  );
}
