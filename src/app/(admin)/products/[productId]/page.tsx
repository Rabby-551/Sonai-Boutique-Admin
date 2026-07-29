import { notFound } from "next/navigation";
import { ProductDetails } from "@/features/catalog/components/product-details";
import { getProduct, listCategories } from "@/features/catalog/server/queries";
import { can } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const [product, categories, user] = await Promise.all([
    getProduct(productId),
    listCategories(),
    getCurrentUser(),
  ]);
  if (!product) notFound();
  return (
    <ProductDetails
      canManage={can(user.role, "catalog.manage")}
      category={categories.find((item) => item.id === product.categoryId)}
      product={product}
    />
  );
}
