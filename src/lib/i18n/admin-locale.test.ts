import { describe, expect, it } from "vitest";
import { findNavigationItem, navigationForRole } from "@/lib/navigation";
import {
  adminDictionaries,
  isAdminLocale,
  localizeAdminTerm,
} from "./admin-locale";

describe("admin localization", () => {
  it("accepts only supported dashboard locales", () => {
    expect(isAdminLocale("en")).toBe(true);
    expect(isAdminLocale("bn")).toBe(true);
    expect(isAdminLocale("bgd")).toBe(false);
  });

  it("localizes role-filtered navigation without changing route identity", () => {
    const groups = navigationForRole("owner", "bn");
    expect(groups[0]?.label).toBe("ওভারভিউ");
    expect(groups[0]?.items[0]).toMatchObject({
      href: "/dashboard",
      label: "ড্যাশবোর্ড",
    });
    expect(findNavigationItem("/products/new", "owner", "bn")?.label).toBe(
      "পণ্য",
    );
  });

  it("keeps Bengali shell copy and operational terms available", () => {
    expect(adminDictionaries.bn.shell.skipToContent).toBe("মূল কনটেন্টে যান");
    expect(localizeAdminTerm("delivered", "bn")).toBe("ডেলিভারি হয়েছে");
  });
});
