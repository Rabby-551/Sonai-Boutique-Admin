import { PageHeader } from "@/components/ui/page-header";
import {
  listInventory,
  listLocations,
} from "@/features/inventory/server/queries";
import { OrderForm } from "@/features/orders/components/order-form";
import { requirePermission } from "@/lib/auth/session";

export default async function NewOrderPage() {
  await requirePermission("orders.create");
  const [inventory, locations] = await Promise.all([
    listInventory({ pageSize: 1000 }),
    listLocations(),
  ]);
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Manual capture"
        title="Create order"
        description="Prices are read from the current catalog and cannot be overridden."
      />
      <section className="card form-card">
        <OrderForm rows={inventory.items} locations={locations} />
      </section>
    </div>
  );
}
