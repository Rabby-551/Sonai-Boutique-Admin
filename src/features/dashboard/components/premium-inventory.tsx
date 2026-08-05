import { formatMoney } from "@/lib/formatting";
import type { AdminLocale } from "@/lib/i18n/admin-locale";
import { dashboardCopy } from "../dashboard-copy";
import type { DashboardWorkspace } from "../schemas/dashboard-schema";
import { DashboardPanelState } from "./dashboard-panel-state";

export function PremiumInventory({
  panel,
  locale,
}: {
  panel: DashboardWorkspace["inventory"];
  locale: AdminLocale;
}) {
  const copy = dashboardCopy(locale);
  return (
    <section className="premium-panel premium-inventory">
      <div className="premium-section-heading">
        <h2>{copy.inventory}</h2>
      </div>
      {panel.status === "unavailable" ? (
        <DashboardPanelState locale={locale} message={panel.message} />
      ) : (
        <>
          <div className="premium-inventory-bands">
            {panel.data.bands.map((band) => (
              <article key={band.id}>
                <span>{band.id}</span>
                <strong>{band.count}</strong>
                <small>{formatMoney(band.valueMinor, locale)}</small>
              </article>
            ))}
          </div>
          <dl className="premium-stat-strip">
            <div>
              <dt>Turnover</dt>
              <dd>{panel.data.turnover}×</dd>
            </div>
            <div>
              <dt>Dead stock</dt>
              <dd>{formatMoney(panel.data.deadStockMinor, locale)}</dd>
            </div>
            <div>
              <dt>Days remaining</dt>
              <dd>{panel.data.daysRemaining}</dd>
            </div>
            <div>
              <dt>Reorder</dt>
              <dd>{panel.data.reorderCount}</dd>
            </div>
            <div>
              <dt>Transfers</dt>
              <dd>{panel.data.transferCount}</dd>
            </div>
          </dl>
        </>
      )}
    </section>
  );
}
