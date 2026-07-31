import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { SupplierForm } from "@/features/procurement/components/supplier-form";
import { variantOptions } from "@/features/procurement/components/variant-options";
import {
  getSupplier,
  procurementOptions,
} from "@/features/procurement/server/queries";
import { requirePermission } from "@/lib/auth/session";
export default async function EditSupplierPage({
  params,
}: {
  params: Promise<{ supplierId: string }>;
}) {
  await requirePermission("procurement.create");
  const { supplierId } = await params;
  const [supplier, options] = await Promise.all([
    getSupplier(supplierId),
    procurementOptions(),
  ]);
  if (!supplier) notFound();
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Procurement"
        title={`Edit ${supplier.name}`}
        description="Update terms and variant mappings with optimistic concurrency."
      />
      <SupplierForm
        supplier={supplier}
        options={variantOptions(options.products)}
      />
    </div>
  );
}
