import { PageHeader } from "@/components/ui/page-header";
import { BarcodeLabels } from "@/features/catalog/components/barcode-labels";
import { PrintButton } from "@/features/catalog/components/print-button";
import { listProducts } from "@/features/catalog/server/queries";

export const dynamic = "force-dynamic";
export default async function BarcodePage() {
  const products = await listProducts({ pageSize: 500, status: "active" });
  return (
    <>
      <div className="no-print">
        <PageHeader
          eyebrow="Catalog · FR-152 to FR-154"
          title="Barcode labels"
          description="Code 128 labels for active product variants. Use the browser print dialog for label output."
          action={<PrintButton />}
        />
      </div>
      <BarcodeLabels products={products.items} />
    </>
  );
}
