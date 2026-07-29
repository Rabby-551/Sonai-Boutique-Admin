import { formatMoney } from "@/lib/formatting";
import type { DashboardSummary } from "../schemas/dashboard-schema";
export function KpiGrid({ summary }: { summary: DashboardSummary }) {
  const metrics = [
    {
      label: "Revenue",
      value: formatMoney(summary.revenueMinor),
      note: "+12.4% vs previous period",
    },
    {
      label: "Orders",
      value: summary.orders.toLocaleString("en-BD"),
      note: "94.2% delivery success",
    },
    {
      label: "Gross profit",
      value: formatMoney(summary.profitMinor),
      note: "37.6% margin",
    },
    {
      label: "Inventory value",
      value: formatMoney(summary.inventoryMinor),
      note: "Current filtered scope",
    },
  ];
  return (
    <section className="cards" aria-label="Business metrics">
      {metrics.map((metric) => (
        <article className="card" key={metric.label}>
          <span className="metric-label">{metric.label}</span>
          <strong className="metric-value">{metric.value}</strong>
          <span className="metric-change">{metric.note}</span>
        </article>
      ))}
    </section>
  );
}
