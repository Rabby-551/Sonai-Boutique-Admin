import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { initialCatalogStore } from "../data/fixtures";
import { ProductTable } from "../components/product-table";

describe("ProductTable", () => {
  it("shows catalog data and read-only actions", () => {
    render(
      <ProductTable
        canManage={false}
        categories={initialCatalogStore.categories}
        products={[initialCatalogStore.products[0]]}
      />,
    );
    expect(screen.getByText("Batik Silk Saree")).toBeVisible();
    expect(screen.getByRole("link", { name: "View" })).toBeVisible();
  });
});
