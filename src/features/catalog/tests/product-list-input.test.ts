import { describe, expect, it } from "vitest";
import { parseProductListSearch } from "../utils/product-list-input";

describe("product list URL parsing", () => {
  it("converts BDT price filters and pagination to repository values", () => {
    const { input, values } = parseProductListSearch({
      query: ["saree", "ignored"],
      minPrice: "125.50",
      maxPrice: "900",
      page: "3",
      sort: "price-desc",
    });

    expect(values.query).toBe("saree");
    expect(input).toMatchObject({
      query: "saree",
      minPriceMinor: 12_550,
      maxPriceMinor: 90_000,
      page: 3,
      pageSize: 10,
      sort: "price-desc",
    });
  });
});
