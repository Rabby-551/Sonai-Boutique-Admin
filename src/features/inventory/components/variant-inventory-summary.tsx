import { formatMoney } from "@/lib/formatting";
import type { InventoryLocation, InventoryRow } from "../schemas/inventory";

export function VariantInventorySummary({
  row,
  locations,
}: {
  row: InventoryRow;
  locations: readonly InventoryLocation[];
}) {
  return (
    <>
      <section className="metric-grid">
        {locations.map((location) => {
          const balance = row.locations[location.id];
          return (
            <article className="card metric-card" key={location.id}>
              <span>{location.name}</span>
              <strong>{balance.onHand - balance.reserved}</strong>
              <small>
                {balance.onHand} on hand · {balance.reserved} reserved
              </small>
            </article>
          );
        })}
      </section>
      <section className="card detail-panel">
        <h2>Stock summary</h2>
        <dl className="detail-list">
          <div>
            <dt>Consolidated available</dt>
            <dd>{row.totalAvailable}</dd>
          </div>
          <div>
            <dt>Stock valuation</dt>
            <dd>{formatMoney(row.valuationMinor)}</dd>
          </div>
          <div>
            <dt>Default threshold</dt>
            <dd>{row.threshold}</dd>
          </div>
          <div>
            <dt>Barcode</dt>
            <dd>{row.barcode}</dd>
          </div>
        </dl>
      </section>
    </>
  );
}
