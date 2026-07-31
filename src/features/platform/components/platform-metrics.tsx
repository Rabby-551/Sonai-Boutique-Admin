import type { PlatformOverview } from "../schemas/platform";

export function PlatformMetrics({ overview }: { overview: PlatformOverview }) {
  const ready = overview.services.filter(
    (item) => item.status === "ready",
  ).length;
  const sandbox = overview.integrations.filter(
    (item) => item.environment === "sandbox",
  ).length;
  const passed = overview.releaseGates.filter(
    (item) => item.status === "passed",
  ).length;
  const warnings = overview.migrations.reduce(
    (total, item) => total + item.warnings,
    0,
  );
  const metrics = [
    {
      label: "Ready services",
      value: `${ready}/${overview.services.length}`,
      note: "Fictional staging health",
    },
    {
      label: "Sandbox providers",
      value: String(sandbox),
      note: "No production traffic",
    },
    {
      label: "Release gates passed",
      value: `${passed}/${overview.releaseGates.length}`,
      note: "Human evidence required",
    },
    {
      label: "Migration warnings",
      value: String(warnings),
      note: "Across mock rehearsals",
    },
  ];
  return (
    <section className="cards" aria-label="Platform readiness metrics">
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
