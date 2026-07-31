import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { MovementTable } from "@/features/inventory/components/movement-table";
import { ThresholdForm } from "@/features/inventory/components/threshold-form";
import { VariantInventorySummary } from "@/features/inventory/components/variant-inventory-summary";
import {
  getVariantInventory,
  listLocations,
  listMovements,
} from "@/features/inventory/server/queries";
import { can } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";

export default async function VariantInventoryPage({
  params,
}: {
  params: Promise<{ variantId: string }>;
}) {
  const { variantId } = await params;
  const [row, locations, movements, user] = await Promise.all([
    getVariantInventory(variantId),
    listLocations(),
    listMovements({ variantId, pageSize: 100 }),
    getCurrentUser(),
  ]);
  if (!row) notFound();
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Inventory detail"
        title={row.productName}
        description={`${row.sku} · ${row.color} · ${row.size}`}
        action={
          can(user.role, "inventory.adjust") ? (
            <Link
              className="button"
              href={`/stock-movements/new?variantId=${row.variantId}`}
            >
              Record movement
            </Link>
          ) : undefined
        }
      />
      <VariantInventorySummary row={row} locations={locations} />
      {can(user.role, "inventory.adjust") && (
        <ThresholdForm row={row} locations={locations} />
      )}
      <div>
        <h2>Movement history</h2>
        <MovementTable
          movements={movements.items}
          skuByVariant={{ [row.variantId]: row.sku }}
        />
      </div>
    </div>
  );
}
