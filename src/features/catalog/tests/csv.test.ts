import { describe, expect, it } from "vitest";
import { parseCatalogCsv } from "../utils/csv";

const header = "name,sku,category,price,cost,color,size,stock,status";
describe("catalog CSV", () => {
  it("converts BDT inputs to integer poisha", () => {
    const result = parseCatalogCsv(
      `${header}\nTest Saree,SKU-1,Sarees,12500,7000,Blue,Free,4,active`,
    );
    expect(result.rows[0].value?.priceMinor).toBe(1_250_000);
  });
  it("keeps duplicate and invalid rows visible", () => {
    const result = parseCatalogCsv(
      `${header}\nTest Saree,SKU-1,Sarees,10,20,Blue,Free,-1,wrong`,
      ["SKU-1"],
    );
    expect(result.rows[0].value).toBeNull();
    expect(result.rows[0].errors.length).toBeGreaterThan(2);
  });
  it("reports missing required headers", () => {
    const result = parseCatalogCsv("name,sku\nA,B");
    expect(result.rows[0].errors[0]).toContain("Missing headers");
  });
});
