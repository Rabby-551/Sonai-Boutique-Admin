import { describe, expect, it } from "vitest";
import { can } from "./permissions";

describe("role permissions", () => {
  it("gives the owner access to sensitive administration", () =>
    expect(can("owner", "payroll.manage")).toBe(true));
  it("keeps cashier away from payroll", () =>
    expect(can("cashier", "payroll.manage")).toBe(false));
  it("allows support to resolve complaints", () =>
    expect(can("support", "complaints.manage")).toBe(true));
  it("separates catalog viewing from catalog management", () => {
    expect(can("cashier", "catalog.view")).toBe(true);
    expect(can("cashier", "catalog.manage")).toBe(false);
    expect(can("manager", "catalog.manage")).toBe(true);
  });
  it("enforces Phase 3 operating and approval boundaries", () => {
    expect(can("manager", "inventory.approve")).toBe(true);
    expect(can("cashier", "inventory.count")).toBe(true);
    expect(can("cashier", "inventory.adjust")).toBe(false);
    expect(can("cashier", "orders.cancel")).toBe(false);
    expect(can("support", "orders.note")).toBe(true);
    expect(can("support", "orders.fulfill")).toBe(false);
  });
  it("enforces Phase 4 relationship and procurement boundaries", () => {
    expect(can("owner", "loyalty.configure")).toBe(true);
    expect(can("manager", "loyalty.configure")).toBe(false);
    expect(can("manager", "procurement.approve")).toBe(true);
    expect(can("cashier", "complaints.create")).toBe(true);
    expect(can("cashier", "procurement.view")).toBe(false);
    expect(can("support", "complaints.manage")).toBe(true);
    expect(can("support", "loyalty.adjust")).toBe(false);
  });
  it("enforces Phase 5 payroll and administration boundaries", () => {
    expect(can("owner", "payroll.approve")).toBe(true);
    expect(can("manager", "payroll.manage")).toBe(true);
    expect(can("manager", "payroll.approve")).toBe(false);
    expect(can("manager", "roles.manage")).toBe(false);
    expect(can("cashier", "attendance.view")).toBe(true);
    expect(can("support", "reports.view")).toBe(false);
  });
  it("keeps POS selling and approval duties separate", () => {
    expect(can("cashier", "pos.sell")).toBe(true);
    expect(can("cashier", "pos.shift")).toBe(true);
    expect(can("cashier", "pos.approve")).toBe(false);
    expect(can("manager", "pos.approve")).toBe(true);
    expect(can("manager", "pos.configure")).toBe(true);
    expect(can("support", "pos.sell")).toBe(false);
  });
});
