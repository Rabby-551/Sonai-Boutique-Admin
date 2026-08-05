"use client";

import { formatMoney } from "@/lib/formatting";
import { useAdminLocale } from "@/components/i18n/admin-locale-provider";
import type { DashboardSummary } from "../schemas/dashboard-schema";
import { RevenueChartVisual } from "./revenue-chart-visual";

export function RevenueChart({ summary }: { summary: DashboardSummary }) {
  const { locale, dictionary } = useAdminLocale();
  const copy = dictionary.dashboard;
  const highest = Math.max(
    ...summary.trend.map((point) => point.revenueMinor),
    1,
  );
  const accessibleValues = summary.trend
    .map((point) => `${point.label} ${formatMoney(point.revenueMinor, locale)}`)
    .join(", ");

  return (
    <section className="card dashboard-chart-card">
      <div className="section-title">
        <div>
          <div className="eyebrow">{copy.revenueTrend}</div>
          <h2>{copy.filteredPerformance}</h2>
        </div>
        <span className="chart-peak">
          <small>{copy.peak}</small>
          <strong>{formatMoney(highest, locale)}</strong>
        </span>
      </div>
      <p className="sr-only">
        {copy.values}: {accessibleValues}.
      </p>
      <RevenueChartVisual data={summary.trend} />
    </section>
  );
}
