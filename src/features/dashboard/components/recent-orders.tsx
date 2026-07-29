import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatMoney } from "@/lib/formatting";
import type { DashboardSummary } from "../schemas/dashboard-schema";
export function RecentOrders({
  orders,
}: {
  orders: DashboardSummary["recentOrders"];
}) {
  return (
    <section className="card table-card" style={{ marginTop: 20 }}>
      <div className="section-title" style={{ padding: 20, margin: 0 }}>
        <div>
          <div className="eyebrow">Recent activity</div>
          <h2>Recent orders</h2>
        </div>
        <Link className="button secondary" href="/orders">
          View all orders
        </Link>
      </div>
      {orders.length ? (
        <div className="table-scroll">
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
                  <td>{order.id}</td>
                  <td>{order.customer}</td>
                  <td>{order.channel}</td>
                  <td>{formatMoney(order.totalMinor)}</td>
                  <td>{order.payment}</td>
                  <td>
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
    </section>
  );
}
