import { Eye, Files, LockKeyhole, TriangleAlert } from "lucide-react";
import type { AcceptanceWorkspace } from "../schemas/demo";

export function AcceptanceMetrics({
  workspace,
}: {
  workspace: AcceptanceWorkspace;
}) {
  const routes = workspace.routeGroups.reduce(
    (sum, group) => sum + group.routeCount,
    0,
  );
  const metrics = [
    { label: "Route pages inventoried", value: routes, icon: Files },
    {
      label: "Frozen decisions",
      value: workspace.freezeRecords.length,
      icon: LockKeyhole,
    },
    {
      label: "Visual baselines",
      value: workspace.visualCheckpoints.length,
      icon: Eye,
    },
    {
      label: "Known limitations",
      value: workspace.limitations.length,
      icon: TriangleAlert,
    },
  ];
  return (
    <section
      className="metric-grid acceptance-metrics"
      aria-label="Acceptance summary"
    >
      {metrics.map(({ label, value, icon: Icon }) => (
        <article className="metric-card" key={label}>
          <Icon aria-hidden size={20} />
          <span>{label}</span>
          <strong>{value}</strong>
        </article>
      ))}
    </section>
  );
}
