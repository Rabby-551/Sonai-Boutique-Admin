import { PageHeader } from "@/components/ui/page-header";
import { CategoryCreateForm } from "@/features/catalog/components/category-create-form";
import { CategoryTable } from "@/features/catalog/components/category-table";
import {
  listCategories,
  listProducts,
} from "@/features/catalog/server/queries";
import { can } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export default async function CategoriesPage() {
  const [categories, products, user] = await Promise.all([
    listCategories(),
    listProducts({ pageSize: 500, status: "all" }),
    getCurrentUser(),
  ]);
  const canManage = can(user.role, "catalog.manage");
  return (
    <>
      <PageHeader
        eyebrow="Catalog · FR-209"
        title="Categories"
        description="Manage the hierarchy and display order used across catalog navigation and product assignment."
      />
      <div className="category-layout">
        <CategoryTable
          canManage={canManage}
          categories={categories}
          products={products.items}
        />
        {canManage && <CategoryCreateForm categories={categories} />}
      </div>
    </>
  );
}
