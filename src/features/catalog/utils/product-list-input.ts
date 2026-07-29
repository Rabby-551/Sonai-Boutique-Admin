import type { ProductListInput, ProductSort } from "../data/repository";

export type ProductSearchParams = Record<string, string | string[] | undefined>;

/** Converts shareable product-list URL state into repository filters and poisha values. */
export function parseProductListSearch(raw: ProductSearchParams) {
  const values = Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  ) as Record<string, string | undefined>;
  const input: ProductListInput = {
    query: values.query,
    categoryId: values.categoryId,
    status: values.status as ProductListInput["status"],
    stock: values.stock as ProductListInput["stock"],
    sort: values.sort as ProductSort,
    minPriceMinor: values.minPrice
      ? Math.round(Number(values.minPrice) * 100)
      : undefined,
    maxPriceMinor: values.maxPrice
      ? Math.round(Number(values.maxPrice) * 100)
      : undefined,
    page: Number(values.page) || 1,
    pageSize: 10,
  };
  return { input, values };
}
