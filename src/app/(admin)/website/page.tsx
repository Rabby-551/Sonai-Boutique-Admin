import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { HomepageForm } from "@/features/website/components/homepage-form";
import { getHomepageRecords } from "@/features/website/server/queries";
import { can } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/session";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function WebsitePage() {
  const current = await requirePermission("website.view");
  const records = await getHomepageRecords();
  const connected =
    env.COMMERCE_SOURCE === "supabase" && env.AUTH_SOURCE === "supabase";
  const editable = connected && can(current.role, "website.manage");

  return (
    <div className="stack">
      <PageHeader
        eyebrow="Storefront CMS"
        title="Website"
        description="Manage the bilingual Sonai Boutique homepage from the same system that owns products, stock and orders."
        action={
          <Link
            className="button secondary"
            href={`${env.STOREFRONT_URL}/en`}
            target="_blank"
            rel="noreferrer"
          >
            Open storefront <ExternalLink size={16} />
          </Link>
        }
        metadata={
          <span className={`status-chip ${connected ? "success" : "warning"}`}>
            {connected
              ? "Live Supabase connection"
              : "Preview content · connect Supabase to publish"}
          </span>
        }
      />
      {records.map((record) => (
        <HomepageForm key={record.locale} record={record} editable={editable} />
      ))}
    </div>
  );
}
