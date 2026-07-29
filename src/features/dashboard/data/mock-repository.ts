import {
  dashboardSchema,
  type DashboardQuery,
} from "../schemas/dashboard-schema";
import type { DashboardRepository } from "./repository";

const factors = { "7d": 0.24, "30d": 1, "90d": 2.86 } as const;
export class MockDashboardRepository implements DashboardRepository {
  async getSummary(input: DashboardQuery) {
    const branchFactor =
      input.branch === "all" ? 1 : input.branch === "online" ? 0.42 : 0.29;
    const channelFactor =
      input.channel === "all" ? 1 : input.channel === "online" ? 0.42 : 0.58;
    const factor = factors[input.range] * branchFactor * channelFactor;
    const revenueMinor = Math.round(428_000_000 * factor);
    const orders = Math.round(1_248 * factor);
    const profitMinor = Math.round(revenueMinor * 0.376);
    const trendBase = [52, 68, 61, 84, 76, 94, 88];
    return dashboardSchema.parse({
      revenueMinor,
      orders,
      profitMinor,
      inventoryMinor: Math.round(2_840_000_000 * branchFactor),
      metrics: [
        {
          label: "Revenue",
          valueMinor: revenueMinor,
          comparison: "+12.4% vs previous period",
        },
        {
          label: "Gross profit",
          valueMinor: profitMinor,
          comparison: "37.6% margin",
        },
      ],
      trend: trendBase.map((value, index) => ({
        label: `W${index + 1}`,
        revenueMinor: Math.round(value * 100_000 * factor),
      })),
      alerts: [
        {
          id: "alert-stock",
          title: "6 critical stock alerts",
          detail: "Reorder or transfer today",
          severity: "critical",
          href: "/inventory?stock=critical",
        },
        {
          id: "alert-orders",
          title: "8 orders await confirmation",
          detail: "Oldest waiting 42 minutes",
          severity: "warning",
          href: "/orders?status=placed",
        },
        {
          id: "alert-counts",
          title: "2 stock counts need review",
          detail: "3-unit net variance",
          severity: "info",
          href: "/stock-counts?status=pending",
        },
      ],
      recentOrders: [
        {
          id: "SH-260729-1842",
          customer: "Farzana Ahmed",
          channel: "Website",
          totalMinor: 1_490_000,
          payment: "Paid",
          status: "Packed",
        },
        {
          id: "SH-260729-1841",
          customer: "Tanzim Rahman",
          channel: "WhatsApp",
          totalMinor: 980_000,
          payment: "COD",
          status: "Confirmed",
        },
        {
          id: "SH-260729-1840",
          customer: "Rumana Kabir",
          channel: "Branch",
          totalMinor: 560_000,
          payment: "Paid",
          status: "Delivered",
        },
      ],
      fulfillment: { confirmed: 18, packed: 12, shipped: 31, delivered: 96 },
      channelRevenue: [
        {
          channel: "Online",
          revenueMinor: Math.round(revenueMinor * 0.42),
          share: 42,
        },
        {
          channel: "Banani",
          revenueMinor: Math.round(revenueMinor * 0.31),
          share: 31,
        },
        {
          channel: "Dhanmondi",
          revenueMinor: Math.round(revenueMinor * 0.27),
          share: 27,
        },
      ],
      summary: `${input.range === "7d" ? "Seven-day" : input.range === "90d" ? "Ninety-day" : "Thirty-day"} revenue across ${input.branch === "all" ? "all locations" : input.branch}.`,
    });
  }
}
