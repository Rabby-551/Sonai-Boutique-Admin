import { z } from "zod";

export const productStatusSchema = z.enum(["draft", "active", "archived"]);
export const categoryStatusSchema = z.enum(["active", "archived"]);

export const productImageSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  altText: z.string().min(3).max(125),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  sizeBytes: z.number().int().positive().max(5_000_000),
  position: z.number().int().nonnegative(),
  previewUrl: z.string().min(1),
});

export const productVariantSchema = z.object({
  id: z.string().min(1),
  sku: z.string().trim().min(3).max(40),
  color: z.string().trim().min(1).max(40),
  size: z.string().trim().min(1).max(30),
  priceMinor: z.number().int().nonnegative().nullable(),
  stock: z.number().int().nonnegative(),
  barcode: z.string().trim().min(3).max(60),
  active: z.boolean(),
});

export const productSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(3).max(120),
  slug: z.string().min(1),
  description: z.string().trim().min(10).max(2_000),
  categoryId: z.string().min(1),
  priceMinor: z.number().int().nonnegative(),
  costMinor: z.number().int().nonnegative(),
  lowStockThreshold: z.number().int().nonnegative(),
  tags: z.array(z.string().min(1).max(40)).max(12),
  status: productStatusSchema,
  variants: z.array(productVariantSchema).min(1),
  images: z.array(productImageSchema).max(8),
  version: z.number().int().positive(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const categorySchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(2).max(80),
  slug: z.string().min(1),
  parentId: z.string().nullable(),
  displayOrder: z.number().int().nonnegative(),
  status: categoryStatusSchema,
  version: z.number().int().positive(),
});

export const catalogStoreSchema = z.object({
  products: z.array(productSchema),
  categories: z.array(categorySchema),
});

export const productMutationSchema = productSchema
  .omit({
    id: true,
    slug: true,
    version: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({ version: z.number().int().positive().optional() })
  .superRefine((value, context) => {
    if (value.costMinor > value.priceMinor) {
      context.addIssue({
        code: "custom",
        path: ["costMinor"],
        message: "Cost cannot exceed selling price.",
      });
    }
    const keys = value.variants.map((variant) => variant.sku.toLowerCase());
    if (new Set(keys).size !== keys.length) {
      context.addIssue({
        code: "custom",
        path: ["variants"],
        message: "Variant SKUs must be unique.",
      });
    }
    const barcodes = value.variants.map((variant) =>
      variant.barcode.toLowerCase(),
    );
    if (new Set(barcodes).size !== barcodes.length) {
      context.addIssue({
        code: "custom",
        path: ["variants"],
        message: "Variant barcodes must be unique.",
      });
    }
  });

export const categoryMutationSchema = categorySchema
  .omit({ id: true, slug: true, version: true })
  .extend({
    version: z.number().int().positive().optional(),
  });

export type Product = z.infer<typeof productSchema>;
export type ProductVariant = z.infer<typeof productVariantSchema>;
export type ProductImage = z.infer<typeof productImageSchema>;
export type Category = z.infer<typeof categorySchema>;
export type CatalogStore = z.infer<typeof catalogStoreSchema>;
export type ProductMutationInput = z.infer<typeof productMutationSchema>;
export type CategoryMutationInput = z.infer<typeof categoryMutationSchema>;
