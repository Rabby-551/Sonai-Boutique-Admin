import { formatMoney } from "@/lib/formatting";
import type { DashboardSummary } from "../schemas/dashboard-schema";
import { RevenueChartVisual } from "./revenue-chart-visual";

export function RevenueChart({ summary }: { summary: DashboardSummary }) {
  const highest = Math.max(
    ...summary.trend.map((point) => point.revenueMinor),
    1,
  );
  const accessibleValues = summary.trend
    .map((point) => `${point.label} ${formatMoney(point.revenueMinor)}`)
    .join(", ");

  return (
    <section className="card dashboard-chart-card">
      <div className="section-title">
        <div>
          <div className="eyebrow">Revenue trend</div>
          <h2>Filtered performance</h2>
        </div>
        <span className="chart-peak">
          <small>Peak</small>
          <strong>{formatMoney(highest)}</strong>
        </span>
      </div>
      <p className="sr-only">
        {summary.summary} Values: {accessibleValues}.
      </p>
      <RevenueChartVisual data={summary.trend} />
    </section>
  );
}
