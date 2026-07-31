import { PageHeader } from "@/components/ui/page-header";
import { AdjustmentForm } from "@/features/inventory/components/adjustment-form";
import {
  listInventory,
  listLocations,
} from "@/features/inventory/server/queries";
import { requirePermission } from "@/lib/auth/session";

export default async function NewMovementPage({
  searchParams,
}: {
  searchParams: Promise<{ variantId?: string }>;
}) {
  const { variantId } = await searchParams;
  await requirePermission("inventory.adjust");
  const [inventory, locations] = await Promise.all([
    listInventory({ pageSize: 1000 }),
    listLocations(),
  ]);
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Inventory command"
        title="Record stock movement"
        description="Receipts, adjustments, damage and returns update balances with an audit record."
      />
      <section className="card form-card">
        <AdjustmentForm
          rows={inventory.items}
          locations={locations}
          initialVariantId={variantId}
        />
      </section>
    </div>
  );
}
