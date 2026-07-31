import { StatusBadge } from "@/components/ui/status-badge";
import { formatMoney } from "@/lib/formatting";
import type { InventoryLocation } from "@/features/inventory/schemas/inventory";
import type { Order } from "../schemas/orders";
import { maskEmail, maskPhone } from "../utils/mask-contact";

export function OrderSummary({
  order,
  locations,
  revealContact,
}: {
  order: Order;
  locations: readonly InventoryLocation[];
  revealContact: boolean;
}) {
  const location = locations.find(
    (item) => item.id === order.fulfillmentLocationId,
  );
  return (
    <div className="grid-2 balanced">
      <section className="card detail-panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Customer</span>
            <h2>{order.customer.name}</h2>
          </div>
          <StatusBadge status={order.source} />
        </div>
        <dl className="detail-list">
          <div>
            <dt>Phone</dt>
            <dd>
              {revealContact
                ? order.customer.phone
                : maskPhone(order.customer.phone)}
            </dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>
              {revealContact
                ? (order.customer.email ?? "—")
                : maskEmail(order.customer.email)}
            </dd>
          </div>
          <div>
            <dt>Fulfillment</dt>
            <dd>{location?.name ?? "Unassigned"}</dd>
          </div>
          <div>
            <dt>Address</dt>
            <dd>{order.deliveryAddress ?? "Branch pickup"}</dd>
          </div>
        </dl>
      </section>
      <section className="card detail-panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Payment</span>
            <h2>{formatMoney(order.totalMinor)}</h2>
          </div>
          <StatusBadge status={order.paymentStatus} />
        </div>
        <dl className="detail-list">
          <div>
            <dt>Subtotal</dt>
            <dd>{formatMoney(order.subtotalMinor)}</dd>
          </div>
          <div>
            <dt>Delivery</dt>
            <dd>{formatMoney(order.deliveryMinor)}</dd>
          </div>
          <div>
            <dt>Method</dt>
            <dd>{order.paymentMethod}</dd>
          </div>
          <div>
            <dt>Attempts</dt>
            <dd>{order.payments.length}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
