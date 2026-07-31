import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/features/catalog/components/pagination";
import { OrderFilters } from "@/features/orders/components/order-filters";
import { OrderTable } from "@/features/orders/components/order-table";
import {
  listOrderLocations,
  listOrders,
} from "@/features/orders/server/queries";
import { orderParams } from "@/features/orders/utils/order-params";
import { can } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const input = orderParams(raw);
  const [result, locations, user] = await Promise.all([
    listOrders(input),
    listOrderLocations(),
    getCurrentUser(),
  ]);
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Fulfillment"
        title="Orders"
        description="Captured and manual orders with reservation, payment and shipment state."
        action={
          can(user.role, "orders.create") && (
            <Link className="button" href="/orders/new">
              Create order
            </Link>
          )
        }
      />
      <OrderFilters
        locations={locations}
        defaults={{
          query: input.query,
          source: input.source,
          locationId: input.locationId,
          status: input.status,
          paymentStatus: input.paymentStatus,
          dateFrom: input.dateFrom,
          dateTo: input.dateTo,
        }}
      />
      <OrderTable orders={result.items} />
      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        pathname="/orders"
      />
    </div>
  );
}
