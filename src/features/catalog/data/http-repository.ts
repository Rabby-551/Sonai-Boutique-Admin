import "server-only";
import { z } from "zod";
import { env } from "@/lib/env";
import {
  categorySchema,
  productSchema,
  type CategoryMutationInput,
  type ProductMutationInput,
} from "../schemas/catalog";
import type {
  CatalogRepository,
  CsvImportRow,
  ProductListInput,
} from "./repository";

const productPageSchema = z.object({
  items: z.array(productSchema),
  page: z.number(),
  pageSize: z.number(),
  totalItems: z.number(),
  totalPages: z.number(),
});

/** API-TODO: align URLs and the response envelope when the backend contract is supplied. */
export class HttpCatalogRepository implements CatalogRepository {
  private async request(path: string, init?: RequestInit) {
    const response = await fetch(`${env.API_BASE_URL}${path}`, {
      ...init,
      headers: { "content-type": "application/json", ...init?.headers },
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`CATALOG_API_${response.status}`);
    return response.json() as Promise<unknown>;
  }
  async listProducts(input: ProductListInput) {
    const params = new URLSearchParams(
      Object.entries(input)
        .filter((entry) => entry[1] !== undefined)
        .map(([key, value]) => [key, String(value)]),
    );
    return productPageSchema.parse(await this.request(`/products?${params}`));
  }
  async getProduct(id: string) {
    return productSchema
      .nullable()
      .parse(await this.request(`/products/${id}`));
  }
  async createProduct(input: ProductMutationInput) {
    return productSchema.parse(
      await this.request("/products", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    );
  }
  async updateProduct(id: string, input: ProductMutationInput) {
    return productSchema.parse(
      await this.request(`/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    );
  }
  async archiveProduct(id: string, version: number) {
    return productSchema.parse(
      await this.request(`/products/${id}/archive`, {
        method: "POST",
        body: JSON.stringify({ version }),
      }),
    );
  }
  async listCategories() {
    return z.array(categorySchema).parse(await this.request("/categories"));
  }
  async createCategory(input: CategoryMutationInput) {
    return categorySchema.parse(
      await this.request("/categories", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    );
  }
  async updateCategory(id: string, input: CategoryMutationInput) {
    return categorySchema.parse(
      await this.request(`/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    );
  }
  async archiveCategory(id: string, version: number) {
    return categorySchema.parse(
      await this.request(`/categories/${id}/archive`, {
        method: "POST",
        body: JSON.stringify({ version }),
      }),
    );
  }
  async importProducts(rows: readonly CsvImportRow[]) {
    return z
      .object({
        imported: z.number(),
        skipped: z.number(),
        productIds: z.array(z.string()),
      })
      .parse(
        await this.request("/products/import", {
          method: "POST",
          body: JSON.stringify({ rows }),
        }),
      );
  }
}
