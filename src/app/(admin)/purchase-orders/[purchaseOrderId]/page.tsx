import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { PurchaseOrderControls } from "@/features/procurement/components/purchase-order-controls";
import { PurchaseOrderLines } from "@/features/procurement/components/purchase-order-lines";
import { PurchaseOrderSummary } from "@/features/procurement/components/purchase-order-summary";
import {
  getPurchaseOrder,
  getSupplier,
} from "@/features/procurement/server/queries";
import { can } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";
export default async function PurchaseOrderPage({
  params,
}: {
  params: Promise<{ purchaseOrderId: string }>;
}) {
  const { purchaseOrderId } = await params;
  const order = await getPurchaseOrder(purchaseOrderId);
  if (!order) notFound();
  const [supplier, user] = await Promise.all([
    getSupplier(order.supplierId),
    getCurrentUser(),
  ]);
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Purchase order"
        title={order.orderNumber}
        description={`Created ${new Date(order.createdAt).toLocaleString("en-BD")}`}
        action={<StatusBadge status={order.status} />}
      />
      <PurchaseOrderSummary order={order} supplier={supplier} />
      <PurchaseOrderLines order={order} />
      <PurchaseOrderControls
        order={order}
        canCreate={can(user.role, "procurement.create")}
        canApprove={can(user.role, "procurement.approve")}
        canReceive={can(user.role, "procurement.receive")}
      />
    </div>
  );
}
