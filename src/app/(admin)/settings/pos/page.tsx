import { PageHeader } from "@/components/ui/page-header";
import { PosSettingsPanel } from "@/features/pos/components/pos-settings-panel";
import { getPosSettingsWorkspace } from "@/features/pos/server/queries";

export default async function PosSettingsPage() {
  const workspace = await getPosSettingsWorkspace();
  return (
    <div className="stack">
      <PageHeader
        eyebrow="POS configuration"
        title="Stores, registers and payment channels"
        description="Configure physical counters and the bank or MFS choices available to cashiers."
      />
      <PosSettingsPanel
        locations={workspace.locations}
        providers={workspace.providers}
        registers={workspace.registers}
      />
    </div>
  );
}
