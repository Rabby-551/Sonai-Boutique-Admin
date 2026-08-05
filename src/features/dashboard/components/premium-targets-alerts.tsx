import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import type { AdminLocale } from "@/lib/i18n/admin-locale";
import { dashboardCopy } from "../dashboard-copy";
import type { DashboardWorkspace } from "../schemas/dashboard-schema";
import { DashboardPanelState } from "./dashboard-panel-state";

type Props = { data: DashboardWorkspace; locale: AdminLocale };

export function PremiumTargets({ data, locale }: Props) {
  const copy = dashboardCopy(locale);
  const panel = data.targets;
  return (
    <section className="premium-panel">
      <div className="premium-section-heading">
        <h2>{copy.targets}</h2>
      </div>
      {panel.status === "unavailable" ? (
        <DashboardPanelState locale={locale} message={panel.message} />
      ) : (
        <div className="premium-target-grid">
          {panel.data.map((target) => {
            const progress = Math.min(
              100,
              (target.actual / target.target) * 100,
            );
            return (
              <article className="premium-target" key={target.id}>
                <svg viewBox="0 0 44 44" aria-hidden="true">
                  <circle cx="22" cy="22" r="17" />
                  <circle
                    className="premium-target-progress"
                    cx="22"
                    cy="22"
                    r="17"
                    pathLength="100"
                    strokeDasharray={`${progress} 100`}
                  />
                </svg>
                <div>
                  <strong>{progress.toFixed(0)}%</strong>
                  <span>{target.id}</span>
                  <small>{target.remainingLabel}</small>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export function PremiumAlerts({ data, locale }: Props) {
  const copy = dashboardCopy(locale);
  const panel = data.alerts;
  return (
    <section className="premium-panel">
      <div className="premium-section-heading">
        <h2>{copy.attention}</h2>
      </div>
      {panel.status === "unavailable" ? (
        <DashboardPanelState locale={locale} message={panel.message} />
      ) : (
        <div className="premium-alert-list">
          {panel.data.map((alert) => (
            <article
              className={`premium-alert ${alert.severity}`}
              key={alert.id}
            >
              <AlertTriangle size={18} />
              <div>
                <strong>{alert.title}</strong>
                <p>{alert.detail}</p>
                <small>{alert.ageLabel}</small>
              </div>
              <Link href={alert.href}>
                {alert.actionLabel}
                <ArrowRight size={14} />
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export function PremiumTargetsAlerts(props: Props) {
  return (
    <div className="premium-two-column">
      <PremiumTargets {...props} />
      <PremiumAlerts {...props} />
    </div>
  );
}
