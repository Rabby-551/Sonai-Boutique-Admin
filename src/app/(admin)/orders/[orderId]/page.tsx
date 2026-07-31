import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { FulfillmentControls } from "@/features/orders/components/fulfillment-controls";
import { OrderLines } from "@/features/orders/components/order-lines";
import { OrderNoteForm } from "@/features/orders/components/order-note-form";
import { OrderSummary } from "@/features/orders/components/order-summary";
import { OrderTimeline } from "@/features/orders/components/order-timeline";
import { ReturnPanel } from "@/features/orders/components/return-panel";
import { getOrder, listOrderLocations } from "@/features/orders/server/queries";
import { can } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const [order, locations, user] = await Promise.all([
    getOrder(orderId),
    listOrderLocations(),
    getCurrentUser(),
  ]);
  if (!order) notFound();
  const fulfill = can(user.role, "orders.fulfill");
  const cancel = can(user.role, "orders.cancel");
  const refund = can(user.role, "orders.refund");
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Order detail"
        title={order.orderNumber}
        description={`Created ${new Date(order.createdAt).toLocaleString("en-BD")}`}
        action={<StatusBadge status={order.status} />}
      />
      <OrderSummary
        order={order}
        locations={locations}
        revealContact={fulfill || can(user.role, "orders.note")}
      />
      <OrderLines order={order} />
      {fulfill && (
        <FulfillmentControls
          order={order}
          locations={locations}
          canCancel={cancel}
        />
      )}
      {(cancel || refund) && (
        <ReturnPanel order={order} canDecide={cancel} canRefund={refund} />
      )}
      {can(user.role, "orders.note") && <OrderNoteForm order={order} />}
      <OrderTimeline order={order} />
    </div>
  );
}
