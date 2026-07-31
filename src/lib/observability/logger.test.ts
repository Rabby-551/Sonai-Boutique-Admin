import { afterEach, describe, expect, it, vi } from "vitest";
import { logServerEvent } from "./logger";

describe("safe server logging", () => {
  afterEach(() => vi.restoreAllMocks());

  it("recursively redacts identity, credential, and payment fields", () => {
    const writer = vi
      .spyOn(console, "info")
      .mockImplementation(() => undefined);
    logServerEvent("info", "test_event", {
      correlationId: "correlation-1",
      phone: "+8801711111111",
      nested: { email: "person@example.test", password: "secret-value" },
      safeCount: 4,
    });
    const output = String(writer.mock.calls[0]?.[0]);
    expect(output).toContain('"event":"test_event"');
    expect(output).toContain('"safeCount":4');
    expect(output).not.toContain("+8801711111111");
    expect(output).not.toContain("person@example.test");
    expect(output).not.toContain("secret-value");
    expect(output.match(/\[REDACTED\]/g)?.length).toBe(3);
  });
});
