import { NextRequest, NextResponse } from "next/server";
import { dashboardQuerySchema } from "@/features/dashboard/schemas/dashboard-schema";
import { getDashboardWorkspace } from "@/features/dashboard/server/queries";
import {
  checkRateLimit,
  rateLimitHeaders,
  requestRateLimitKey,
} from "@/lib/security/rate-limit";

const escape = (value: unknown) =>
  `"${String(value ?? "").replaceAll('"', '""')}"`;
const csv = (rows: unknown[][]) =>
  `\uFEFF${rows.map((row) => row.map(escape).join(",")).join("\r\n")}`;

export async function GET(request: NextRequest) {
  const rateLimit = checkRateLimit(
    requestRateLimitKey(request, "dashboard-export"),
    { limit: 20, windowMs: 60_000 },
  );
  if (!rateLimit.allowed) {
    return new NextResponse("Too many export requests", {
      status: 429,
      headers: rateLimitHeaders(rateLimit),
    });
  }
  const raw = Object.fromEntries(request.nextUrl.searchParams);
  const view = raw.view === "orders" ? "orders" : "summary";
  delete raw.view;
  if (view === "orders") raw.orderPageSize = "25";
  const query = dashboardQuerySchema.parse(raw);
  const dashboard = await getDashboardWorkspace(query);
  const rows: unknown[][] =
    view === "orders"
      ? [
          [
            "Order",
            "Channel",
            "Location",
            "Total minor",
            "Payment",
            "Status",
            "Updated",
          ],
        ]
      : [["Metric", "Value", "Format", "Comparison percent", "Note"]];
  if (view === "orders" && dashboard.orders.status !== "unavailable") {
    rows.push(
      ...dashboard.orders.data.items.map((order) => [
        order.id,
        order.channel,
        order.location,
        order.totalMinor,
        order.payment,
        order.status,
        order.updatedAt,
      ]),
    );
  }
  if (view === "summary" && dashboard.overview.status !== "unavailable") {
    rows.push(
      ...dashboard.overview.data.metrics.map((metric) => [
        metric.id,
        metric.value,
        metric.format,
        metric.comparisonPercent,
        metric.note,
      ]),
    );
  }
  return new NextResponse(csv(rows), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="sonai-dashboard-${view}.csv"`,
      "cache-control": "no-store",
      ...rateLimitHeaders(rateLimit),
    },
  });
}
