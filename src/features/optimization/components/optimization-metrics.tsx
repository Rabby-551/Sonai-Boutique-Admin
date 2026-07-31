import type { OptimizationMetric } from "../schemas/optimization";

export function OptimizationMetrics({
  metrics,
}: {
  metrics: OptimizationMetric[];
}) {
  return (
    <section className="cards" aria-label="Optimization metrics">
      {metrics.map((metric) => (
        <article className="card" key={metric.label}>
          <span className="metric-label">{metric.label}</span>
          <strong className="metric-value">{metric.value}</strong>
          <span
            className={
              metric.tone === "warning" ? "text-warning" : "metric-change"
            }
          >
            {metric.note}
          </span>
        </article>
      ))}
    </section>
  );
}
