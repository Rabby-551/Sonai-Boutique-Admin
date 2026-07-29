import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { ProductForm } from "@/features/catalog/components/product-form";
import { getProduct, listCategories } from "@/features/catalog/server/queries";
import { requirePermission } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export default async function EditProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  await requirePermission("catalog.manage");
  const { productId } = await params;
  const [product, categories] = await Promise.all([
    getProduct(productId),
    listCategories(),
  ]);
  if (!product) notFound();
  return (
    <>
      <PageHeader
        eyebrow={`Catalog · Version ${product.version}`}
        title={`Edit ${product.name}`}
        description="Saving checks the version so another staff member's changes are never overwritten silently."
      />
      <ProductForm categories={categories} product={product} />
    </>
  );
}
