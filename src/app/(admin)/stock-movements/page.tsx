import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/features/catalog/components/pagination";
import { MovementFilters } from "@/features/inventory/components/movement-filters";
import { MovementTable } from "@/features/inventory/components/movement-table";
import {
  listInventory,
  listLocations,
  listMovements,
} from "@/features/inventory/server/queries";
import { movementParams } from "@/features/inventory/utils/inventory-params";

export default async function StockMovementsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const input = movementParams(raw);
  const [result, locations, inventory] = await Promise.all([
    listMovements(input),
    listLocations(),
    listInventory({ pageSize: 1000 }),
  ]);
  const skuByVariant = Object.fromEntries(
    inventory.items.map((row) => [row.variantId, row.sku]),
  );
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Inventory audit"
        title="Stock movements"
        description="Every on-hand and reserved quantity change is recorded here."
        action={
          <Link className="button" href="/stock-movements/new">
            Record movement
          </Link>
        }
      />
      <MovementFilters
        locations={locations}
        defaults={{
          query: input.query,
          locationId: input.locationId,
          type: input.type,
          actor: input.actor,
          dateFrom: input.dateFrom,
          dateTo: input.dateTo,
        }}
      />
      <MovementTable movements={result.items} skuByVariant={skuByVariant} />
      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        pathname="/stock-movements"
      />
    </div>
  );
}
