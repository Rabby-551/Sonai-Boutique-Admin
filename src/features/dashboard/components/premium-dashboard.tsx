import { PageHeader } from "@/components/ui/page-header";
import type { AdminLocale } from "@/lib/i18n/admin-locale";
import { dashboardCopy } from "../dashboard-copy";
import type { DashboardWorkspace } from "../schemas/dashboard-schema";
import { BangladeshDashboardMap } from "./bangladesh-dashboard-map";
import {
  CompactGrowthInsights,
  CompactOperationsInsights,
} from "./compact-dashboard-insights";
import { DashboardBrandBanner } from "./dashboard-brand-banner";
import { PremiumActivity } from "./premium-activity";
import { PremiumDashboardFilters } from "./premium-dashboard-filters";
import { PremiumKpiGrid } from "./premium-kpi-grid";
import { PremiumOrders } from "./premium-orders";
import { PremiumRevenueChart } from "./premium-revenue-chart";

export function PremiumDashboard({
  data,
  locale,
}: {
  data: DashboardWorkspace;
  locale: AdminLocale;
}) {
  const copy = dashboardCopy(locale);
  const source = data.overview.source;
  return (
    <div
      className={`dashboard-page premium-dashboard${locale === "bn" ? " premium-dashboard-bn" : ""}`}
    >
      <PageHeader
        compact
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        metadata={
          <>
            <span className="badge">
              {copy.source}: {source}
            </span>
            <span className="badge">Asia/Dhaka</span>
          </>
        }
      />
      <DashboardBrandBanner locale={locale} />
      <PremiumDashboardFilters query={data.query} locale={locale} />
      <div className="compact-dashboard-grid">
        <div className="compact-dashboard-slot compact-chart-slot">
          <PremiumRevenueChart panel={data.revenue} locale={locale} />
        </div>
        <div className="compact-dashboard-slot compact-kpi-slot">
          <PremiumKpiGrid panel={data.overview} locale={locale} />
        </div>
        <div className="compact-dashboard-slot compact-operations-slot">
          <CompactOperationsInsights data={data} locale={locale} />
        </div>
        <div className="compact-dashboard-slot compact-map-slot">
          <BangladeshDashboardMap panel={data.geography} locale={locale} />
        </div>
        <div className="compact-dashboard-slot compact-growth-slot">
          <CompactGrowthInsights data={data} locale={locale} />
        </div>
        <div className="compact-dashboard-slot compact-orders-slot">
          <PremiumOrders panel={data.orders} locale={locale} />
        </div>
        <div className="compact-dashboard-slot compact-activity-slot">
          <PremiumActivity panel={data.activity} locale={locale} />
        </div>
      </div>
    </div>
  );
}
