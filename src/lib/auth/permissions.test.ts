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
});
