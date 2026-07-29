import type {
  Category,
  CategoryMutationInput,
  Product,
  ProductMutationInput,
} from "../schemas/catalog";

export type ProductSort =
  "updated-desc" | "name-asc" | "price-asc" | "price-desc" | "stock-asc";
export interface ProductListInput {
  query?: string;
  categoryId?: string;
  status?: "all" | Product["status"];
  stock?: "all" | "in-stock" | "low" | "out";
  minPriceMinor?: number;
  maxPriceMinor?: number;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
}
export interface Paginated<T> {
  items: readonly T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
export interface CsvImportRow {
  name: string;
  sku: string;
  category: string;
  priceMinor: number;
  costMinor: number;
  color: string;
  size: string;
  stock: number;
  status: "draft" | "active";
}
export interface CsvImportResult {
  imported: number;
  skipped: number;
  productIds: readonly string[];
}

/** Contract consumed by catalog queries and actions, independent of mock or HTTP infrastructure. */
export interface CatalogRepository {
  listProducts(input: ProductListInput): Promise<Paginated<Product>>;
  getProduct(id: string): Promise<Product | null>;
  createProduct(input: ProductMutationInput): Promise<Product>;
  updateProduct(id: string, input: ProductMutationInput): Promise<Product>;
  archiveProduct(id: string, version: number): Promise<Product>;
  listCategories(): Promise<readonly Category[]>;
  createCategory(input: CategoryMutationInput): Promise<Category>;
  updateCategory(id: string, input: CategoryMutationInput): Promise<Category>;
  archiveCategory(id: string, version: number): Promise<Category>;
  importProducts(rows: readonly CsvImportRow[]): Promise<CsvImportResult>;
}
