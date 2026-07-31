import {
  CheckCircle2,
  ClipboardList,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import type { DemoWorkspace } from "../schemas/demo";

export function DemoMetrics({ workspace }: { workspace: DemoWorkspace }) {
  const passed = workspace.checks.filter(
    (item) => item.status === "passed",
  ).length;
  const metrics = [
    {
      label: "Guided scenarios",
      value: workspace.scenarios.length,
      icon: ClipboardList,
    },
    { label: "Role guides", value: workspace.roles.length, icon: UsersRound },
    { label: "Automated evidence", value: passed, icon: CheckCircle2 },
    { label: "Live provider calls", value: 0, icon: ShieldCheck },
  ];
  return (
    <section className="metric-grid" aria-label="Demo release summary">
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
