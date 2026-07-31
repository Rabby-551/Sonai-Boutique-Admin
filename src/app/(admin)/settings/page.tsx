import { PageHeader } from "@/components/ui/page-header";
import { SettingsForm } from "@/features/administration/components/settings-form";
import { getBusinessSettings } from "@/features/administration/server/queries";
import { listLocations } from "@/features/inventory/server/queries";
import { requirePermission } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
export default async function SettingsPage() {
  const current = await requirePermission("settings.view");
  const [settings, locations] = await Promise.all([
    getBusinessSettings(),
    listLocations(),
  ]);
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Configuration"
        title="Settings"
        description="Global mock business defaults with optimistic concurrency and audit history."
      />
      <SettingsForm
        settings={settings}
        locations={[...locations]}
        editable={can(current.role, "settings.manage")}
      />
    </div>
  );
}
