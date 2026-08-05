import { describe, expect, it } from "vitest";
import { MockDashboardRepository } from "../data/mock-repository";
import {
  dashboardQuerySchema,
  dashboardWorkspaceSchema,
} from "../schemas/dashboard-schema";

describe("mock premium dashboard contract", () => {
  it("returns every independently sourced panel group", async () => {
    const query = dashboardQuerySchema.parse({ range: "30d" });
    const repository = new MockDashboardRepository();
    const [overview, sales, operations, growth, activity] = await Promise.all([
      repository.getOverview(query),
      repository.getSales(query),
      repository.getOperations(query),
      repository.getGrowth(query),
      repository.getActivity(query),
    ]);
    const result = dashboardWorkspaceSchema.parse({
      query,
      ...overview,
      ...sales,
      ...operations,
      ...growth,
      ...activity,
    });
    expect(result.overview.status).toBe("ready");
    if (result.overview.status === "ready")
      expect(result.overview.data.metrics).toHaveLength(6);
    expect(result.geography.status).toBe("ready");
    if (result.geography.status === "ready")
      expect(
        result.geography.data.districts.every(
          (district) => district.orders >= 5,
        ),
      ).toBe(true);
    expect(result.orders.status).toBe("ready");
  });

  it("applies namespaced search, status and pagination", async () => {
    const query = dashboardQuerySchema.parse({
      orderSearch: "1848",
      orderStatus: "confirmed",
      orderPageSize: "5",
    });
    const result = await new MockDashboardRepository().getActivity(query);
    expect(result.orders.status).toBe("ready");
    if (result.orders.status === "ready") {
      expect(result.orders.data.items).toHaveLength(1);
      expect(result.orders.data.items[0]?.id).toContain("1848");
    }
  });
});
