"use client";

import { Download, Maximize2, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { formatMoney } from "@/lib/formatting";
import type { AdminLocale } from "@/lib/i18n/admin-locale";
import { dashboardCopy } from "../dashboard-copy";
import type { DashboardWorkspace } from "../schemas/dashboard-schema";
import { DashboardPanelState } from "./dashboard-panel-state";
import {
  PremiumRevenueVisual,
  type RevenueSeries,
} from "./premium-revenue-visual";

type Panel = DashboardWorkspace["revenue"];
export function PremiumRevenueChart({
  panel,
  locale,
}: {
  panel: Panel;
  locale: AdminLocale;
}) {
  const copy = dashboardCopy(locale);
  const searchParams = useSearchParams();
  const dialog = useRef<HTMLDialogElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [visible, setVisible] = useState<Set<RevenueSeries>>(
    new Set(["revenue", "profit", "orders", "previous"]),
  );
  if (panel.status === "unavailable")
    return (
      <section className="premium-panel premium-chart-panel">
        <h2>{copy.performance}</h2>
        <DashboardPanelState locale={locale} message={panel.message} />
      </section>
    );
  const toggle = (series: RevenueSeries) =>
    setVisible((current) => {
      const next = new Set(current);
      if (next.has(series)) next.delete(series);
      else next.add(series);
      return next;
    });
  const controls = (
    <div className="premium-series-controls">
      {(["revenue", "profit", "orders", "previous"] as const).map((series) => (
        <button
          aria-pressed={visible.has(series)}
          key={series}
          onClick={() => toggle(series)}
          type="button"
        >
          {series}
        </button>
      ))}
    </div>
  );
  const content = (
    <>
      <PremiumRevenueVisual
        data={panel.data}
        locale={locale}
        visible={visible}
      />
      <details className="premium-chart-summary">
        <summary>
          {locale === "bn" ? "সহায়ক ডেটা টেবিল" : "Accessible data table"}
        </summary>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Period</th>
                <th>{copy.revenue}</th>
                <th>{copy.grossProfit}</th>
                <th>{copy.orders}</th>
              </tr>
            </thead>
            <tbody>
              {panel.data.map((point) => (
                <tr key={point.label}>
                  <td>{point.label}</td>
                  <td>{formatMoney(point.revenueMinor, locale)}</td>
                  <td>
                    {point.profitMinor === null
                      ? "—"
                      : formatMoney(point.profitMinor, locale)}
                  </td>
                  <td>{point.orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </>
  );
  return (
    <section
      className="premium-panel premium-chart-panel"
      aria-labelledby="revenue-intelligence-title"
    >
      <div className="premium-section-heading">
        <div>
          <span className="eyebrow">{copy.intelligence}</span>
          <h2 id="revenue-intelligence-title">{copy.performance}</h2>
        </div>
        <div className="premium-heading-actions">
          <a
            className="button secondary"
            href={`/api/dashboard/export?view=summary&${searchParams}`}
          >
            <Download size={16} />
            {copy.download}
          </a>
          <button
            className="button secondary"
            onClick={() => {
              setFullscreen(true);
              requestAnimationFrame(() => dialog.current?.showModal());
            }}
            type="button"
          >
            <Maximize2 size={16} />
            {copy.fullScreen}
          </button>
        </div>
      </div>
      {controls}
      {content}
      <dialog
        className="premium-chart-dialog"
        onClose={() => setFullscreen(false)}
        ref={dialog}
      >
        <div className="premium-drawer-heading">
          <strong>{copy.performance}</strong>
          <button
            aria-label={copy.close}
            onClick={() => {
              dialog.current?.close();
              setFullscreen(false);
            }}
            type="button"
          >
            <X />
          </button>
        </div>
        {fullscreen ? content : null}
      </dialog>
    </section>
  );
}
