import { PageHeader } from "@/components/ui/page-header";
import { CsvImporter } from "@/features/catalog/components/csv-importer";
import { listProducts } from "@/features/catalog/server/queries";
import { requirePermission } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export default async function ProductImportPage() {
  await requirePermission("catalog.manage");
  const products = await listProducts({ pageSize: 500, status: "all" });
  const skus = products.items.flatMap((product) =>
    product.variants.map((variant) => variant.sku),
  );
  return (
    <>
      <PageHeader
        eyebrow="Catalog · FR-207"
        title="Import products"
        description="Preview every CSV row, correct invalid data and import only the records that are safe."
      />
      <CsvImporter existingSkus={skus} />
    </>
  );
}
