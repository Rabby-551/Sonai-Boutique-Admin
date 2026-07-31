import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/features/catalog/components/pagination";
import { InventoryFilters } from "@/features/inventory/components/inventory-filters";
import { InventoryTable } from "@/features/inventory/components/inventory-table";
import {
  listInventory,
  listLocations,
} from "@/features/inventory/server/queries";
import { inventoryParams } from "@/features/inventory/utils/inventory-params";
import { can } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const input = inventoryParams(raw);
  const [result, locations, user] = await Promise.all([
    listInventory(input),
    listLocations(),
    getCurrentUser(),
  ]);
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Operations"
        title="Inventory"
        description="Authoritative SKU balances, reservations and stock availability by location."
        action={
          <div className="button-group">
            <Link className="button secondary" href="/inventory/transfers">
              Transfers
            </Link>
            {can(user.role, "inventory.adjust") && (
              <Link className="button" href="/stock-movements/new">
                Record movement
              </Link>
            )}
          </div>
        }
      />
      <InventoryFilters
        locations={locations}
        defaults={{
          query: input.query,
          locationId: input.locationId,
          status: input.status,
          sort: input.sort,
          minValue: Array.isArray(raw.minValue)
            ? raw.minValue[0]
            : raw.minValue,
          maxValue: Array.isArray(raw.maxValue)
            ? raw.maxValue[0]
            : raw.maxValue,
        }}
      />
      <InventoryTable rows={result.items} />
      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        pathname="/inventory"
      />
    </div>
  );
}
