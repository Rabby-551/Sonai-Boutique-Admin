import { PageHeader } from "@/components/ui/page-header";
import { SupplierForm } from "@/features/procurement/components/supplier-form";
import { variantOptions } from "@/features/procurement/components/variant-options";
import { procurementOptions } from "@/features/procurement/server/queries";
import { requirePermission } from "@/lib/auth/session";
export default async function NewSupplierPage() {
  await requirePermission("procurement.create");
  const options = await procurementOptions();
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Procurement"
        title="Add supplier"
        description="Create a supplier and map the variants they provide."
      />
      <SupplierForm options={variantOptions(options.products)} />
    </div>
  );
}
