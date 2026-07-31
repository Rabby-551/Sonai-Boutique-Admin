import { PageHeader } from "@/components/ui/page-header";
import { LoyaltySettingsForm } from "@/features/customers/components/loyalty-settings-form";
import { getLoyaltySettings } from "@/features/customers/server/queries";
import { requirePermission } from "@/lib/auth/session";
export default async function LoyaltySettingsPage() {
  await requirePermission("loyalty.configure");
  const settings = await getLoyaltySettings();
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Loyalty"
        title="Earning settings"
        description="Changes apply only to orders delivered after the update."
      />
      <LoyaltySettingsForm settings={settings} />
    </div>
  );
}
