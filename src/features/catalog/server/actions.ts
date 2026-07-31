"use server";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/session";
import {
  categoryMutationSchema,
  productImageSchema,
  productMutationSchema,
  productVariantMutationSchema,
} from "../schemas/catalog";
import { getCatalogRepository } from "../data/repository-factory";
import { CatalogError } from "../data/catalog-errors";
import type { CsvImportRow } from "../data/repository";
import { z } from "zod";
import type { CatalogActionState } from "./action-state";

const csvImportRowSchema = z.object({
  name: z.string().trim().min(3).max(120),
  sku: z.string().trim().min(3).max(40),
  category: z.string().trim().min(2).max(80),
  priceMinor: z.number().int().nonnegative(),
  costMinor: z.number().int().nonnegative(),
  color: z.string().trim().min(1).max(40),
  size: z.string().trim().min(1).max(30),
  stock: z.number().int().nonnegative(),
  status: z.enum(["draft", "active"]),
}) satisfies z.ZodType<CsvImportRow>;

const text = (form: FormData, key: string) =>
  String(form.get(key) ?? "").trim();
const moneyMinor = (form: FormData, key: string) =>
  Math.round(Number(text(form, key)) * 100);
const json = <T>(form: FormData, key: string, fallback: T): T => {
  try {
    return JSON.parse(text(form, key)) as T;
  } catch {
    return fallback;
  }
};

function errorState(error: unknown): CatalogActionState {
  if (error instanceof z.ZodError)
    return {
      status: "error",
      message: "Correct the highlighted catalog information.",
      fieldErrors: z.flattenError(error).fieldErrors as Record<
        string,
        string[]
      >,
    };
  if (error instanceof CatalogError)
    return { status: "error", message: error.message };
  return {
    status: "error",
    message: "The catalog could not be updated. Try again.",
  };
}

export async function saveProductAction(
  _previous: CatalogActionState,
  form: FormData,
): Promise<CatalogActionState> {
  try {
    await requirePermission("catalog.manage");
    const input = productMutationSchema.parse({
      name: text(form, "name"),
      description: text(form, "description"),
      categoryId: text(form, "categoryId"),
      priceMinor: moneyMinor(form, "price"),
      costMinor: moneyMinor(form, "cost"),
      lowStockThreshold: Number(text(form, "lowStockThreshold")),
      tags: text(form, "tags")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      status: text(form, "status"),
      version: text(form, "version")
        ? Number(text(form, "version"))
        : undefined,
      variants: z
        .array(productVariantMutationSchema)
        .parse(json(form, "variants", [])),
      images: z.array(productImageSchema).parse(json(form, "images", [])),
    });
    const repository = getCatalogRepository();
    const id = text(form, "id");
    const product = id
      ? await repository.updateProduct(id, input)
      : await repository.createProduct(input);
    revalidatePath("/products");
    revalidatePath(`/products/${product.id}`);
    revalidatePath("/dashboard");
    return {
      status: "success",
      message: id ? "Product updated." : "Product created.",
      id: product.id,
    };
  } catch (error) {
    return errorState(error);
  }
}

export async function archiveProductAction(
  id: string,
  version: number,
): Promise<CatalogActionState> {
  try {
    await requirePermission("catalog.manage");
    await getCatalogRepository().archiveProduct(id, version);
    revalidatePath("/products");
    revalidatePath(`/products/${id}`);
    return { status: "success", message: "Product archived.", id };
  } catch (error) {
    return errorState(error);
  }
}

export async function saveCategoryAction(
  _previous: CatalogActionState,
  form: FormData,
): Promise<CatalogActionState> {
  try {
    await requirePermission("catalog.manage");
    const input = categoryMutationSchema.parse({
      name: text(form, "name"),
      parentId: text(form, "parentId") || null,
      displayOrder: Number(text(form, "displayOrder")),
      status: text(form, "status"),
      version: text(form, "version")
        ? Number(text(form, "version"))
        : undefined,
    });
    const repository = getCatalogRepository();
    const id = text(form, "id");
    const category = id
      ? await repository.updateCategory(id, input)
      : await repository.createCategory(input);
    revalidatePath("/categories");
    revalidatePath("/products");
    return {
      status: "success",
      message: id ? "Category updated." : "Category created.",
      id: category.id,
    };
  } catch (error) {
    return errorState(error);
  }
}

export async function archiveCategoryAction(
  id: string,
  version: number,
): Promise<CatalogActionState> {
  try {
    await requirePermission("catalog.manage");
    await getCatalogRepository().archiveCategory(id, version);
    revalidatePath("/categories");
    return { status: "success", message: "Category archived.", id };
  } catch (error) {
    return errorState(error);
  }
}

export async function importProductsAction(
  _previous: CatalogActionState,
  form: FormData,
): Promise<CatalogActionState> {
  try {
    await requirePermission("catalog.manage");
    const rows = z
      .array(csvImportRowSchema)
      .min(1)
      .parse(json(form, "rows", []));
    const result = await getCatalogRepository().importProducts(rows);
    revalidatePath("/products");
    return {
      status: "success",
      message: `${result.imported} products imported; ${result.skipped} skipped.`,
    };
  } catch (error) {
    return errorState(error);
  }
}
