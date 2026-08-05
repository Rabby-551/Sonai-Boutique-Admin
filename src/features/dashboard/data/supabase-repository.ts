import "server-only";

import { createSonaiSupabaseServerClient } from "@/lib/supabase/server";
import type { DashboardQuery } from "../schemas/dashboard-schema";
import {
  averageOrderValue,
  deliverySuccess,
  resolveDateWindow,
} from "../utils/dashboard-metrics";
import type {
  ActivityGroup,
  DashboardRepository,
  GrowthGroup,
  OperationsGroup,
  OverviewGroup,
  SalesGroup,
} from "./repository";

type Row = Record<string, unknown>;
const rows = (value: unknown): Row[] =>
  Array.isArray(value) ? (value as Row[]) : [];
const number = (value: unknown) =>
  Number.isFinite(Number(value)) ? Number(value) : 0;
const minor = (value: unknown) => Math.round(number(value) * 100);
const updatedAt = () => new Date().toISOString();
const ready = <T>(data: T) => ({
  status: "ready" as const,
  source: "supabase" as const,
  updatedAt: updatedAt(),
  data,
});
const empty = <T>(data: T, message: string) => ({
  status: "empty" as const,
  source: "supabase" as const,
  updatedAt: updatedAt(),
  data,
  message,
});
const unavailable = (
  reason: "missing_contract" | "missing_source" | "insufficient_data",
  message: string,
) => ({
  status: "unavailable" as const,
  source: "supabase" as const,
  updatedAt: updatedAt(),
  data: null,
  reason,
  message,
});

interface LiveData {
  orders: Row[];
  variants: Row[];
}

export class SupabaseDashboardRepository implements DashboardRepository {
  private cache?: Promise<LiveData>;

  private load(query: DashboardQuery) {
    if (!this.cache) this.cache = this.fetch(query);
    return this.cache;
  }

  private async fetch(query: DashboardQuery): Promise<LiveData> {
    const supabase = await createSonaiSupabaseServerClient();
    if (!supabase) throw new Error("SONAI_COMMERCE_NOT_CONFIGURED");
    const window = resolveDateWindow(query);
    const [orderResult, variantResult] = await Promise.all([
      supabase
        .from("orders")
        .select(
          "id,order_number,contact_name,total,payment_method,status,created_at,updated_at",
        )
        .gte("created_at", window.start.toISOString())
        .lte("created_at", window.end.toISOString())
        .order("created_at", { ascending: false }),
      supabase
        .from("product_variants")
        .select(
          "id,inventory(quantity_on_hand,quantity_reserved,low_stock_threshold)",
        ),
    ]);
    if (orderResult.error) throw new Error(orderResult.error.message);
    if (variantResult.error) throw new Error(variantResult.error.message);
    const branchOnly =
      query.branch === "rupnagar" ||
      query.branch === "mirpur-2" ||
      query.channel === "branch" ||
      query.channel === "pos";
    return {
      orders: branchOnly ? [] : rows(orderResult.data),
      variants: rows(variantResult.data),
    };
  }

  async getOverview(query: DashboardQuery): Promise<OverviewGroup> {
    const data = await this.load(query);
    const eligible = data.orders.filter(
      (order) =>
        !["draft", "payment_failed", "cancelled"].includes(
          String(order.status),
        ),
    );
    const revenue = eligible
      .filter((order) => String(order.status) !== "refunded")
      .reduce((sum, order) => sum + minor(order.total), 0);
    const delivered = data.orders.filter(
      (order) => String(order.status) === "delivered",
    ).length;
    const returned = data.orders.filter(
      (order) => String(order.status) === "returned",
    ).length;
    const cancelled = data.orders.filter(
      (order) => String(order.status) === "cancelled",
    ).length;
    const metric = (
      id: "revenue" | "orders" | "averageOrderValue" | "deliverySuccess",
      value: number | null,
      format: "money" | "count" | "percent",
      note: string,
    ) => ({
      id,
      value,
      format,
      comparisonPercent: null,
      trend: "unavailable" as const,
      state: "ready" as const,
      note,
    });
    return {
      overview: ready({
        mappedOrderCount: data.orders.length,
        metrics: [
          metric(
            "revenue",
            revenue,
            "money",
            "Live net order revenue; discounts/refunds depend on order totals",
          ),
          metric(
            "orders",
            eligible.length,
            "count",
            "Eligible live placed orders",
          ),
          {
            id: "grossProfit",
            value: null,
            format: "money",
            comparisonPercent: null,
            trend: "unavailable",
            state: "unavailable",
            note: "Variant-level snapshotted COGS is not available",
          },
          {
            id: "inventoryValue",
            value: null,
            format: "money",
            comparisonPercent: null,
            trend: "unavailable",
            state: "unavailable",
            note: "Unit cost is not available in the current inventory source",
          },
          metric(
            "averageOrderValue",
            averageOrderValue(revenue, eligible.length),
            "money",
            "Net revenue per eligible order",
          ),
          metric(
            "deliverySuccess",
            deliverySuccess(delivered, returned, cancelled),
            "percent",
            "Delivered share of terminal outcomes",
          ),
        ],
      }),
    };
  }

  async getSales(query: DashboardQuery): Promise<SalesGroup> {
    const data = await this.load(query);
    const buckets = new Map<string, { revenueMinor: number; orders: number }>();
    for (const order of data.orders) {
      if (
        ["draft", "payment_failed", "cancelled", "refunded"].includes(
          String(order.status),
        )
      )
        continue;
      const label = new Date(String(order.created_at)).toLocaleDateString(
        "en-BD",
        { month: "short", day: "numeric", timeZone: "Asia/Dhaka" },
      );
      const bucket = buckets.get(label) ?? { revenueMinor: 0, orders: 0 };
      bucket.revenueMinor += minor(order.total);
      bucket.orders += 1;
      buckets.set(label, bucket);
    }
    const points = [...buckets].map(([label, value]) => ({
      label,
      ...value,
      profitMinor: null,
      previousRevenueMinor: null,
    }));
    const revenue = points.reduce((sum, point) => sum + point.revenueMinor, 0);
    return {
      revenue: points.length
        ? ready(points)
        : empty(points, "No eligible website revenue in this period."),
      targets: unavailable(
        "missing_source",
        "Targets are not stored in the current commerce source.",
      ),
      channels: ready([
        {
          id: "website",
          revenueMinor: revenue,
          orders: data.orders.length,
          averageOrderMinor: averageOrderValue(revenue, data.orders.length),
          share: revenue ? 100 : 0,
          growthPercent: 0,
        },
      ]),
      geography: unavailable(
        "missing_contract",
        "District-level order aggregates are not available. Delivery addresses are never inferred.",
      ),
    };
  }

  async getOperations(query: DashboardQuery): Promise<OperationsGroup> {
    const data = await this.load(query);
    const statusCount = (status: string) =>
      data.orders.filter((order) => String(order.status) === status).length;
    const lowStock = data.variants.filter((variant) => {
      const raw = Array.isArray(variant.inventory)
        ? variant.inventory[0]
        : variant.inventory;
      const inventory = (raw ?? {}) as Row;
      return (
        number(inventory.quantity_on_hand) -
          number(inventory.quantity_reserved) <=
        number(inventory.low_stock_threshold)
      );
    }).length;
    const total = Math.max(1, data.orders.length);
    const stage = (
      id:
        | "confirmed"
        | "packed"
        | "shipped"
        | "delivered"
        | "returned"
        | "cancelled",
      status: string,
    ) => {
      const count = statusCount(status);
      return {
        id,
        count,
        percentage: (count / total) * 100,
        conversionPercent: null,
        averageMinutes: null,
        bottleneck: false,
      };
    };
    return {
      alerts: ready([
        {
          id: "stock",
          title: `${lowStock} low-stock variants`,
          detail: "Review availability and replenish stock",
          ageLabel: "Live",
          severity: lowStock ? "critical" : "info",
          actionLabel: "Review stock",
          href: "/inventory?stock=critical",
        },
        {
          id: "orders",
          title: `${statusCount("confirmed")} confirmed orders`,
          detail: "Begin fulfilment for waiting orders",
          ageLabel: "Live",
          severity: statusCount("confirmed") ? "warning" : "info",
          actionLabel: "Open orders",
          href: "/orders?status=confirmed",
        },
      ]),
      fulfillment: ready([
        stage("confirmed", "confirmed"),
        stage("packed", "processing"),
        stage("shipped", "shipped"),
        stage("delivered", "delivered"),
        stage("returned", "returned"),
        stage("cancelled", "cancelled"),
      ]),
      inventory: unavailable(
        "missing_contract",
        "Inventory ageing, unit cost, turnover, and transfer history are not present in the current source.",
      ),
    };
  }

  async getGrowth(_query: DashboardQuery): Promise<GrowthGroup> {
    void _query;
    return {
      merchandise: unavailable(
        "missing_contract",
        "Margin, returns, and historical product aggregates are not available.",
      ),
      customers: unavailable(
        "missing_contract",
        "Customer cohort and loyalty aggregates are not available.",
      ),
      campaigns: unavailable(
        "missing_source",
        "Campaign attribution and cost data are not connected.",
      ),
    };
  }

  async getActivity(query: DashboardQuery): Promise<ActivityGroup> {
    const data = await this.load(query);
    const search = query.orderSearch.toLowerCase();
    const filtered = data.orders.filter((order) => {
      const matches =
        !search ||
        `${order.order_number ?? order.id} ${order.contact_name ?? ""}`
          .toLowerCase()
          .includes(search);
      return (
        matches &&
        (query.orderStatus === "all" ||
          String(order.status) === query.orderStatus)
      );
    });
    const totalPages = Math.ceil(filtered.length / query.orderPageSize);
    const page = Math.min(query.orderPage, Math.max(1, totalPages));
    const items = filtered
      .slice((page - 1) * query.orderPageSize, page * query.orderPageSize)
      .map((order) => ({
        id: String(order.order_number ?? order.id),
        customer: String(order.contact_name ?? "Guest customer"),
        channel: "Website",
        location: "Online",
        totalMinor: minor(order.total),
        payment: String(order.payment_method ?? "pending").toUpperCase(),
        fulfillment: String(order.status ?? "confirmed"),
        status: String(order.status ?? "confirmed"),
        updatedAt: new Date(
          String(order.updated_at ?? order.created_at),
        ).toISOString(),
      }));
    return {
      orders: items.length
        ? ready({
            items,
            page,
            pageSize: query.orderPageSize,
            totalItems: filtered.length,
            totalPages,
          })
        : empty(
            {
              items,
              page: 1,
              pageSize: query.orderPageSize,
              totalItems: 0,
              totalPages: 0,
            },
            "No orders match these filters.",
          ),
      activity: unavailable(
        "missing_source",
        "A cross-module activity audit stream is not connected.",
      ),
    };
  }
}
