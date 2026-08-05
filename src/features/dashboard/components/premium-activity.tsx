import Link from "next/link";
import type { AdminLocale } from "@/lib/i18n/admin-locale";
import { dashboardCopy } from "../dashboard-copy";
import type { DashboardWorkspace } from "../schemas/dashboard-schema";
import { DashboardPanelState } from "./dashboard-panel-state";

export function PremiumActivity({
  panel,
  locale,
}: {
  panel: DashboardWorkspace["activity"];
  locale: AdminLocale;
}) {
  const copy = dashboardCopy(locale);
  return (
    <section className="premium-panel premium-activity-panel">
      <div className="premium-section-heading">
        <h2>{copy.activity}</h2>
      </div>
      {panel.status === "unavailable" ? (
        <DashboardPanelState locale={locale} message={panel.message} />
      ) : (
        <ol className="premium-activity-list">
          {panel.data.map((event) => (
            <li key={event.id}>
              <span className="premium-activity-dot" aria-hidden="true" />
              <div>
                <Link href={event.href}>{event.action}</Link>
                <small>
                  {event.actor} ·{" "}
                  {new Date(event.timestamp).toLocaleString(
                    locale === "bn" ? "bn-BD" : "en-BD",
                    {
                      timeZone: "Asia/Dhaka",
                      dateStyle: "medium",
                      timeStyle: "short",
                    },
                  )}
                </small>
              </div>
              <span className="badge">{event.type}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
