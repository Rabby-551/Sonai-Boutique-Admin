import { describe, expect, it } from "vitest";
import { formatDate, formatMoney } from "./formatting";

describe("Bangladeshi formatting", () => {
  it("converts integer poisha to BDT display values", () =>
    expect(formatMoney(1250000)).toContain("12,500"));
  it("formats ISO input as a readable date", () =>
    expect(formatDate("2026-07-29T12:00:00.000Z")).toContain("2026"));
});
