import "server-only";

import { createSonaiSupabaseServerClient } from "@/lib/supabase/server";
import {
  dashboardSchema,
  type DashboardQuery,
} from "../schemas/dashboard-schema";
import type { DashboardRepository } from "./repository";

type Row = Record<string, unknown>;
const rows = (value: unknown): Row[] =>
  Array.isArray(value) ? (value as Row[]) : [];
const numeric = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
const minor = (value: unknown) => Math.round(numeric(value) * 100);

function rangeStart(range: DashboardQuery["range"]) {
  const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

/** Live dashboard summary built from the storefront's orders and inventory. */
export class SupabaseDashboardRepository implements DashboardRepository {
  async getSummary(input: DashboardQuery) {
    const supabase = await createSonaiSupabaseServerClient();
    if (!supabase) throw new Error("SONAI_COMMERCE_NOT_CONFIGURED");

    const [ordersResult, inventoryResult] = await Promise.all([
      supabase
        .from("orders")
        .select(
          "id,order_number,contact_name,total,payment_method,status,created_at",
        )
        .gte("created_at", rangeStart(input.range))
        .order("created_at", { ascending: false }),
      supabase
        .from("product_variants")
        .select(
          "id,price,inventory(quantity_on_hand,quantity_reserved,low_stock_threshold)",
        ),
    ]);
    if (ordersResult.error) throw new Error(ordersResult.error.message);
    if (inventoryResult.error) throw new Error(inventoryResult.error.message);

    const isBranchOnly =
      input.branch === "rupnagar" ||
      input.branch === "mirpur-2" ||
      input.channel === "branch";
    const orderRows = isBranchOnly ? [] : rows(ordersResult.data);
    const inventoryRows = rows(inventoryResult.data);
    const revenueOrders = orderRows.filter(
      (order) =>
        !["cancelled", "payment_failed", "refunded"].includes(
          String(order.status),
        ),
    );
    const revenueMinor = revenueOrders.reduce(
      (sum, order) => sum + minor(order.total),
      0,
    );
    const inventoryMinor = inventoryRows.reduce((sum, variant) => {
      const inventoryValue = Array.isArray(variant.inventory)
        ? variant.inventory[0]
        : variant.inventory;
      const inventory = (inventoryValue ?? {}) as Row;
      return sum + minor(variant.price) * numeric(inventory.quantity_on_hand);
    }, 0);
    const lowStock = inventoryRows.filter((variant) => {
      const inventoryValue = Array.isArray(variant.inventory)
        ? variant.inventory[0]
        : variant.inventory;
      const inventory = (inventoryValue ?? {}) as Row;
      return (
        numeric(inventory.quantity_on_hand) -
          numeric(inventory.quantity_reserved) <=
        numeric(inventory.low_stock_threshold)
      );
    }).length;
    const waiting = orderRows.filter((order) =>
      ["draft", "pending_payment", "confirmed"].includes(String(order.status)),
    ).length;
    const statusCount = (status: string) =>
      orderRows.filter((order) => String(order.status) === status).length;

    const dayBuckets = Array.from({ length: 7 }, (_, index) => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - (6 - index));
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      return {
        label: start.toLocaleDateString("en-BD", { weekday: "short" }),
        revenueMinor: revenueOrders
          .filter((order) => {
            const created = new Date(String(order.created_at));
            return created >= start && created < end;
          })
          .reduce((sum, order) => sum + minor(order.total), 0),
      };
    });

    return dashboardSchema.parse({
      revenueMinor,
      orders: orderRows.length,
      profitMinor: 0,
      inventoryMinor,
      metrics: [
        {
          label: "Revenue",
          valueMinor: revenueMinor,
          comparison: "Live storefront orders in this period",
        },
        {
          label: "Gross profit",
          valueMinor: 0,
          comparison: "Awaiting variant-level COGS allocation",
        },
      ],
      trend: dayBuckets,
      alerts: [
        {
          id: "live-stock",
          title: `${lowStock} low-stock variants`,
          detail: "Review website availability and replenish stock",
          severity: lowStock > 0 ? "critical" : "info",
          href: "/inventory?stock=critical",
        },
        {
          id: "live-orders",
          title: `${waiting} orders need attention`,
          detail: "Confirm payment and begin fulfilment",
          severity: waiting > 0 ? "warning" : "info",
          href: "/orders?status=placed",
        },
        {
          id: "live-content",
          title: "Storefront connection active",
          detail: "Catalog, orders and inventory share one source of truth",
          severity: "info",
          href: "/products",
        },
      ],
      recentOrders: orderRows.slice(0, 8).map((order) => ({
        id: String(order.order_number ?? order.id),
        customer: String(order.contact_name ?? "Guest customer"),
        channel: "Website",
        totalMinor: minor(order.total),
        payment: String(order.payment_method ?? "pending").toUpperCase(),
        status: String(order.status ?? "draft").replaceAll("_", " "),
      })),
      fulfillment: {
        confirmed: statusCount("confirmed"),
        packed: statusCount("processing"),
        shipped: statusCount("shipped"),
        delivered: statusCount("delivered"),
      },
      channelRevenue: [
        { channel: "Online", revenueMinor, share: revenueMinor > 0 ? 100 : 0 },
        { channel: "Branch", revenueMinor: 0, share: 0 },
      ],
      summary: isBranchOnly
        ? "Branch sales are not yet present in the shared storefront dataset."
        : `Live ${input.range} website performance from Sonai commerce.`,
    });
  }
}
