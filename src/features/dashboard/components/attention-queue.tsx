import Link from "next/link";
import { AlertTriangle, CircleAlert, Info } from "lucide-react";
import type { DashboardSummary } from "../schemas/dashboard-schema";
export function AttentionQueue({
  alerts,
}: {
  alerts: DashboardSummary["alerts"];
}) {
  const icons = { critical: CircleAlert, warning: AlertTriangle, info: Info };
  return (
    <section className="card">
      <div className="section-title">
        <div>
          <div className="eyebrow">Attention queue</div>
          <h2>What needs action</h2>
        </div>
      </div>
      {alerts.length ? (
        alerts.map((alert) => {
          const Icon = icons[alert.severity];
          return (
            <Link className="attention-item" href={alert.href} key={alert.id}>
              <Icon aria-hidden size={20} />
              <span>
                <strong>{alert.title}</strong>
                <small>{alert.detail}</small>
              </span>
            </Link>
          );
        })
      ) : (
        <div className="empty-inline">No operational alerts in this scope.</div>
      )}
    </section>
  );
}
