import { PageHeader } from "@/components/ui/page-header";
import { PurchaseOrderForm } from "@/features/procurement/components/purchase-order-form";
import { variantOptions } from "@/features/procurement/components/variant-options";
import { procurementOptions } from "@/features/procurement/server/queries";
import { requirePermission } from "@/lib/auth/session";
export default async function NewPurchaseOrderPage() {
  await requirePermission("procurement.create");
  const options = await procurementOptions();
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Procurement"
        title="Create purchase order"
        description="Draft a supplier order with a single receiving destination and server-calculated totals."
      />
      <PurchaseOrderForm
        suppliers={options.suppliers}
        locations={options.locations}
        options={variantOptions(options.products)}
      />
    </div>
  );
}
