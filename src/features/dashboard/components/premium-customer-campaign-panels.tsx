import { formatMoney } from "@/lib/formatting";
import type { AdminLocale } from "@/lib/i18n/admin-locale";
import { dashboardCopy } from "../dashboard-copy";
import type { DashboardWorkspace } from "../schemas/dashboard-schema";
import { DashboardPanelState } from "./dashboard-panel-state";

type Props = { data: DashboardWorkspace; locale: AdminLocale };

export function PremiumCustomers({ data, locale }: Props) {
  const copy = dashboardCopy(locale);
  const panel = data.customers;
  return (
    <section className="premium-panel">
      <div className="premium-section-heading">
        <h2>{copy.customers}</h2>
      </div>
      {panel.status === "unavailable" ? (
        <DashboardPanelState locale={locale} message={panel.message} />
      ) : (
        <div className="premium-customer-grid">
          <article>
            <span>New</span>
            <strong>{panel.data.newCustomers}</strong>
          </article>
          <article>
            <span>Returning</span>
            <strong>{panel.data.returningCustomers}</strong>
          </article>
          <article>
            <span>Repeat rate</span>
            <strong>{panel.data.repeatRate}%</strong>
          </article>
          <article>
            <span>Average value</span>
            <strong>{formatMoney(panel.data.averageValueMinor, locale)}</strong>
          </article>
          <article>
            <span>Loyalty</span>
            <strong>{panel.data.loyaltyParticipation}%</strong>
          </article>
          <article>
            <span>Frequency</span>
            <strong>{panel.data.purchaseFrequency}×</strong>
          </article>
        </div>
      )}
    </section>
  );
}

export function PremiumCampaigns({ data, locale }: Props) {
  const copy = dashboardCopy(locale);
  const panel = data.campaigns;
  return (
    <section className="premium-panel">
      <div className="premium-section-heading">
        <h2>{copy.campaigns}</h2>
      </div>
      {panel.status === "unavailable" ? (
        <DashboardPanelState locale={locale} message={panel.message} />
      ) : (
        <div className="premium-campaign-list">
          {panel.data.entries.map((campaign) => (
            <article key={campaign.id}>
              <div>
                <strong>{campaign.name}</strong>
                <span className="badge">{campaign.status}</span>
              </div>
              <dl>
                <div>
                  <dt>{copy.revenue}</dt>
                  <dd>{formatMoney(campaign.revenueMinor, locale)}</dd>
                </div>
                <div>
                  <dt>Conversion</dt>
                  <dd>{campaign.conversionRate}%</dd>
                </div>
                <div>
                  <dt>Redemption</dt>
                  <dd>{campaign.redemptionRate}%</dd>
                </div>
                <div>
                  <dt>Return</dt>
                  <dd>{campaign.returnPercent}%</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export function PremiumCustomerCampaignPanels(props: Props) {
  return (
    <div className="premium-two-column">
      <PremiumCustomers {...props} />
      <PremiumCampaigns {...props} />
    </div>
  );
}
