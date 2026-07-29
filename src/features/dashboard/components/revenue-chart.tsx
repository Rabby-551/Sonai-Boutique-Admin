import { formatMoney } from "@/lib/formatting";
import type { DashboardSummary } from "../schemas/dashboard-schema";
export function RevenueChart({ summary }: { summary: DashboardSummary }) {
  const highest = Math.max(
    ...summary.trend.map((point) => point.revenueMinor),
    1,
  );
  return (
    <section className="card">
      <div className="section-title">
        <div>
          <div className="eyebrow">Revenue trend</div>
          <h2>Filtered performance</h2>
        </div>
      </div>
      <p className="sr-only">
        {summary.summary} Peak revenue is {formatMoney(highest)}.
      </p>
      <div
        className="bars"
        role="img"
        aria-label={`${summary.summary} Values: ${summary.trend.map((point) => `${point.label} ${formatMoney(point.revenueMinor)}`).join(", ")}.`}
      >
        {summary.trend.map((point) => (
          <div className="bar-wrap" key={point.label}>
            <div
              className="bar"
              title={formatMoney(point.revenueMinor)}
              style={{
                height: `${Math.max(8, (point.revenueMinor / highest) * 100)}%`,
              }}
            />
            <span style={{ marginTop: 8 }}>{point.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
