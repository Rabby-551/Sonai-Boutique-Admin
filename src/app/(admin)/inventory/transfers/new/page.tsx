import { PageHeader } from "@/components/ui/page-header";
import { TransferForm } from "@/features/inventory/components/transfer-form";
import {
  listInventory,
  listLocations,
} from "@/features/inventory/server/queries";
import { requirePermission } from "@/lib/auth/session";

export default async function NewTransferPage() {
  await requirePermission("inventory.transfer");
  const [inventory, locations] = await Promise.all([
    listInventory({ pageSize: 1000 }),
    listLocations(),
  ]);
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Inventory operations"
        title="Create transfer"
        description="Create a reviewed draft before stock leaves the source location."
      />
      <section className="card form-card">
        <TransferForm rows={inventory.items} locations={locations} />
      </section>
    </div>
  );
}
