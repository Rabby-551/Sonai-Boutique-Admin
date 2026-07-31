import type { PurchaseOrder } from "../schemas/procurement";
import { PurchaseOrderCommercialControls } from "./purchase-order-commercial-controls";
import { PurchaseOrderLogisticsControls } from "./purchase-order-logistics-controls";

export function PurchaseOrderControls({
  order,
  canCreate,
  canApprove,
  canReceive,
}: {
  order: PurchaseOrder;
  canCreate: boolean;
  canApprove: boolean;
  canReceive: boolean;
}) {
  return (
    <section className="card detail-panel stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Workflow</span>
          <h2>Available actions</h2>
        </div>
      </div>
      <PurchaseOrderCommercialControls
        order={order}
        canCreate={canCreate}
        canApprove={canApprove}
      />
      <PurchaseOrderLogisticsControls
        order={order}
        canCreate={canCreate}
        canReceive={canReceive}
      />
    </section>
  );
}
