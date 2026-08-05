import { describe, expect, it } from "vitest";
import {
  allocateDiscount,
  cashImpact,
  normalizeBangladeshPhone,
  tenderBalance,
} from "../utils/pricing";

describe("POS pricing and money helpers", () => {
  it("normalizes Bangladesh phone numbers without accepting invalid input", () => {
    expect(normalizeBangladeshPhone("01712-345678")).toBe("+8801712345678");
    expect(normalizeBangladeshPhone("+880 1712 345678")).toBe("+8801712345678");
    expect(normalizeBangladeshPhone("1234")).toBeNull();
  });

  it("allocates the exact discount deterministically", () => {
    expect(
      allocateDiscount(
        [
          { quantity: 1, unitPriceMinor: 10_000 },
          { quantity: 1, unitPriceMinor: 20_000 },
        ],
        10_001,
      ),
    ).toEqual([3_333, 6_668]);
  });

  it("tracks payment, refund and cash-drawer impact independently", () => {
    const tenders = [
      {
        id: "cash",
        kind: "cash" as const,
        direction: "payment" as const,
        providerId: null,
        reference: null,
        amountMinor: 40_000,
        receivedMinor: 50_000,
        changeMinor: 10_000,
        recordedAt: "2026-08-01T00:00:00.000Z",
      },
      {
        id: "mfs",
        kind: "mfs" as const,
        direction: "payment" as const,
        providerId: "mfs-bkash",
        reference: "TEST-001",
        amountMinor: 60_000,
        receivedMinor: null,
        changeMinor: 0,
        recordedAt: "2026-08-01T00:00:00.000Z",
      },
    ];
    expect(tenderBalance(tenders)).toBe(100_000);
    expect(cashImpact(tenders)).toBe(40_000);
  });
});
