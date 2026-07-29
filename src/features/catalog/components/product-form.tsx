"use client";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { saveProductAction } from "../server/actions";
import { initialCatalogActionState } from "../server/action-state";
import type {
  Category,
  Product,
  ProductImage,
  ProductVariant,
} from "../schemas/catalog";
import { ImageEditor } from "./image-editor";
import { ProductCoreFields } from "./product-core-fields";
import { ProductPricingFields } from "./product-pricing-fields";
import { VariantEditor } from "./variant-editor";

const emptyVariant = (): ProductVariant => ({
  id: "var-new",
  sku: "",
  color: "Default",
  size: "Free",
  priceMinor: null,
  stock: 0,
  barcode: "",
  active: true,
});
export function ProductForm({
  categories,
  product,
}: {
  categories: readonly Category[];
  product?: Product;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    saveProductAction,
    initialCatalogActionState,
  );
  const [variants, setVariants] = useState<ProductVariant[]>(
    product?.variants ?? [emptyVariant()],
  );
  const [images, setImages] = useState<ProductImage[]>(product?.images ?? []);
  useEffect(() => {
    if (state.status === "success" && state.id)
      router.push(`/products/${state.id}`);
  }, [router, state]);
  const fieldError = (name: string) => state.fieldErrors?.[name]?.[0];
  return (
    <form action={action} className="catalog-form">
      <input name="id" type="hidden" value={product?.id ?? ""} />
      <input name="version" type="hidden" value={product?.version ?? ""} />
      <input name="variants" type="hidden" value={JSON.stringify(variants)} />
      {state.message && (
        <div className={`form-message ${state.status}`} role="status">
          {state.message}
        </div>
      )}
      <ProductCoreFields
        categories={categories}
        error={fieldError}
        product={product}
      />
      <ProductPricingFields error={fieldError} product={product} />
      <VariantEditor onChange={setVariants} value={variants} />
      <ImageEditor onChange={setImages} value={images} />
      <div className="form-footer">
        <button className="button" disabled={pending} type="submit">
          {pending ? "Saving…" : product ? "Save changes" : "Create product"}
        </button>
        <button
          className="button secondary"
          onClick={() => router.back()}
          type="button"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
