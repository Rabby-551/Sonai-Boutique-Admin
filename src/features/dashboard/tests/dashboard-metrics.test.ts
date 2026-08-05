import { describe, expect, it } from "vitest";
import { dashboardQuerySchema } from "../schemas/dashboard-schema";
import {
  aggregateChannelShare,
  averageOrderValue,
  deliverySuccess,
  percentChange,
  precedingWindow,
  protectDistricts,
  resolveDateWindow,
} from "../utils/dashboard-metrics";

describe("dashboard query and retail metrics", () => {
  it("uses dashboard defaults and accepts namespaced order controls", () => {
    const result = dashboardQuerySchema.parse({
      orderPage: "2",
      orderPageSize: "10",
    });
    expect(result).toMatchObject({
      range: "30d",
      compare: true,
      orderPage: 2,
      orderPageSize: 10,
    });
  });

  it("validates chronological custom ranges up to one year", () => {
    expect(
      dashboardQuerySchema.safeParse({
        range: "custom",
        from: "2026-01-01",
        to: "2026-12-31",
      }).success,
    ).toBe(true);
    expect(
      dashboardQuerySchema.safeParse({
        range: "custom",
        from: "2026-08-02",
        to: "2026-08-01",
      }).success,
    ).toBe(false);
    expect(
      dashboardQuerySchema.safeParse({
        range: "custom",
        from: "2024-01-01",
        to: "2026-01-01",
      }).success,
    ).toBe(false);
  });

  it("builds an immediately preceding equal-length period", () => {
    const query = dashboardQuerySchema.parse({ range: "7d" });
    const current = resolveDateWindow(
      query,
      new Date("2026-08-05T06:00:00.000Z"),
    );
    const previous = precedingWindow(current);
    expect(current.end.getTime() - current.start.getTime()).toBe(
      previous.end.getTime() - previous.start.getTime(),
    );
    expect(previous.end.getTime()).toBe(current.start.getTime() - 1);
  });

  it("never reports infinite ratios for zero denominators", () => {
    expect(percentChange(120, 0)).toBeNull();
    expect(averageOrderValue(1000, 0)).toBe(0);
    expect(deliverySuccess(0, 0, 0)).toBeNull();
    expect(deliverySuccess(90, 5, 5)).toBe(90);
  });

  it("rolls districts below the privacy threshold into Other", () => {
    const result = protectDistricts([
      { name: "Dhaka", orders: 8 },
      { name: "Small", orders: 4 },
    ]);
    expect(result.visible).toEqual([{ name: "Dhaka", orders: 8 }]);
    expect(result.otherOrders).toBe(4);
  });

  it("aggregates channel shares without a zero-total division", () => {
    expect(
      aggregateChannelShare([{ revenueMinor: 75 }, { revenueMinor: 25 }]).map(
        (item) => item.share,
      ),
    ).toEqual([75, 25]);
    expect(aggregateChannelShare([{ revenueMinor: 0 }])[0]?.share).toBe(0);
  });
});
