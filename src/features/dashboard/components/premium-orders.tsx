"use client";

import { Download, Save } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { AdminLocale } from "@/lib/i18n/admin-locale";
import { dashboardCopy } from "../dashboard-copy";
import type { DashboardWorkspace } from "../schemas/dashboard-schema";
import { DashboardPanelState } from "./dashboard-panel-state";
import { PremiumOrderControls } from "./premium-order-controls";
import { PremiumOrdersTable, type OrderColumn } from "./premium-orders-table";

type Panel = DashboardWorkspace["orders"];

export function PremiumOrders({
  panel,
  locale,
}: {
  panel: Panel;
  locale: AdminLocale;
}) {
  const copy = dashboardCopy(locale);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [columns, setColumns] = useState<Set<OrderColumn>>(
    new Set(["customer", "channel", "location", "payment", "updated"]),
  );
  const navigate = (changes: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => params.set(key, value));
    router.push(`/dashboard?${params}`);
  };
  const toggleColumn = (column: OrderColumn) =>
    setColumns((current) => {
      const next = new Set(current);
      if (next.has(column)) next.delete(column);
      else next.add(column);
      return next;
    });
  const loadView = () => {
    const saved = localStorage.getItem("sonai-dashboard-order-view");
    if (!saved) return;
    const values = JSON.parse(saved) as Record<string, string>;
    router.push(`/dashboard?${new URLSearchParams(values)}`);
  };
  if (panel.status === "unavailable")
    return (
      <section className="premium-panel">
        <h2>{copy.recentOrders}</h2>
        <DashboardPanelState locale={locale} message={panel.message} />
      </section>
    );
  const data = panel.data;
  return (
    <section
      className="premium-panel premium-orders-panel"
      aria-labelledby="premium-orders-title"
    >
      <div className="premium-section-heading">
        <div>
          <span className="eyebrow">
            {data.totalItems} {copy.orders}
          </span>
          <h2 id="premium-orders-title">{copy.recentOrders}</h2>
        </div>
        <div className="premium-heading-actions">
          <button
            className="button secondary"
            onClick={() =>
              localStorage.setItem(
                "sonai-dashboard-order-view",
                JSON.stringify(Object.fromEntries(searchParams)),
              )
            }
            type="button"
          >
            <Save size={16} />
            {copy.saveView}
          </button>
          <button className="button secondary" onClick={loadView} type="button">
            {copy.loadView}
          </button>
          <a
            className="button secondary"
            href={`/api/dashboard/export?view=orders&${searchParams}`}
          >
            <Download size={16} />
            {copy.export}
          </a>
        </div>
      </div>
      <PremiumOrderControls
        columns={columns}
        data={data}
        locale={locale}
        onNavigate={navigate}
        onToggleColumn={toggleColumn}
        searchParams={searchParams}
      />
      {data.items.length === 0 ? (
        <DashboardPanelState
          locale={locale}
          message={panel.status === "empty" ? panel.message : copy.noData}
        />
      ) : (
        <PremiumOrdersTable
          columns={columns}
          items={data.items}
          locale={locale}
        />
      )}
      <nav className="premium-pagination" aria-label="Order pages">
        <button
          className="button secondary"
          disabled={data.page <= 1}
          onClick={() => navigate({ orderPage: String(data.page - 1) })}
          type="button"
        >
          {copy.previous}
        </button>
        <span>
          {data.page} / {Math.max(1, data.totalPages)}
        </span>
        <button
          className="button secondary"
          disabled={data.page >= data.totalPages}
          onClick={() => navigate({ orderPage: String(data.page + 1) })}
          type="button"
        >
          {copy.next}
        </button>
      </nav>
    </section>
  );
}
