import type { DashboardQuery } from "../schemas/dashboard-schema";

const DAY = 86_400_000;
const DHAKA_OFFSET = "+06:00";

export interface DateWindow {
  start: Date;
  end: Date;
}

function startOfDhakaDay(date: Date) {
  const key = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  return new Date(`${key}T00:00:00${DHAKA_OFFSET}`);
}

export function resolveDateWindow(
  query: DashboardQuery,
  now = new Date(),
): DateWindow {
  const today = startOfDhakaDay(now);
  const end = new Date(today.getTime() + DAY - 1);
  if (query.range === "custom" && query.from && query.to) {
    return {
      start: new Date(`${query.from}T00:00:00${DHAKA_OFFSET}`),
      end: new Date(`${query.to}T23:59:59.999${DHAKA_OFFSET}`),
    };
  }
  if (query.range === "today") return { start: today, end };
  if (query.range === "month") {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Dhaka",
      year: "numeric",
      month: "2-digit",
    }).format(now);
    return { start: new Date(`${parts}-01T00:00:00${DHAKA_OFFSET}`), end };
  }
  const days =
    query.range === "7d"
      ? 7
      : query.range === "30d"
        ? 30
        : query.range === "quarter"
          ? 90
          : 365;
  return { start: new Date(today.getTime() - (days - 1) * DAY), end };
}

export function precedingWindow(window: DateWindow): DateWindow {
  const length = window.end.getTime() - window.start.getTime() + 1;
  return {
    start: new Date(window.start.getTime() - length),
    end: new Date(window.start.getTime() - 1),
  };
}

export function percentChange(current: number, previous: number) {
  return previous === 0
    ? null
    : ((current - previous) / Math.abs(previous)) * 100;
}

export function averageOrderValue(revenueMinor: number, orders: number) {
  return orders === 0 ? 0 : Math.round(revenueMinor / orders);
}

export function deliverySuccess(
  delivered: number,
  returned: number,
  cancelled: number,
) {
  const terminal = delivered + returned + cancelled;
  return terminal === 0 ? null : (delivered / terminal) * 100;
}

export function protectDistricts<T extends { orders: number }>(
  districts: T[],
  threshold = 5,
) {
  return {
    visible: districts.filter((district) => district.orders >= threshold),
    otherOrders: districts
      .filter((district) => district.orders < threshold)
      .reduce((sum, district) => sum + district.orders, 0),
  };
}

export function aggregateChannelShare<T extends { revenueMinor: number }>(
  items: T[],
) {
  const total = items.reduce((sum, item) => sum + item.revenueMinor, 0);
  return items.map((item) => ({
    ...item,
    share: total === 0 ? 0 : (item.revenueMinor / total) * 100,
  }));
}
