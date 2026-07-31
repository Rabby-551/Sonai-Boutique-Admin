import type { Product } from "@/features/catalog/schemas/catalog";
export interface VariantOption {
  id: string;
  label: string;
  sku: string;
  costMinor: number;
}
export function variantOptions(products: readonly Product[]): VariantOption[] {
  return products.flatMap((product) =>
    product.variants.map((variant) => ({
      id: variant.id,
      label: `${product.name} · ${variant.color} · ${variant.size}`,
      sku: variant.sku,
      costMinor: product.costMinor,
    })),
  );
}
