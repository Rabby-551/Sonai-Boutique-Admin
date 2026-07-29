import { PageHeader } from "@/components/ui/page-header";
import { AttentionQueue } from "@/features/dashboard/components/attention-queue";
import { DashboardFilters } from "@/features/dashboard/components/dashboard-filters";
import { FulfillmentSummary } from "@/features/dashboard/components/fulfillment-summary";
import { KpiGrid } from "@/features/dashboard/components/kpi-grid";
import { RecentOrders } from "@/features/dashboard/components/recent-orders";
import { RevenueChart } from "@/features/dashboard/components/revenue-chart";
import { getDashboardSummary } from "@/features/dashboard/server/queries";
import { dashboardQuerySchema } from "@/features/dashboard/schemas/dashboard-schema";

export const dynamic = "force-dynamic";
type Search = Record<string, string | string[] | undefined>;
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const raw = await searchParams;
  const query = dashboardQuerySchema.parse({
    branch: Array.isArray(raw.branch) ? raw.branch[0] : raw.branch,
    channel: Array.isArray(raw.channel) ? raw.channel[0] : raw.channel,
    range: Array.isArray(raw.range) ? raw.range[0] : raw.range,
  });
  const summary = await getDashboardSummary(query);
  return (
    <>
      <PageHeader
        eyebrow="Business intelligence · FR-182"
        title="Operations overview"
        description={summary.summary}
      />
      <DashboardFilters query={query} />
      <KpiGrid summary={summary} />
      <div className="grid-2">
        <RevenueChart summary={summary} />
        <AttentionQueue alerts={summary.alerts} />
      </div>
      <div className="grid-2 balanced">
        <FulfillmentSummary fulfillment={summary.fulfillment} />
        <section className="card">
          <div className="section-title">
            <div>
              <div className="eyebrow">Channel mix</div>
              <h2>Revenue contribution</h2>
            </div>
          </div>
          {summary.channelRevenue.map((item) => (
            <div className="channel-row" key={item.channel}>
              <span>{item.channel}</span>
              <div className="progress">
                <span style={{ width: `${item.share}%` }} />
              </div>
              <strong>{item.share}%</strong>
            </div>
          ))}
        </section>
      </div>
      <RecentOrders orders={summary.recentOrders} />
    </>
  );
}
