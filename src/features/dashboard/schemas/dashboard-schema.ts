import { z } from "zod";

const booleanParam = z.preprocess(
  (value) =>
    value === undefined
      ? undefined
      : value === true || value === "1" || value === "true",
  z.boolean(),
);

export const dashboardQuerySchema = z
  .object({
    branch: z.enum(["all", "rupnagar", "mirpur-2", "online"]).default("all"),
    channel: z
      .enum([
        "all",
        "website",
        "pos",
        "whatsapp",
        "facebook",
        "instagram",
        "branch",
        "campaign",
        "online",
      ])
      .default("all"),
    range: z
      .enum(["today", "7d", "30d", "month", "quarter", "year", "custom"])
      .default("30d"),
    from: z.string().date().optional(),
    to: z.string().date().optional(),
    compare: booleanParam.default(true),
    granularity: z
      .enum(["auto", "day", "week", "month", "quarter"])
      .default("auto"),
    orderSearch: z.string().trim().max(80).default(""),
    orderStatus: z
      .enum([
        "all",
        "confirmed",
        "packed",
        "shipped",
        "delivered",
        "returned",
        "cancelled",
      ])
      .default("all"),
    orderSort: z
      .enum(["updated-desc", "updated-asc", "total-desc", "total-asc"])
      .default("updated-desc"),
    orderPage: z.coerce.number().int().min(1).default(1),
    orderPageSize: z.coerce
      .number()
      .int()
      .refine((value) => [5, 10, 25].includes(value))
      .default(5),
  })
  .superRefine((value, context) => {
    if (value.range !== "custom") return;
    if (!value.from || !value.to) {
      context.addIssue({
        code: "custom",
        message: "Custom ranges require both start and end dates.",
        path: [!value.from ? "from" : "to"],
      });
      return;
    }
    const start = new Date(`${value.from}T00:00:00+06:00`);
    const end = new Date(`${value.to}T23:59:59+06:00`);
    const days = (end.getTime() - start.getTime()) / 86_400_000;
    if (days < 0 || days > 366) {
      context.addIssue({
        code: "custom",
        message:
          "Custom ranges must be chronological and no longer than one year.",
        path: ["to"],
      });
    }
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

const panelMetaSchema = z.object({
  source: z.enum(["mock", "supabase"]),
  updatedAt: z.string().datetime(),
});

function panelSchema<T extends z.ZodType>(data: T) {
  return z.discriminatedUnion("status", [
    panelMetaSchema.extend({ status: z.literal("ready"), data }),
    panelMetaSchema.extend({
      status: z.literal("empty"),
      data,
      message: z.string(),
    }),
    panelMetaSchema.extend({
      status: z.literal("unavailable"),
      data: z.null(),
      reason: z.enum([
        "missing_contract",
        "missing_source",
        "insufficient_data",
      ]),
      message: z.string(),
    }),
  ]);
}

const metricSchemaV2 = z.object({
  id: z.enum([
    "revenue",
    "orders",
    "grossProfit",
    "inventoryValue",
    "averageOrderValue",
    "deliverySuccess",
  ]),
  format: z.enum(["money", "count", "percent"]),
  value: z.number().nullable(),
  comparisonPercent: z.number().nullable(),
  trend: z.enum(["up", "down", "flat", "unavailable"]),
  state: z.enum(["ready", "unavailable"]),
  note: z.string(),
});

const overviewDataSchema = z.object({
  metrics: z.array(metricSchemaV2).length(6),
  mappedOrderCount: z.number().int().nonnegative(),
});

const revenuePointSchema = z.object({
  label: z.string(),
  revenueMinor: z.number().int(),
  profitMinor: z.number().int().nullable(),
  orders: z.number().int().nonnegative(),
  previousRevenueMinor: z.number().int().nullable(),
});

const targetSchema = z.object({
  id: z.enum(["monthly", "online", "branch", "delivery", "campaign"]),
  actual: z.number().nonnegative(),
  target: z.number().positive(),
  format: z.enum(["money", "count", "percent"]),
  remainingLabel: z.string(),
});

const channelSchema = z.object({
  id: z.enum([
    "website",
    "pos",
    "whatsapp",
    "facebook",
    "instagram",
    "branch",
    "campaign",
  ]),
  revenueMinor: z.number().int().nonnegative(),
  orders: z.number().int().nonnegative(),
  averageOrderMinor: z.number().int().nonnegative(),
  share: z.number().min(0).max(100),
  growthPercent: z.number(),
});

const districtSchema = z.object({
  id: z.string().min(1),
  nameEn: z.string().min(1),
  nameBn: z.string().min(1),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  orders: z.number().int().min(5),
  revenueMinor: z.number().int().nonnegative(),
  revenueShare: z.number().min(0).max(100),
  deliverySuccess: z.number().min(0).max(100),
});

const geographySchema = z.object({
  districts: z.array(districtSchema),
  privacyThreshold: z.literal(5),
  otherDistrictOrders: z.number().int().nonnegative(),
  unmappedOrders: z.number().int().nonnegative(),
});

const alertSchemaV2 = z.object({
  id: z.string(),
  title: z.string(),
  detail: z.string(),
  ageLabel: z.string(),
  severity: z.enum(["critical", "warning", "info"]),
  actionLabel: z.string(),
  href: z.string(),
});

const fulfillmentStageSchema = z.object({
  id: z.enum([
    "confirmed",
    "packed",
    "shipped",
    "delivered",
    "returned",
    "cancelled",
  ]),
  count: z.number().int().nonnegative(),
  percentage: z.number().min(0).max(100),
  conversionPercent: z.number().min(0).max(100).nullable(),
  averageMinutes: z.number().int().nonnegative().nullable(),
  bottleneck: z.boolean(),
});

const inventorySchema = z.object({
  bands: z.array(
    z.object({
      id: z.enum(["healthy", "low", "critical", "out", "excess", "slow"]),
      count: z.number().int().nonnegative(),
      valueMinor: z.number().int().nonnegative(),
    }),
  ),
  turnover: z.number().nonnegative(),
  deadStockMinor: z.number().int().nonnegative(),
  daysRemaining: z.number().nonnegative(),
  reorderCount: z.number().int().nonnegative(),
  transferCount: z.number().int().nonnegative(),
});

const merchandiseSchema = z.object({
  entries: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      kind: z.enum(["product", "category", "collection", "branch"]),
      units: z.number().int().nonnegative(),
      revenueMinor: z.number().int().nonnegative(),
      marginPercent: z.number(),
      stock: z.number().int().nonnegative(),
      returnRate: z.number().nonnegative(),
      growthPercent: z.number(),
    }),
  ),
});

const customerSchema = z.object({
  newCustomers: z.number().int().nonnegative(),
  returningCustomers: z.number().int().nonnegative(),
  repeatRate: z.number().min(0).max(100),
  averageValueMinor: z.number().int().nonnegative(),
  loyaltyParticipation: z.number().min(0).max(100),
  purchaseFrequency: z.number().nonnegative(),
  growthPercent: z.number(),
});

const campaignSchema = z.object({
  entries: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      status: z.string(),
      revenueMinor: z.number().int().nonnegative(),
      conversionRate: z.number().nonnegative(),
      redemptionRate: z.number().nonnegative(),
      costMinor: z.number().int().nonnegative(),
      returnPercent: z.number(),
    }),
  ),
});

const recentOrderSchema = z.object({
  id: z.string(),
  customer: z.string(),
  channel: z.string(),
  location: z.string(),
  totalMinor: z.number().int().nonnegative(),
  payment: z.string(),
  fulfillment: z.string(),
  status: z.string(),
  updatedAt: z.string().datetime(),
});

const ordersDataSchema = z.object({
  items: z.array(recentOrderSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  totalItems: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

const activitySchema = z.array(
  z.object({
    id: z.string(),
    type: z.enum([
      "order",
      "product",
      "stock",
      "campaign",
      "complaint",
      "purchaseOrder",
      "customer",
      "stockCount",
    ]),
    action: z.string(),
    actor: z.string(),
    timestamp: z.string().datetime(),
    href: z.string(),
  }),
);

export const dashboardWorkspaceSchema = z.object({
  query: dashboardQuerySchema,
  overview: panelSchema(overviewDataSchema),
  revenue: panelSchema(z.array(revenuePointSchema)),
  targets: panelSchema(z.array(targetSchema)),
  channels: panelSchema(z.array(channelSchema)),
  geography: panelSchema(geographySchema),
  alerts: panelSchema(z.array(alertSchemaV2)),
  fulfillment: panelSchema(z.array(fulfillmentStageSchema)),
  inventory: panelSchema(inventorySchema),
  merchandise: panelSchema(merchandiseSchema),
  customers: panelSchema(customerSchema),
  campaigns: panelSchema(campaignSchema),
  orders: panelSchema(ordersDataSchema),
  activity: panelSchema(activitySchema),
});

export type DashboardWorkspace = z.infer<typeof dashboardWorkspaceSchema>;
export type DashboardPanel<T> =
  | { status: "ready"; source: "mock" | "supabase"; updatedAt: string; data: T }
  | {
      status: "empty";
      source: "mock" | "supabase";
      updatedAt: string;
      data: T;
      message: string;
    }
  | {
      status: "unavailable";
      source: "mock" | "supabase";
      updatedAt: string;
      data: null;
      reason: "missing_contract" | "missing_source" | "insufficient_data";
      message: string;
    };
