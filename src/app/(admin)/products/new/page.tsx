import { PageHeader } from "@/components/ui/page-header";
import { ProductForm } from "@/features/catalog/components/product-form";
import { listCategories } from "@/features/catalog/server/queries";
import { requirePermission } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export default async function NewProductPage() {
  await requirePermission("catalog.manage");
  const categories = await listCategories();
  return (
    <>
      <PageHeader
        eyebrow="Catalog · New product"
        title="Create product"
        description="Add core information, stock rules, variants and safe image metadata."
      />
      <ProductForm categories={categories} />
    </>
  );
}
