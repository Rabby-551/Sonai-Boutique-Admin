import { randomUUID } from "node:crypto";
import type {
  Category,
  CategoryMutationInput,
  Product,
  ProductMutationInput,
} from "../schemas/catalog";
import type {
  CatalogRepository,
  CsvImportRow,
  ProductListInput,
  ProductSort,
} from "./repository";
import { CatalogFileStore } from "./file-store";
import { CatalogError } from "./catalog-errors";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
const totalStock = (product: Product) =>
  product.variants.reduce((sum, variant) => sum + variant.stock, 0);

export class FileCatalogRepository implements CatalogRepository {
  constructor(private readonly store = new CatalogFileStore()) {}

  async listProducts(input: ProductListInput) {
    const store = await this.store.read();
    const query = input.query?.trim().toLowerCase();
    let items = this.hydrateProducts(store.products, store.balances).filter(
      (product) => {
        const stock = totalStock(product);
        return (
          (!query ||
            `${product.name} ${product.variants.map((item) => item.sku).join(" ")}`
              .toLowerCase()
              .includes(query)) &&
          (!input.categoryId || product.categoryId === input.categoryId) &&
          (!input.status ||
            input.status === "all" ||
            product.status === input.status) &&
          (!input.stock ||
            input.stock === "all" ||
            (input.stock === "out" && stock === 0) ||
            (input.stock === "low" &&
              stock > 0 &&
              stock <= product.lowStockThreshold) ||
            (input.stock === "in-stock" &&
              stock > product.lowStockThreshold)) &&
          (input.minPriceMinor === undefined ||
            product.priceMinor >= input.minPriceMinor) &&
          (input.maxPriceMinor === undefined ||
            product.priceMinor <= input.maxPriceMinor)
        );
      },
    );
    items = this.sort(items, input.sort ?? "updated-desc");
    const pageSize = Math.min(Math.max(input.pageSize ?? 10, 1), 500);
    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const page = Math.min(Math.max(input.page ?? 1, 1), totalPages);
    return {
      items: items.slice((page - 1) * pageSize, page * pageSize),
      page,
      pageSize,
      totalItems,
      totalPages,
    };
  }

  async getProduct(id: string) {
    const store = await this.store.read();
    return (
      this.hydrateProducts(store.products, store.balances).find(
        (product) => product.id === id,
      ) ?? null
    );
  }

  async createProduct(input: ProductMutationInput) {
    return this.store.transaction((store) => {
      this.assertUniqueVariants(store.products, input.variants);
      const now = new Date().toISOString();
      const product: Product = {
        ...input,
        variants: input.variants.map((variant) => ({ ...variant, stock: 0 })),
        id: `prd-${randomUUID()}`,
        slug: slugify(input.name),
        version: 1,
        createdAt: now,
        updatedAt: now,
      };
      store.products.push(product);
      for (const variant of product.variants)
        for (const location of store.locations)
          store.balances.push({
            variantId: variant.id,
            locationId: location.id,
            onHand: 0,
            reserved: 0,
            thresholdOverride: null,
            version: 1,
          });
      return product;
    });
  }

  async updateProduct(id: string, input: ProductMutationInput) {
    return this.store.transaction((store) => {
      const index = store.products.findIndex((product) => product.id === id);
      if (index < 0) throw new CatalogError("NOT_FOUND", "Product not found.");
      if (input.version !== store.products[index].version)
        throw new CatalogError(
          "CONFLICT",
          "This product changed after you opened it. Refresh and try again.",
        );
      this.assertUniqueVariants(
        store.products.filter((product) => product.id !== id),
        input.variants,
      );
      const updated: Product = {
        ...store.products[index],
        ...input,
        variants: input.variants.map((variant) => ({ ...variant, stock: 0 })),
        slug: slugify(input.name),
        version: store.products[index].version + 1,
        updatedAt: new Date().toISOString(),
      };
      store.products[index] = updated;
      for (const variant of updated.variants)
        for (const location of store.locations)
          if (
            !store.balances.some(
              (balance) =>
                balance.variantId === variant.id &&
                balance.locationId === location.id,
            )
          )
            store.balances.push({
              variantId: variant.id,
              locationId: location.id,
              onHand: 0,
              reserved: 0,
              thresholdOverride: null,
              version: 1,
            });
      return this.hydrateProducts([updated], store.balances)[0];
    });
  }

  async archiveProduct(id: string, version: number) {
    const product = await this.getProduct(id);
    if (!product) throw new CatalogError("NOT_FOUND", "Product not found.");
    return this.updateProduct(id, { ...product, status: "archived", version });
  }

  async listCategories() {
    return (await this.store.read()).categories.sort(
      (a, b) => a.displayOrder - b.displayOrder,
    );
  }

  async createCategory(input: CategoryMutationInput) {
    return this.store.transaction((store) => {
      if (
        store.categories.some(
          (item) => item.name.toLowerCase() === input.name.toLowerCase(),
        )
      )
        throw new CatalogError(
          "DUPLICATE",
          "A category with this name already exists.",
        );
      this.assertValidCategoryParent(store.categories, null, input.parentId);
      const category = {
        ...input,
        id: `cat-${randomUUID()}`,
        slug: slugify(input.name),
        version: 1,
      };
      store.categories.push(category);
      return category;
    });
  }

  async updateCategory(id: string, input: CategoryMutationInput) {
    return this.store.transaction((store) => {
      const index = store.categories.findIndex((item) => item.id === id);
      if (index < 0) throw new CatalogError("NOT_FOUND", "Category not found.");
      if (store.categories[index].version !== input.version)
        throw new CatalogError(
          "CONFLICT",
          "This category changed after you opened it.",
        );
      if (
        store.categories.some(
          (item) =>
            item.id !== id &&
            item.name.toLowerCase() === input.name.toLowerCase(),
        )
      )
        throw new CatalogError(
          "DUPLICATE",
          "A category with this name already exists.",
        );
      this.assertValidCategoryParent(store.categories, id, input.parentId);
      const category = {
        ...store.categories[index],
        ...input,
        slug: slugify(input.name),
        version: store.categories[index].version + 1,
      };
      store.categories[index] = category;
      return category;
    });
  }

  async archiveCategory(id: string, version: number) {
    const store = await this.store.read();
    if (
      store.products.some(
        (product) => product.categoryId === id && product.status !== "archived",
      )
    )
      throw new CatalogError(
        "CATEGORY_IN_USE",
        "Archive or move active products before archiving this category.",
      );
    const category = store.categories.find((item) => item.id === id);
    if (!category) throw new CatalogError("NOT_FOUND", "Category not found.");
    return this.updateCategory(id, {
      ...category,
      status: "archived",
      version,
    });
  }

  async importProducts(rows: readonly CsvImportRow[]) {
    return this.store.transaction((store) => {
      const productIds: string[] = [];
      const usedSkus = new Set(
        store.products.flatMap((product) =>
          product.variants.map((variant) => variant.sku.toLowerCase()),
        ),
      );
      const usedBarcodes = new Set(
        store.products.flatMap((product) =>
          product.variants.map((variant) => variant.barcode.toLowerCase()),
        ),
      );
      for (const row of rows) {
        const category = store.categories.find(
          (item) =>
            item.name.toLowerCase() === row.category.toLowerCase() &&
            item.status === "active",
        );
        const barcode = row.sku.replaceAll("-", "");
        if (
          !category ||
          usedSkus.has(row.sku.toLowerCase()) ||
          usedBarcodes.has(barcode.toLowerCase())
        )
          continue;
        const now = new Date().toISOString();
        const id = `prd-${randomUUID()}`;
        const variantId = `var-${randomUUID()}`;
        store.products.push({
          id,
          name: row.name,
          slug: slugify(row.name),
          description: `Imported catalog product: ${row.name}.`,
          categoryId: category.id,
          priceMinor: row.priceMinor,
          costMinor: row.costMinor,
          lowStockThreshold: 3,
          tags: ["imported"],
          status: row.status,
          images: [],
          variants: [
            {
              id: variantId,
              sku: row.sku,
              color: row.color,
              size: row.size,
              priceMinor: null,
              stock: 0,
              barcode,
              active: true,
            },
          ],
          version: 1,
          createdAt: now,
          updatedAt: now,
        });
        for (const location of store.locations)
          store.balances.push({
            variantId,
            locationId: location.id,
            onHand: location.id === "loc-online" ? row.stock : 0,
            reserved: 0,
            thresholdOverride: null,
            version: 1,
          });
        if (row.stock > 0) {
          const commandId = `catalog-import-${variantId}`;
          store.movements.push({
            id: `mov-${randomUUID()}`,
            variantId,
            locationId: "loc-online",
            type: "receipt",
            onHandDelta: row.stock,
            reservedDelta: 0,
            reason: "Opening stock from catalog CSV import.",
            referenceType: "catalog_import",
            referenceId: id,
            actorId: "system",
            commandId,
            occurredAt: now,
          });
          store.processedCommands.push(commandId);
        }
        usedSkus.add(row.sku.toLowerCase());
        usedBarcodes.add(barcode.toLowerCase());
        productIds.push(id);
      }
      return {
        imported: productIds.length,
        skipped: rows.length - productIds.length,
        productIds,
      };
    });
  }

  private assertUniqueVariants(
    products: readonly Product[],
    variants: ProductMutationInput["variants"],
  ) {
    const existingSkus = new Set(
      products.flatMap((product) =>
        product.variants.map((item) => item.sku.toLowerCase()),
      ),
    );
    const existingBarcodes = new Set(
      products.flatMap((product) =>
        product.variants.map((item) => item.barcode.toLowerCase()),
      ),
    );
    if (variants.some((variant) => existingSkus.has(variant.sku.toLowerCase())))
      throw new CatalogError("DUPLICATE", "A variant SKU already exists.");
    if (
      variants.some((variant) =>
        existingBarcodes.has(variant.barcode.toLowerCase()),
      )
    )
      throw new CatalogError("DUPLICATE", "A variant barcode already exists.");
  }

  private assertValidCategoryParent(
    categories: readonly Category[],
    categoryId: string | null,
    parentId: string | null,
  ) {
    if (!parentId) return;
    if (parentId === categoryId)
      throw new CatalogError(
        "VALIDATION",
        "A category cannot be its own parent.",
      );
    const parent = categories.find((item) => item.id === parentId);
    if (!parent || parent.status !== "active")
      throw new CatalogError("VALIDATION", "Choose an active parent category.");

    // Walk the ancestor chain so editing a parent cannot create a hidden cycle.
    let ancestor: Category | undefined = parent;
    while (ancestor?.parentId) {
      if (ancestor.parentId === categoryId)
        throw new CatalogError(
          "VALIDATION",
          "Category nesting cannot contain a cycle.",
        );
      ancestor = categories.find((item) => item.id === ancestor?.parentId);
    }
  }

  private sort(items: Product[], sort: ProductSort) {
    return [...items].sort((a, b) =>
      sort === "name-asc"
        ? a.name.localeCompare(b.name)
        : sort === "price-asc"
          ? a.priceMinor - b.priceMinor
          : sort === "price-desc"
            ? b.priceMinor - a.priceMinor
            : sort === "stock-asc"
              ? totalStock(a) - totalStock(b)
              : b.updatedAt.localeCompare(a.updatedAt),
    );
  }

  private hydrateProducts(
    products: readonly Product[],
    balances: readonly { variantId: string; onHand: number }[],
  ): Product[] {
    return products.map((product) => ({
      ...product,
      variants: product.variants.map((variant) => ({
        ...variant,
        stock: balances
          .filter((balance) => balance.variantId === variant.id)
          .reduce((sum, balance) => sum + balance.onHand, 0),
      })),
    }));
  }
}
