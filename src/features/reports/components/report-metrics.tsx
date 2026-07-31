import { formatMoney } from "@/lib/formatting";
import type { ReportResult } from "../schemas/reports";
export function ReportMetrics({
  metrics,
}: {
  metrics: ReportResult["metrics"];
}) {
  return (
    <div className="metric-grid">
      {metrics.map((item) => (
        <article className="metric-card" key={item.label}>
          <span>{item.label}</span>
          <strong>
            {item.format === "money"
              ? formatMoney(item.value)
              : item.format === "percent"
                ? `${item.value}%`
                : item.value.toLocaleString("en-BD")}
          </strong>
        </article>
      ))}
    </div>
  );
}
