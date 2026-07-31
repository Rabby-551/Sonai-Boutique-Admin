import { beforeEach, describe, expect, it } from "vitest";
import { checkRateLimit, resetRateLimits } from "./rate-limit";

describe("fixed-window rate limiter", () => {
  beforeEach(resetRateLimits);

  it("blocks requests above the limit and reports retry timing", () => {
    expect(
      checkRateLimit("export:user", { limit: 2, windowMs: 1_000, now: 0 })
        .allowed,
    ).toBe(true);
    expect(
      checkRateLimit("export:user", { limit: 2, windowMs: 1_000, now: 1 })
        .allowed,
    ).toBe(true);
    const blocked = checkRateLimit("export:user", {
      limit: 2,
      windowMs: 1_000,
      now: 2,
    });
    expect(blocked).toMatchObject({
      allowed: false,
      remaining: 0,
      retryAfterSeconds: 1,
    });
  });

  it("starts a new window after expiry", () => {
    checkRateLimit("barcode:user", { limit: 1, windowMs: 100, now: 10 });
    expect(
      checkRateLimit("barcode:user", { limit: 1, windowMs: 100, now: 110 })
        .allowed,
    ).toBe(true);
  });
});
