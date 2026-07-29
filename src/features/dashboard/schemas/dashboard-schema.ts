import { z } from "zod";

export const dashboardQuerySchema = z.object({
  branch: z.enum(["all", "banani", "dhanmondi", "online"]).default("all"),
  channel: z.enum(["all", "branch", "online"]).default("all"),
  range: z.enum(["7d", "30d", "90d"]).default("30d"),
});
const metricSchema = z.object({
  label: z.string(),
  valueMinor: z.number().int(),
  comparison: z.string(),
});
const trendPointSchema = z.object({
  label: z.string(),
  revenueMinor: z.number().int().nonnegative(),
});
const alertSchema = z.object({
  id: z.string(),
  title: z.string(),
  detail: z.string(),
  severity: z.enum(["warning", "critical", "info"]),
  href: z.string(),
});
const orderSchema = z.object({
  id: z.string(),
  customer: z.string(),
  channel: z.string(),
  totalMinor: z.number().int().nonnegative(),
  payment: z.string(),
  status: z.string(),
});

export const dashboardSchema = z.object({
  revenueMinor: z.number().int().nonnegative(),
  orders: z.number().int().nonnegative(),
  profitMinor: z.number().int(),
  inventoryMinor: z.number().int().nonnegative(),
  metrics: z.array(metricSchema),
  trend: z.array(trendPointSchema),
  alerts: z.array(alertSchema),
  recentOrders: z.array(orderSchema),
  fulfillment: z.object({
    confirmed: z.number().int(),
    packed: z.number().int(),
    shipped: z.number().int(),
    delivered: z.number().int(),
  }),
  channelRevenue: z.array(
    z.object({
      channel: z.string(),
      revenueMinor: z.number().int().nonnegative(),
      share: z.number().min(0).max(100),
    }),
  ),
  summary: z.string(),
});
export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;
export type DashboardSummary = z.infer<typeof dashboardSchema>;
