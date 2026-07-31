import { describe, expect, it } from "vitest";
import {
  findNavigationItem,
  isNavigationItemActive,
  navigationForRole,
} from "./navigation";

describe("admin navigation", () => {
  it("uses exact matching for dashboard", () => {
    const dashboard = navigationForRole("owner")[0].items[0];
    expect(isNavigationItemActive(dashboard, "/dashboard")).toBe(true);
    expect(isNavigationItemActive(dashboard, "/dashboard/archive")).toBe(false);
  });

  it("maps contextual routes to their most specific parent", () => {
    expect(findNavigationItem("/products/prod-1/edit")?.label).toBe("Products");
    expect(findNavigationItem("/customers/segments/seg-1")?.label).toBe(
      "Segments",
    );
    expect(findNavigationItem("/settings/localization")?.label).toBe(
      "Localization",
    );
  });

  it("filters navigation using the current role permissions", () => {
    const labels = navigationForRole("support").flatMap((group) =>
      group.items.map((item) => item.label),
    );
    expect(labels).toContain("Complaints");
    expect(labels).not.toContain("Payroll");
    expect(labels).not.toContain("Settings");
  });

  it("keeps all approved navigation groups available to owners", () => {
    expect(navigationForRole("owner").map((group) => group.label)).toEqual([
      "Overview",
      "Commerce",
      "Relationships & supply",
      "Growth & finance",
      "People & governance",
      "Platform & review",
    ]);
  });
});
