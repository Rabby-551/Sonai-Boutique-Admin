"use client";

import { CircleHelp, TrendingDown, TrendingUp } from "lucide-react";
import { m, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { formatMoney } from "@/lib/formatting";
import type { AdminLocale } from "@/lib/i18n/admin-locale";
import { dashboardCopy } from "../dashboard-copy";
import type { DashboardWorkspace } from "../schemas/dashboard-schema";
import { DashboardPanelState } from "./dashboard-panel-state";

type Panel = DashboardWorkspace["overview"];
type Metric = Extract<Panel, { status: "ready" }>["data"]["metrics"][number];

function Value({ metric, locale }: { metric: Metric; locale: AdminLocale }) {
  const reduce = useReducedMotion();
  const [value, setValue] = useState(metric.value === null ? null : 0);
  useEffect(() => {
    if (
      metric.value === null ||
      reduce ||
      sessionStorage.getItem("sonai-dashboard-counted")
    ) {
      const immediate = requestAnimationFrame(() => setValue(metric.value));
      return () => cancelAnimationFrame(immediate);
    }
    const target = metric.value;
    const started = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const progress = Math.min(1, (now - started) / 650);
      setValue(target * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) frame = requestAnimationFrame(step);
      else sessionStorage.setItem("sonai-dashboard-counted", "1");
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [metric.value, reduce]);
  if (value === null) return <>—</>;
  if (metric.format === "money")
    return <>{formatMoney(Math.round(value), locale)}</>;
  if (metric.format === "percent")
    return (
      <>
        {value.toLocaleString(locale === "bn" ? "bn-BD" : "en-BD", {
          maximumFractionDigits: 1,
        })}
        %
      </>
    );
  return (
    <>{Math.round(value).toLocaleString(locale === "bn" ? "bn-BD" : "en-BD")}</>
  );
}

export function PremiumKpiGrid({
  panel,
  locale,
}: {
  panel: Panel;
  locale: AdminLocale;
}) {
  const copy = dashboardCopy(locale);
  if (panel.status === "unavailable")
    return <DashboardPanelState locale={locale} message={panel.message} />;
  const labels = {
    revenue: copy.revenue,
    orders: copy.orders,
    grossProfit: copy.grossProfit,
    inventoryValue: copy.inventoryValue,
    averageOrderValue: copy.aov,
    deliverySuccess: copy.deliverySuccess,
  };
  return (
    <section aria-labelledby="premium-kpi-title">
      <div className="premium-section-heading">
        <div>
          <span className="eyebrow">
            {copy.updated}{" "}
            {new Date(panel.updatedAt).toLocaleTimeString(
              locale === "bn" ? "bn-BD" : "en-BD",
              { hour: "numeric", minute: "2-digit" },
            )}
          </span>
          <h2 id="premium-kpi-title">{copy.metrics}</h2>
        </div>
      </div>
      <div className="premium-kpi-grid">
        {panel.data.metrics.map((metric, index) => (
          <m.article
            className="premium-kpi-card"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.045 }}
            key={metric.id}
          >
            <div className="premium-kpi-label">
              <span>{labels[metric.id]}</span>
              <button
                aria-label={metric.note}
                title={metric.note}
                type="button"
              >
                <CircleHelp size={16} />
              </button>
            </div>
            <strong
              className={metric.state === "unavailable" ? "is-unavailable" : ""}
            >
              <Value metric={metric} locale={locale} />
            </strong>
            <div className={`premium-kpi-trend ${metric.trend}`}>
              {metric.trend === "up" ? (
                <TrendingUp size={15} />
              ) : metric.trend === "down" ? (
                <TrendingDown size={15} />
              ) : null}
              {metric.comparisonPercent === null
                ? copy.unavailable
                : `${metric.comparisonPercent > 0 ? "+" : ""}${metric.comparisonPercent.toFixed(1)}%`}
            </div>
            <p>{metric.note}</p>
          </m.article>
        ))}
      </div>
    </section>
  );
}
