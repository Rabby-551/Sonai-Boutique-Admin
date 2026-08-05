"use client";

import Link from "next/link";
import { TableShell } from "@/components/ui/table-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAdminLocale } from "@/components/i18n/admin-locale-provider";
import { formatMoney } from "@/lib/formatting";
import { localizeAdminTerm } from "@/lib/i18n/admin-locale";
import type { DashboardSummary } from "../schemas/dashboard-schema";

export function RecentOrders({
  orders,
}: {
  orders: DashboardSummary["recentOrders"];
}) {
  const { locale, dictionary } = useAdminLocale();
  const copy = dictionary.dashboard;
  return (
    <TableShell
      actions={
        <Link className="button secondary" href="/orders">
          {copy.viewAllOrders}
        </Link>
      }
      className="recent-orders-card"
      eyebrow={copy.recentActivity}
      title={copy.recentOrders}
    >
      {orders.length ? (
        <div className="table-scroll responsive-record-table">
          <table>
            <thead>
              <tr>
                <th>{copy.order}</th>
                <th>{copy.customer}</th>
                <th>{copy.channel}</th>
                <th>{copy.total}</th>
                <th>{copy.payment}</th>
                <th>{copy.status}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td data-label={copy.order}>{order.id}</td>
                  <td data-label={copy.customer}>{order.customer}</td>
                  <td data-label={copy.channel}>
                    {localizeAdminTerm(order.channel, locale)}
                  </td>
                  <td data-label={copy.total}>
                    {formatMoney(order.totalMinor, locale)}
                  </td>
                  <td data-label={copy.payment}>
                    {localizeAdminTerm(order.payment, locale)}
                  </td>
                  <td data-label={copy.status}>
                    <StatusBadge
                      label={localizeAdminTerm(order.status, locale)}
                      status={order.status}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty">{copy.noOrders}</div>
      )}
    </TableShell>
  );
}
