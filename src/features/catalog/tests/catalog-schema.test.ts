import { describe, expect, it } from "vitest";
import { initialCatalogStore } from "../data/fixtures";
import { catalogStoreSchema, productMutationSchema } from "../schemas/catalog";

describe("catalog schemas", () => {
  it("validates deterministic fixtures", () =>
    expect(catalogStoreSchema.parse(initialCatalogStore).products).toHaveLength(
      4,
    ));
  it("rejects cost above selling price", () => {
    const product = initialCatalogStore.products[0];
    expect(() =>
      productMutationSchema.parse({
        ...product,
        priceMinor: 100,
        costMinor: 101,
      }),
    ).toThrow(/Cost cannot exceed/);
  });
  it("rejects duplicate variant SKUs", () => {
    const product = initialCatalogStore.products[0];
    expect(() =>
      productMutationSchema.parse({
        ...product,
        variants: [
          product.variants[0],
          { ...product.variants[0], id: "other" },
        ],
      }),
    ).toThrow(/unique/);
  });
});
