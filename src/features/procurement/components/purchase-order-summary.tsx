import { formatMoney } from "@/lib/formatting";
import type { PurchaseOrder, Supplier } from "../schemas/procurement";
export function PurchaseOrderSummary({
  order,
  supplier,
}: {
  order: PurchaseOrder;
  supplier: Supplier | null;
}) {
  return (
    <div className="grid-2 balanced">
      <section className="card detail-panel">
        <span className="eyebrow">Supplier</span>
        <h2>{supplier?.name ?? order.supplierId}</h2>
        <dl className="detail-list">
          <div>
            <dt>Destination</dt>
            <dd>{order.destinationLocationId.replace("loc-", "")}</dd>
          </div>
          <div>
            <dt>Expected</dt>
            <dd>{order.expectedDeliveryDate}</dd>
          </div>
          <div>
            <dt>Supplier ref</dt>
            <dd>{order.supplierReference ?? "—"}</dd>
          </div>
          <div>
            <dt>Shipment ref</dt>
            <dd>{order.shipmentReference ?? "—"}</dd>
          </div>
        </dl>
      </section>
      <section className="card detail-panel">
        <span className="eyebrow">Commercial summary</span>
        <h2>{formatMoney(order.totalMinor)}</h2>
        <dl className="detail-list">
          <div>
            <dt>Subtotal</dt>
            <dd>{formatMoney(order.subtotalMinor)}</dd>
          </div>
          <div>
            <dt>Shipping</dt>
            <dd>{formatMoney(order.shippingMinor)}</dd>
          </div>
          <div>
            <dt>Other</dt>
            <dd>{formatMoney(order.otherMinor)}</dd>
          </div>
          <div>
            <dt>Receipts</dt>
            <dd>{order.receipts.length}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
