import Link from "next/link";
import { TableShell } from "@/components/ui/table-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatMoney } from "@/lib/formatting";
import type { DashboardSummary } from "../schemas/dashboard-schema";

export function RecentOrders({
  orders,
}: {
  orders: DashboardSummary["recentOrders"];
}) {
  return (
    <TableShell
      actions={
        <Link className="button secondary" href="/orders">
          View all orders
        </Link>
      }
      className="recent-orders-card"
      eyebrow="Recent activity"
      title="Recent orders"
    >
      {orders.length ? (
        <div className="table-scroll responsive-record-table">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Channel</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td data-label="Order">{order.id}</td>
                  <td data-label="Customer">{order.customer}</td>
                  <td data-label="Channel">{order.channel}</td>
                  <td data-label="Total">{formatMoney(order.totalMinor)}</td>
                  <td data-label="Payment">{order.payment}</td>
                  <td data-label="Status">
                    <StatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty">No orders in this filtered period.</div>
      )}
    </TableShell>
  );
}
