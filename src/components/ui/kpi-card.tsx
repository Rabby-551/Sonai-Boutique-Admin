import type { LucideIcon } from "lucide-react";

export function KpiCard({
  label,
  value,
  note,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  note: string;
  icon: LucideIcon;
  tone?: "positive" | "neutral" | "attention";
}) {
  return (
    <article className="card kpi-card">
      <div className="kpi-card-heading">
        <span className="metric-label">{label}</span>
        <span className="kpi-icon" aria-hidden>
          <Icon size={17} />
        </span>
      </div>
      <strong className="metric-value">{value}</strong>
      <span className={`metric-change ${tone}`}>{note}</span>
    </article>
  );
}
