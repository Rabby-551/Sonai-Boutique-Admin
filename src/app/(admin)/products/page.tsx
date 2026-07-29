import Link from "next/link";
import { FileUp, Plus, ScanBarcode } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { can } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";
import { Pagination } from "@/features/catalog/components/pagination";
import { ProductFilters } from "@/features/catalog/components/product-filters";
import { ProductTable } from "@/features/catalog/components/product-table";
import {
  listCategories,
  listProducts,
} from "@/features/catalog/server/queries";
import {
  parseProductListSearch,
  type ProductSearchParams,
} from "@/features/catalog/utils/product-list-input";

export const dynamic = "force-dynamic";
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<ProductSearchParams>;
}) {
  const { input, values } = parseProductListSearch(await searchParams);
  const [result, categories, user] = await Promise.all([
    listProducts(input),
    listCategories(),
    getCurrentUser(),
  ]);
  const canManage = can(user.role, "catalog.manage");
  return (
    <>
      <PageHeader
        eyebrow="Catalog · FR-204 to FR-209"
        title="Products"
        description={`${result.totalItems} products across active, draft and archived catalog states.`}
        action={
          canManage && (
            <div className="button-group">
              <Link className="button secondary" href="/products/import">
                <FileUp size={16} />
                Import CSV
              </Link>
              <Link className="button secondary" href="/products/barcodes">
                <ScanBarcode size={16} />
                Print barcodes
              </Link>
              <Link className="button" href="/products/new">
                <Plus size={16} />
                Add product
              </Link>
            </div>
          )
        }
      />
      <ProductFilters categories={categories} defaults={values} />
      <ProductTable
        canManage={canManage}
        categories={categories}
        products={result.items}
      />
      <Pagination
        page={result.page}
        searchParams={values}
        totalPages={result.totalPages}
      />
    </>
  );
}
