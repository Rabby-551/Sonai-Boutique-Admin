import type { DashboardQuery } from "../schemas/dashboard-schema";
import { resolveDateWindow } from "../utils/dashboard-metrics";
import type {
  ActivityGroup,
  DashboardRepository,
  GrowthGroup,
  OperationsGroup,
  OverviewGroup,
  SalesGroup,
} from "./repository";

const updatedAt = "2026-08-05T12:00:00.000Z";
const ready = <T>(data: T) => ({
  status: "ready" as const,
  source: "mock" as const,
  updatedAt,
  data,
});
const RANGE_FACTORS = {
  today: 0.04,
  "7d": 0.24,
  "30d": 1,
  month: 1,
  quarter: 2.9,
  year: 11.6,
} as const;

function scopeFactor(query: DashboardQuery) {
  const branch =
    query.branch === "all" ? 1 : query.branch === "online" ? 0.42 : 0.29;
  const channel =
    query.channel === "all" ? 1 : query.channel === "online" ? 0.42 : 0.18;
  if (query.range !== "custom")
    return RANGE_FACTORS[query.range] * branch * channel;
  const window = resolveDateWindow(query);
  const days = Math.max(
    1,
    Math.round((window.end.getTime() - window.start.getTime()) / 86_400_000),
  );
  return (days / 30) * branch * channel;
}

const orders = Array.from({ length: 18 }, (_, index) => {
  const statuses = [
    "confirmed",
    "packed",
    "shipped",
    "delivered",
    "returned",
    "cancelled",
  ];
  const channels = [
    "Website",
    "POS",
    "WhatsApp",
    "Facebook",
    "Instagram",
    "Branch",
  ];
  return {
    id: `SH-260805-${1848 - index}`,
    customer: [
      "Farzana Ahmed",
      "Tanzim Rahman",
      "Rumana Kabir",
      "Nusrat Jahan",
    ][index % 4],
    channel: channels[index % channels.length],
    location: ["Dhaka", "Chattogram", "Sylhet", "Rupnagar"][index % 4],
    totalMinor: 520_000 + index * 73_000,
    payment: index % 3 === 0 ? "COD" : "Paid",
    fulfillment: statuses[index % statuses.length],
    status: statuses[index % statuses.length],
    updatedAt: new Date(
      Date.UTC(2026, 7, 5, 11 - Math.floor(index / 3), (index * 7) % 60),
    ).toISOString(),
  };
});

export class MockDashboardRepository implements DashboardRepository {
  async getOverview(input: DashboardQuery): Promise<OverviewGroup> {
    const factor = scopeFactor(input);
    const revenue = Math.round(428_000_000 * factor);
    const orderCount = Math.round(1_248 * factor);
    const metric = (
      id:
        | "revenue"
        | "orders"
        | "grossProfit"
        | "inventoryValue"
        | "averageOrderValue"
        | "deliverySuccess",
      value: number,
      format: "money" | "count" | "percent",
      comparisonPercent: number,
      note: string,
    ) => ({
      id,
      value,
      format,
      comparisonPercent,
      trend: comparisonPercent > 0 ? ("up" as const) : ("down" as const),
      state: "ready" as const,
      note,
    });
    return {
      overview: ready({
        mappedOrderCount: orderCount,
        metrics: [
          metric("revenue", revenue, "money", 12.4, "Net merchandise revenue"),
          metric("orders", orderCount, "count", 8.1, "Eligible placed orders"),
          metric(
            "grossProfit",
            Math.round(revenue * 0.376),
            "money",
            9.7,
            "37.6% gross margin",
          ),
          metric(
            "inventoryValue",
            Math.round(2_840_000_000 * factor),
            "money",
            -2.3,
            "On-hand stock at unit cost",
          ),
          metric(
            "averageOrderValue",
            orderCount ? Math.round(revenue / orderCount) : 0,
            "money",
            4.2,
            "Net revenue per eligible order",
          ),
          metric(
            "deliverySuccess",
            91.8,
            "percent",
            1.6,
            "Delivered terminal outcomes",
          ),
        ],
      }),
    };
  }

  async getSales(input: DashboardQuery): Promise<SalesGroup> {
    const factor = scopeFactor(input);
    const points = [52, 68, 61, 84, 76, 94, 88, 108, 101, 119, 112, 126].map(
      (value, index) => ({
        label: `W${index + 1}`,
        revenueMinor: Math.round(value * 100_000 * factor),
        profitMinor: Math.round(value * 37_600 * factor),
        orders: Math.round(value * 0.31 * factor),
        previousRevenueMinor: input.compare
          ? Math.round(value * 91_000 * factor)
          : null,
      }),
    );
    const channelBase = [
      ["website", 142_000_000, 426, 8.4],
      ["pos", 96_000_000, 281, 4.9],
      ["whatsapp", 58_000_000, 153, 14.2],
      ["facebook", 42_000_000, 112, 9.1],
      ["instagram", 31_000_000, 89, 18.6],
      ["branch", 37_000_000, 126, -1.8],
      ["campaign", 22_000_000, 61, 23.5],
    ] as const;
    const total = channelBase.reduce((sum, item) => sum + item[1], 0);
    const districts = [
      ["dhaka", "Dhaka", "ঢাকা", 51, 42, 486, 166_000_000, 94],
      ["chattogram", "Chattogram", "চট্টগ্রাম", 68, 64, 168, 58_000_000, 91],
      ["gazipur", "Gazipur", "গাজীপুর", 48, 35, 121, 39_000_000, 90],
      ["narayanganj", "Narayanganj", "নারায়ণগঞ্জ", 54, 47, 94, 31_000_000, 92],
      ["sylhet", "Sylhet", "সিলেট", 73, 31, 82, 27_000_000, 89],
      ["rajshahi", "Rajshahi", "রাজশাহী", 31, 42, 65, 22_000_000, 88],
      ["khulna", "Khulna", "খুলনা", 38, 69, 57, 19_000_000, 90],
      ["cumilla", "Cumilla", "কুমিল্লা", 64, 53, 42, 14_000_000, 86],
    ] as const;
    return {
      revenue: ready(points),
      targets: ready([
        {
          id: "monthly",
          actual: 4_280_000,
          target: 5_000_000,
          format: "money",
          remainingLabel: "৳720k remaining",
        },
        {
          id: "online",
          actual: 68,
          target: 75,
          format: "percent",
          remainingLabel: "7 points remaining",
        },
        {
          id: "branch",
          actual: 1_040,
          target: 1_200,
          format: "count",
          remainingLabel: "160 orders remaining",
        },
        {
          id: "delivery",
          actual: 91.8,
          target: 95,
          format: "percent",
          remainingLabel: "3.2 points remaining",
        },
        {
          id: "campaign",
          actual: 860_000,
          target: 1_000_000,
          format: "money",
          remainingLabel: "৳140k remaining",
        },
      ]),
      channels: ready(
        channelBase.map(([id, revenueMinor, count, growthPercent]) => ({
          id,
          revenueMinor: Math.round(revenueMinor * factor),
          orders: Math.round(count * factor),
          averageOrderMinor: Math.round(revenueMinor / count),
          share: (revenueMinor / total) * 100,
          growthPercent,
        })),
      ),
      geography: ready({
        privacyThreshold: 5,
        otherDistrictOrders: 12,
        unmappedOrders: 7,
        districts: districts.map(
          ([id, nameEn, nameBn, x, y, count, revenueMinor, success]) => ({
            id,
            nameEn,
            nameBn,
            x,
            y,
            orders: Math.max(5, Math.round(count * Math.max(factor, 0.2))),
            revenueMinor: Math.round(revenueMinor * factor),
            revenueShare: (revenueMinor / 376_000_000) * 100,
            deliverySuccess: success,
          }),
        ),
      }),
    };
  }

  async getOperations(input: DashboardQuery): Promise<OperationsGroup> {
    const factor = scopeFactor(input);
    const alert = (
      id: string,
      title: string,
      detail: string,
      ageLabel: string,
      severity: "critical" | "warning" | "info",
      actionLabel: string,
      href: string,
    ) => ({ id, title, detail, ageLabel, severity, actionLabel, href });
    return {
      alerts: ready([
        alert(
          "stock",
          "6 critical stock alerts",
          "Reorder or transfer today",
          "18 min",
          "critical",
          "Review stock",
          "/inventory?stock=critical",
        ),
        alert(
          "orders",
          "8 orders await confirmation",
          "Oldest waiting 42 minutes",
          "42 min",
          "warning",
          "Open orders",
          "/orders?status=confirmed",
        ),
        alert(
          "counts",
          "2 counts need review",
          "Three-unit net variance",
          "1 hr",
          "info",
          "Review counts",
          "/stock-counts?status=pending",
        ),
        alert(
          "delivery",
          "5 delivery exceptions",
          "Carrier follow-up required",
          "2 hr",
          "warning",
          "Track delivery",
          "/orders?status=shipped",
        ),
        alert(
          "supplier",
          "3 supplier ETAs overdue",
          "Purchase orders are at risk",
          "5 hr",
          "warning",
          "Contact suppliers",
          "/purchase-orders",
        ),
        alert(
          "complaints",
          "2 complaint SLAs at risk",
          "Reply within 90 minutes",
          "26 min",
          "critical",
          "Open complaints",
          "/complaints",
        ),
        alert(
          "payments",
          "4 payments need review",
          "Gateway reconciliation mismatch",
          "3 hr",
          "warning",
          "Reconcile",
          "/finance/reconciliation",
        ),
        alert(
          "campaign",
          "Campaign stock cover low",
          "Featured sizes may sell out",
          "4 hr",
          "info",
          "Review campaign",
          "/campaigns",
        ),
      ]),
      fulfillment: ready(
        (
          [
            ["confirmed", 52, 100, null, 34, false],
            ["packed", 44, 84.6, 84.6, 68, true],
            ["shipped", 38, 73.1, 86.4, 215, false],
            ["delivered", 96, 88.9, 88.9, 1320, false],
            ["returned", 7, 6.5, null, 480, false],
            ["cancelled", 5, 4.6, null, 76, false],
          ] as const
        ).map(
          ([
            id,
            count,
            percentage,
            conversionPercent,
            averageMinutes,
            bottleneck,
          ]) => ({
            id,
            count: Math.round(count * factor),
            percentage,
            conversionPercent,
            averageMinutes,
            bottleneck,
          }),
        ),
      ),
      inventory: ready({
        bands: [
          { id: "healthy", count: 182, valueMinor: 1_840_000_000 },
          { id: "low", count: 24, valueMinor: 226_000_000 },
          { id: "critical", count: 6, valueMinor: 54_000_000 },
          { id: "out", count: 9, valueMinor: 0 },
          { id: "excess", count: 18, valueMinor: 410_000_000 },
          { id: "slow", count: 31, valueMinor: 310_000_000 },
        ],
        turnover: 4.8,
        deadStockMinor: 186_000_000,
        daysRemaining: 47,
        reorderCount: 30,
        transferCount: 12,
      }),
    };
  }

  async getGrowth(_input: DashboardQuery): Promise<GrowthGroup> {
    void _input;
    return {
      merchandise: ready({
        entries: [
          [
            "p1",
            "Jamdani Ivory Saree",
            "product",
            86,
            41_200_000,
            42,
            28,
            2.1,
            18.4,
          ],
          [
            "p2",
            "Noor Three-Piece",
            "product",
            73,
            32_800_000,
            39,
            19,
            3.4,
            12.7,
          ],
          ["c1", "Sarees", "category", 312, 148_000_000, 41, 164, 2.8, 14.2],
          ["c2", "Three-Piece", "category", 228, 92_000_000, 36, 121, 4.1, 8.6],
          [
            "l1",
            "Eid Atelier",
            "collection",
            166,
            86_000_000,
            44,
            76,
            2.2,
            26.3,
          ],
          ["b1", "Rupnagar", "branch", 284, 104_000_000, 38, 214, 3.2, 6.9],
        ].map(
          ([
            id,
            name,
            kind,
            units,
            revenueMinor,
            marginPercent,
            stock,
            returnRate,
            growthPercent,
          ]) => ({
            id: String(id),
            name: String(name),
            kind: kind as "product" | "category" | "collection" | "branch",
            units: Number(units),
            revenueMinor: Number(revenueMinor),
            marginPercent: Number(marginPercent),
            stock: Number(stock),
            returnRate: Number(returnRate),
            growthPercent: Number(growthPercent),
          }),
        ),
      }),
      customers: ready({
        newCustomers: 286,
        returningCustomers: 412,
        repeatRate: 41.3,
        averageValueMinor: 384_000,
        loyaltyParticipation: 57.8,
        purchaseFrequency: 2.4,
        growthPercent: 16.2,
      }),
      campaigns: ready({
        entries: [
          {
            id: "eid",
            name: "Eid Atelier",
            status: "Active",
            revenueMinor: 86_000_000,
            conversionRate: 4.8,
            redemptionRate: 31,
            costMinor: 9_200_000,
            returnPercent: 834.8,
          },
          {
            id: "monsoon",
            name: "Monsoon Edit",
            status: "Scheduled",
            revenueMinor: 22_000_000,
            conversionRate: 3.2,
            redemptionRate: 18,
            costMinor: 4_100_000,
            returnPercent: 436.6,
          },
          {
            id: "loyalty",
            name: "Sonai Circle",
            status: "Active",
            revenueMinor: 31_000_000,
            conversionRate: 6.1,
            redemptionRate: 42,
            costMinor: 3_800_000,
            returnPercent: 715.8,
          },
        ],
      }),
    };
  }

  async getActivity(input: DashboardQuery): Promise<ActivityGroup> {
    const search = input.orderSearch.toLowerCase();
    const filtered = orders
      .filter(
        (order) =>
          !search ||
          `${order.id} ${order.customer}`.toLowerCase().includes(search),
      )
      .filter(
        (order) =>
          input.orderStatus === "all" || order.status === input.orderStatus,
      )
      .sort((a, b) =>
        input.orderSort.startsWith("total")
          ? input.orderSort.endsWith("asc")
            ? a.totalMinor - b.totalMinor
            : b.totalMinor - a.totalMinor
          : input.orderSort.endsWith("asc")
            ? a.updatedAt.localeCompare(b.updatedAt)
            : b.updatedAt.localeCompare(a.updatedAt),
      );
    const totalPages = Math.ceil(filtered.length / input.orderPageSize);
    const page = Math.min(input.orderPage, Math.max(1, totalPages));
    const start = (page - 1) * input.orderPageSize;
    return {
      orders: ready({
        items: filtered.slice(start, start + input.orderPageSize),
        page,
        pageSize: input.orderPageSize,
        totalItems: filtered.length,
        totalPages,
      }),
      activity: ready(
        [
          [
            "a1",
            "order",
            "Order SH-260805-1848 was packed",
            "Maliha",
            "/orders/SH-260805-1848",
          ],
          [
            "a2",
            "stock",
            "Transferred 12 Jamdani units",
            "Rafi",
            "/stock-movements",
          ],
          [
            "a3",
            "campaign",
            "Published Eid Atelier offer",
            "Nabila",
            "/campaigns/eid",
          ],
          [
            "a4",
            "complaint",
            "Resolved delivery complaint",
            "Shirin",
            "/complaints",
          ],
          [
            "a5",
            "purchaseOrder",
            "Approved purchase order PO-1198",
            "Admin",
            "/purchase-orders/PO-1198",
          ],
          [
            "a6",
            "customer",
            "Customer joined Sonai Circle",
            "System",
            "/customers",
          ],
          [
            "a7",
            "product",
            "Updated Jamdani Ivory Saree",
            "Nabila",
            "/products",
          ],
          [
            "a8",
            "stockCount",
            "Completed Rupnagar stock count",
            "Rafi",
            "/stock-counts",
          ],
        ].map(([id, type, action, actor, href], index) => ({
          id,
          type: type as
            | "order"
            | "stock"
            | "campaign"
            | "complaint"
            | "purchaseOrder"
            | "customer",
          action,
          actor,
          href,
          timestamp: new Date(Date.UTC(2026, 7, 5, 11 - index)).toISOString(),
        })),
      ),
    };
  }
}
