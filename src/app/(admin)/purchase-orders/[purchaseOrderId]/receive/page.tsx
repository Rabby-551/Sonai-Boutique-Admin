import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { PurchaseReceiptForm } from "@/features/procurement/components/purchase-receipt-form";
import { getPurchaseOrder } from "@/features/procurement/server/queries";
import { requirePermission } from "@/lib/auth/session";
export default async function ReceivePurchaseOrderPage({
  params,
}: {
  params: Promise<{ purchaseOrderId: string }>;
}) {
  await requirePermission("procurement.receive");
  const order = await getPurchaseOrder((await params).purchaseOrderId);
  if (!order) notFound();
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Receiving"
        title={`Receive ${order.orderNumber}`}
        description="Accepted units enter inventory; damaged and rejected units remain non-sellable records."
      />
      <PurchaseReceiptForm order={order} />
    </div>
  );
}
