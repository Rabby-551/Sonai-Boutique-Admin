import "server-only";

import { createSonaiSupabaseServerClient } from "@/lib/supabase/server";
import {
  categorySchema,
  productSchema,
  type Category,
  type CategoryMutationInput,
  type Product,
  type ProductMutationInput,
} from "../schemas/catalog";
import { CatalogError } from "./catalog-errors";
import type {
  CatalogRepository,
  CsvImportRow,
  ProductListInput,
} from "./repository";

type JsonRecord = Record<string, unknown>;

const record = (value: unknown): JsonRecord =>
  value && typeof value === "object" ? (value as JsonRecord) : {};
const records = (value: unknown): JsonRecord[] =>
  Array.isArray(value) ? value.map(record) : [];
const text = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : fallback;
const number = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};
const minor = (value: unknown) => Math.round(number(value) * 100);
const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

async function client() {
  const supabase = await createSonaiSupabaseServerClient();
  if (!supabase)
    throw new CatalogError(
      "STORE_INVALID",
      "The live Sonai commerce connection is not configured.",
    );
  return supabase;
}

function toCategory(row: JsonRecord): Category {
  return categorySchema.parse({
    id: text(row.id),
    name: text(row.name_en, "Untitled category"),
    slug: text(row.slug),
    parentId: null,
    displayOrder: number(row.sort_order),
    status: row.active === false ? "archived" : "active",
    version: 1,
  });
}

function toProduct(row: JsonRecord): Product {
  const translations = records(row.product_translations);
  const english =
    translations.find((item) => item.locale === "en") ?? translations[0] ?? {};
  const variantRows = records(row.product_variants);
  const variants = variantRows.map((variant) => {
    const inventory =
      records(variant.inventory)[0] ?? record(variant.inventory);
    return {
      id: text(variant.id),
      sku: text(variant.sku),
      color: text(variant.colour_en, "Default"),
      size: text(variant.size, "Free"),
      priceMinor: minor(variant.price),
      stock: Math.max(
        number(inventory.quantity_on_hand) -
          number(inventory.quantity_reserved),
        0,
      ),
      barcode: text(variant.barcode, text(variant.sku)),
      active: variant.active !== false,
    };
  });
  const basePrice = variants.length
    ? Math.min(...variants.map((variant) => variant.priceMinor ?? 0))
    : 0;
  const thresholds = variantRows.map((variant) => {
    const inventory =
      records(variant.inventory)[0] ?? record(variant.inventory);
    return number(inventory.low_stock_threshold, 2);
  });
  const tags = Array.isArray(row.admin_tags)
    ? row.admin_tags.filter((tag): tag is string => typeof tag === "string")
    : [];
  const images = records(row.media_assets).map((image, index) => {
    const path = text(image.storage_path);
    const extension = path.split(".").pop()?.toLowerCase();
    const mimeType =
      image.mime_type ??
      (extension === "png"
        ? "image/png"
        : extension === "webp"
          ? "image/webp"
          : "image/jpeg");
    return {
      id: text(image.id),
      name: text(
        image.file_name,
        path.split("/").pop() || `image-${index + 1}`,
      ),
      altText: text(image.alt_en, text(english.name, "Sonai product image")),
      mimeType,
      sizeBytes: Math.max(number(image.size_bytes, 1), 1),
      position: number(image.sort_order, index),
      previewUrl: path,
    };
  });
  const rawStatus = text(row.status);

  return productSchema.parse({
    id: text(row.id),
    name: text(english.name, "Untitled product"),
    slug: text(row.slug),
    description: text(
      english.description,
      "Sonai Boutique product description pending.",
    ),
    categoryId: text(row.category_id),
    priceMinor: basePrice,
    costMinor: minor(row.cost),
    lowStockThreshold: thresholds.length ? Math.min(...thresholds) : 2,
    tags,
    status:
      rawStatus === "active" || rawStatus === "archived" ? rawStatus : "draft",
    variants,
    images,
    version: Math.max(number(row.version, 1), 1),
    createdAt: text(row.created_at, new Date(0).toISOString()),
    updatedAt: text(row.updated_at, new Date(0).toISOString()),
  });
}

const productSelect = `
  id, category_id, slug, status, cost, version, admin_tags, created_at, updated_at,
  product_translations(locale, name, description),
  product_variants(
    id, sku, colour_en, size, price, barcode, active,
    inventory(quantity_on_hand, quantity_reserved, low_stock_threshold)
  ),
  media_assets(id, storage_path, alt_en, sort_order, file_name, mime_type, size_bytes)
`;

/** Live catalog adapter backed by the same Supabase tables used by the storefront. */
export class SupabaseCatalogRepository implements CatalogRepository {
  async listProducts(input: ProductListInput) {
    const supabase = await client();
    let query = supabase.from("products").select(productSelect);
    if (input.categoryId) query = query.eq("category_id", input.categoryId);
    if (input.status && input.status !== "all")
      query = query.eq("status", input.status);
    const { data, error } = await query.order("updated_at", {
      ascending: false,
    });
    if (error) throw new CatalogError("STORE_INVALID", error.message);

    let items = records(data).map(toProduct);
    if (input.query) {
      const needle = input.query.toLowerCase();
      items = items.filter(
        (product) =>
          product.name.toLowerCase().includes(needle) ||
          product.variants.some((variant) =>
            variant.sku.toLowerCase().includes(needle),
          ),
      );
    }
    if (input.stock && input.stock !== "all") {
      items = items.filter((product) => {
        const stock = product.variants.reduce(
          (sum, variant) => sum + variant.stock,
          0,
        );
        if (input.stock === "out") return stock === 0;
        if (input.stock === "low")
          return stock > 0 && stock <= product.lowStockThreshold;
        return stock > product.lowStockThreshold;
      });
    }
    if (input.minPriceMinor !== undefined)
      items = items.filter((item) => item.priceMinor >= input.minPriceMinor!);
    if (input.maxPriceMinor !== undefined)
      items = items.filter((item) => item.priceMinor <= input.maxPriceMinor!);
    items.sort((a, b) => {
      if (input.sort === "name-asc") return a.name.localeCompare(b.name);
      if (input.sort === "price-asc") return a.priceMinor - b.priceMinor;
      if (input.sort === "price-desc") return b.priceMinor - a.priceMinor;
      if (input.sort === "stock-asc")
        return (
          a.variants.reduce((sum, item) => sum + item.stock, 0) -
          b.variants.reduce((sum, item) => sum + item.stock, 0)
        );
      return b.updatedAt.localeCompare(a.updatedAt);
    });

    const page = Math.max(input.page ?? 1, 1);
    const pageSize = Math.max(input.pageSize ?? 20, 1);
    const totalItems = items.length;
    return {
      items: items.slice((page - 1) * pageSize, page * pageSize),
      page,
      pageSize,
      totalItems,
      totalPages: Math.max(Math.ceil(totalItems / pageSize), 1),
    };
  }

  async getProduct(id: string) {
    const supabase = await client();
    const { data, error } = await supabase
      .from("products")
      .select(productSelect)
      .eq("id", id)
      .maybeSingle();
    if (error) throw new CatalogError("STORE_INVALID", error.message);
    return data ? toProduct(record(data)) : null;
  }

  async createProduct(input: ProductMutationInput) {
    return this.saveProduct(undefined, input);
  }

  async updateProduct(id: string, input: ProductMutationInput) {
    return this.saveProduct(id, input);
  }

  private async saveProduct(
    id: string | undefined,
    input: ProductMutationInput,
  ) {
    const supabase = await client();
    const { data, error } = await supabase.rpc("admin_upsert_product", {
      payload: { id, ...input },
    });
    if (error)
      throw new CatalogError(
        error.code === "40001" ? "CONFLICT" : "STORE_INVALID",
        error.message,
      );
    const product = await this.getProduct(String(data));
    if (!product)
      throw new CatalogError("NOT_FOUND", "Saved product was not found.");
    return product;
  }

  async archiveProduct(id: string, version: number) {
    const supabase = await client();
    const { data, error } = await supabase
      .from("products")
      .update({ status: "archived", version: version + 1 })
      .eq("id", id)
      .eq("version", version)
      .select("id")
      .maybeSingle();
    if (error) throw new CatalogError("STORE_INVALID", error.message);
    if (!data)
      throw new CatalogError(
        "CONFLICT",
        "The product changed before it was archived.",
      );
    const product = await this.getProduct(id);
    if (!product) throw new CatalogError("NOT_FOUND", "Product not found.");
    return product;
  }

  async listCategories() {
    const supabase = await client();
    const { data, error } = await supabase
      .from("categories")
      .select("id,slug,name_en,sort_order,active")
      .order("sort_order");
    if (error) throw new CatalogError("STORE_INVALID", error.message);
    return records(data).map(toCategory);
  }

  async createCategory(input: CategoryMutationInput) {
    const supabase = await client();
    const suffix = crypto.randomUUID().slice(0, 8);
    const { data, error } = await supabase
      .from("categories")
      .insert({
        slug: `${slugify(input.name)}-${suffix}`,
        name_en: input.name,
        name_bn: input.name,
        sort_order: input.displayOrder,
        active: input.status === "active",
      })
      .select("id,slug,name_en,sort_order,active")
      .single();
    if (error) throw new CatalogError("STORE_INVALID", error.message);
    return toCategory(record(data));
  }

  async updateCategory(id: string, input: CategoryMutationInput) {
    const supabase = await client();
    const { data, error } = await supabase
      .from("categories")
      .update({
        name_en: input.name,
        sort_order: input.displayOrder,
        active: input.status === "active",
      })
      .eq("id", id)
      .select("id,slug,name_en,sort_order,active")
      .maybeSingle();
    if (error) throw new CatalogError("STORE_INVALID", error.message);
    if (!data) throw new CatalogError("NOT_FOUND", "Category not found.");
    return toCategory(record(data));
  }

  async archiveCategory(id: string, version: number) {
    void version;
    const supabase = await client();
    const { count } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("category_id", id)
      .neq("status", "archived");
    if (count)
      throw new CatalogError(
        "CATEGORY_IN_USE",
        "Archive or move active products before archiving this category.",
      );
    return this.updateCategory(id, {
      ...(await this.listCategories()).find((item) => item.id === id)!,
      status: "archived",
    });
  }

  async importProducts(rows: readonly CsvImportRow[]) {
    const categories = await this.listCategories();
    const productIds: string[] = [];
    let skipped = 0;
    for (const row of rows) {
      const category = categories.find(
        (item) => item.name.toLowerCase() === row.category.toLowerCase(),
      );
      if (!category) {
        skipped += 1;
        continue;
      }
      const product = await this.createProduct({
        name: row.name,
        description: `${row.name} imported into the Sonai Boutique catalog.`,
        categoryId: category.id,
        priceMinor: row.priceMinor,
        costMinor: row.costMinor,
        lowStockThreshold: 2,
        tags: [],
        status: row.status,
        variants: [
          {
            id: `var-${crypto.randomUUID()}`,
            sku: row.sku,
            color: row.color,
            size: row.size,
            priceMinor: null,
            barcode: row.sku.replaceAll("-", ""),
            active: true,
          },
        ],
        images: [],
      });
      productIds.push(product.id);
    }
    return { imported: productIds.length, skipped, productIds };
  }
}
