import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/features/catalog/components/pagination";
import { PurchaseOrderTable } from "@/features/procurement/components/purchase-order-table";
import { PurchaseOrderFilters } from "@/features/procurement/components/purchase-order-filters";
import {
  listPurchaseOrders,
  listSuppliers,
} from "@/features/procurement/server/queries";
import { can } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";
export default async function PurchaseOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const one = (key: string) =>
    Array.isArray(raw[key]) ? raw[key]?.[0] : raw[key];
  const input = {
    query: one("query"),
    status: one("status") as never,
    page: Math.max(Number(one("page")) || 1, 1),
    pageSize: 20,
  };
  const [result, suppliers, user] = await Promise.all([
    listPurchaseOrders(input),
    listSuppliers(),
    getCurrentUser(),
  ]);
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Procurement"
        title="Purchase orders"
        description="Controlled purchasing from draft and approval through strict inventory receiving."
        action={
          can(user.role, "procurement.create") && (
            <Link className="button" href="/purchase-orders/new">
              Create PO
            </Link>
          )
        }
      />
      <PurchaseOrderFilters query={input.query} status={one("status")} />
      <PurchaseOrderTable orders={result.items} suppliers={suppliers} />
      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        pathname="/purchase-orders"
      />
    </div>
  );
}
