import { formatMoney } from "@/lib/formatting";
import type { AdminLocale } from "@/lib/i18n/admin-locale";
import { dashboardCopy } from "../dashboard-copy";
import type { DashboardWorkspace } from "../schemas/dashboard-schema";
import { DashboardPanelState } from "./dashboard-panel-state";

type Props = { data: DashboardWorkspace; locale: AdminLocale };
const bnStages: Record<string, string> = {
  confirmed: "নিশ্চিত",
  packed: "প্যাক করা",
  shipped: "পাঠানো",
  delivered: "ডেলিভারি",
  returned: "ফেরত",
  cancelled: "বাতিল",
};

export function PremiumFulfillment({ data, locale }: Props) {
  const copy = dashboardCopy(locale);
  const panel = data.fulfillment;
  return (
    <section className="premium-panel">
      <div className="premium-section-heading">
        <h2>{copy.fulfilment}</h2>
      </div>
      {panel.status === "unavailable" ? (
        <DashboardPanelState locale={locale} message={panel.message} />
      ) : (
        <div className="premium-stage-list">
          {panel.data.map((stage) => (
            <article key={stage.id}>
              <div>
                <strong>
                  {locale === "bn" ? bnStages[stage.id] : stage.id}
                </strong>
                <span>
                  {stage.count} · {stage.percentage.toFixed(1)}%
                </span>
              </div>
              <div className="premium-progress">
                <span style={{ width: `${stage.percentage}%` }} />
              </div>
              <small>
                {stage.averageMinutes === null
                  ? copy.unavailable
                  : `${stage.averageMinutes} min avg`}
                {stage.bottleneck
                  ? ` · ${locale === "bn" ? "বটলনেক" : "bottleneck"}`
                  : ""}
              </small>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export function PremiumChannels({ data, locale }: Props) {
  const copy = dashboardCopy(locale);
  const panel = data.channels;
  return (
    <section className="premium-panel">
      <div className="premium-section-heading">
        <h2>{copy.channels}</h2>
      </div>
      {panel.status === "unavailable" ? (
        <DashboardPanelState locale={locale} message={panel.message} />
      ) : (
        <div className="premium-channel-list">
          {panel.data.map((channel) => (
            <article key={channel.id}>
              <div>
                <strong>{channel.id}</strong>
                <span>{formatMoney(channel.revenueMinor, locale)}</span>
              </div>
              <div className="premium-progress">
                <span style={{ width: `${channel.share}%` }} />
              </div>
              <small>
                {channel.orders} {copy.orders} · {channel.share.toFixed(1)}% ·{" "}
                {channel.growthPercent > 0 ? "+" : ""}
                {channel.growthPercent}%
              </small>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export function PremiumFulfillmentChannels(props: Props) {
  return (
    <div className="premium-two-column">
      <PremiumFulfillment {...props} />
      <PremiumChannels {...props} />
    </div>
  );
}
