import { describe, expect, it } from "vitest";
import { securityHeaders } from "./headers";

describe("security headers", () => {
  it("prevents framing, MIME sniffing, and unnecessary browser capabilities", () => {
    const headers = Object.fromEntries(
      securityHeaders.map(({ key, value }) => [key.toLowerCase(), value]),
    );
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["permissions-policy"]).toContain("camera=()");
    expect(headers["content-security-policy"]).toContain("object-src 'none'");
    expect(headers["content-security-policy"]).toContain(
      "frame-ancestors 'none'",
    );
  });
});
