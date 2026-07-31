import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { TransferControls } from "@/features/inventory/components/transfer-controls";
import {
  getTransfer,
  listInventory,
  listLocations,
} from "@/features/inventory/server/queries";
import { can } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";

export default async function TransferPage({
  params,
}: {
  params: Promise<{ transferId: string }>;
}) {
  const { transferId } = await params;
  const [transfer, locations, inventory, user] = await Promise.all([
    getTransfer(transferId),
    listLocations(),
    listInventory({ pageSize: 1000 }),
    getCurrentUser(),
  ]);
  if (!transfer) notFound();
  const names = new Map(
    locations.map((location) => [location.id, location.name]),
  );
  const variants = new Map(inventory.items.map((row) => [row.variantId, row]));
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Stock transfer"
        title={transfer.id}
        description={`${names.get(transfer.sourceLocationId)} → ${names.get(transfer.destinationLocationId)}`}
        action={<StatusBadge status={transfer.status} />}
      />
      <section className="card table-card">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {transfer.lines.map((line) => (
                <tr key={line.variantId}>
                  <td>{variants.get(line.variantId)?.sku ?? line.variantId}</td>
                  <td>
                    {variants.get(line.variantId)?.productName ?? "Unknown"}
                  </td>
                  <td>{line.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {transfer.note && (
        <section className="card detail-panel">
          <h2>Transfer note</h2>
          <p>{transfer.note}</p>
        </section>
      )}
      {can(user.role, "inventory.transfer") && (
        <TransferControls transfer={transfer} />
      )}
    </div>
  );
}
