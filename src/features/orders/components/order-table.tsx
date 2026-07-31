import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatMoney } from "@/lib/formatting";
import type { Order } from "../schemas/orders";
import { maskPhone } from "../utils/mask-contact";

export function OrderTable({ orders }: { orders: readonly Order[] }) {
  return (
    <section className="card table-card">
      <div className="table-scroll responsive-record-table">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Source</th>
              <th>Location</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td data-label="Order">
                  <strong>{order.orderNumber}</strong>
                  <small>
                    {new Date(order.createdAt).toLocaleDateString("en-BD")}
                  </small>
                </td>
                <td data-label="Customer">
                  {order.customer.name}
                  <small>{maskPhone(order.customer.phone)}</small>
                </td>
                <td data-label="Source">{order.source}</td>
                <td data-label="Location">
                  {order.fulfillmentLocationId?.replace("loc-", "") ??
                    "Unassigned"}
                </td>
                <td data-label="Total">{formatMoney(order.totalMinor)}</td>
                <td data-label="Payment">
                  <StatusBadge status={order.paymentStatus} />
                </td>
                <td data-label="Status">
                  <StatusBadge status={order.status} />
                </td>
                <td data-label="Action">
                  <Link className="table-link" href={`/orders/${order.id}`}>
                    Open
                  </Link>
                </td>
              </tr>
            ))}
            {!orders.length && (
              <tr>
                <td colSpan={8}>
                  <div className="empty-inline">
                    No orders match these filters.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
