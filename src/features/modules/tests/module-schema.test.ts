import { describe, expect, it } from "vitest";
import { moduleListSchema } from "../schemas/module-schema";

describe("moduleListSchema", () => {
  it("accepts stable identifiers and scalar display fields", () => {
    expect(
      moduleListSchema.parse([{ id: "SKU-1", stock: 4, status: "Active" }]),
    ).toHaveLength(1);
  });
  it("rejects records without identifiers", () => {
    expect(() => moduleListSchema.parse([{ status: "Active" }])).toThrow();
  });
});
