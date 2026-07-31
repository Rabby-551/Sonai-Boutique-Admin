import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/formatting";
import type { StockMovement } from "../schemas/inventory";

export function MovementTable({
  movements,
  skuByVariant,
}: {
  movements: readonly StockMovement[];
  skuByVariant: Record<string, string>;
}) {
  return (
    <section className="card table-card">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>SKU</th>
              <th>Location</th>
              <th>Type</th>
              <th>On hand</th>
              <th>Reserved</th>
              <th>Reference</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((movement) => (
              <tr key={movement.id}>
                <td>{formatDate(movement.occurredAt)}</td>
                <td>
                  {skuByVariant[movement.variantId] ?? movement.variantId}
                </td>
                <td>{movement.locationId.replace("loc-", "")}</td>
                <td>
                  <StatusBadge status={movement.type} />
                </td>
                <td>
                  {movement.onHandDelta > 0 ? "+" : ""}
                  {movement.onHandDelta}
                </td>
                <td>
                  {movement.reservedDelta > 0 ? "+" : ""}
                  {movement.reservedDelta}
                </td>
                <td>{movement.referenceId}</td>
                <td>{movement.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
