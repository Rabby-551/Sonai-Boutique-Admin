"use client";

import { useAdminLocale } from "@/components/i18n/admin-locale-provider";
import { PageHeader } from "@/components/ui/page-header";
import { localizeAdminTerm } from "@/lib/i18n/admin-locale";
import type {
  DashboardQuery,
  DashboardSummary,
} from "../schemas/dashboard-schema";
import { AttentionQueue } from "./attention-queue";
import { DashboardBrandBanner } from "./dashboard-brand-banner";
import { DashboardFilters } from "./dashboard-filters";
import { FulfillmentSummary } from "./fulfillment-summary";
import { KpiGrid } from "./kpi-grid";
import { RecentOrders } from "./recent-orders";
import { RevenueChart } from "./revenue-chart";

export function DashboardOverview({
  query,
  summary,
}: {
  query: DashboardQuery;
  summary: DashboardSummary;
}) {
  const { locale, dictionary } = useAdminLocale();
  const copy = dictionary.dashboard;
  const ranges: Record<DashboardQuery["range"], string> = {
    today: "Today",
    "7d": copy.last7Days,
    "30d": copy.last30Days,
    month: "This month",
    quarter: "This quarter",
    year: "This year",
    custom: "Custom range",
  };
  const locations = {
    all: dictionary.shell.allLocations,
    rupnagar: locale === "bn" ? "রূপনগর" : "Rupnagar",
    "mirpur-2": locale === "bn" ? "মিরপুর ২" : "Mirpur 2",
    online: dictionary.shell.online,
  };

  return (
    <div className="dashboard-page">
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.summary(ranges[query.range], locations[query.branch])}
      />
      <DashboardBrandBanner />
      <DashboardFilters query={query} />
      <KpiGrid summary={summary} />
      <div className="grid-2 dashboard-primary-grid">
        <RevenueChart summary={summary} />
        <AttentionQueue alerts={summary.alerts} />
      </div>
      <div className="grid-2 balanced">
        <FulfillmentSummary fulfillment={summary.fulfillment} />
        <section className="card">
          <div className="section-title">
            <div>
              <div className="eyebrow">{copy.channelMix}</div>
              <h2>{copy.revenueContribution}</h2>
            </div>
          </div>
          {summary.channelRevenue.map((item) => (
            <div className="channel-row" key={item.channel}>
              <span>{localizeAdminTerm(item.channel, locale)}</span>
              <div className="progress">
                <span style={{ width: `${item.share}%` }} />
              </div>
              <strong>
                {item.share.toLocaleString(locale === "bn" ? "bn-BD" : "en-BD")}
                %
              </strong>
            </div>
          ))}
        </section>
      </div>
      <RecentOrders orders={summary.recentOrders} />
    </div>
  );
}
