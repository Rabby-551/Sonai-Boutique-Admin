import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatMoney } from "@/lib/formatting";
import type { PurchaseOrder, Supplier } from "../schemas/procurement";
export function PurchaseOrderTable({
  orders,
  suppliers,
}: {
  orders: readonly PurchaseOrder[];
  suppliers: readonly Supplier[];
}) {
  return (
    <section className="card table-card">
      <div className="table-scroll responsive-record-table">
        <table>
          <thead>
            <tr>
              <th>PO</th>
              <th>Supplier</th>
              <th>Destination</th>
              <th>Expected</th>
              <th>Lines</th>
              <th>Total</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((item) => (
              <tr key={item.id}>
                <td data-label="PO">
                  <strong>{item.orderNumber}</strong>
                  <small>
                    {new Date(item.createdAt).toLocaleDateString("en-BD")}
                  </small>
                </td>
                <td data-label="Supplier">
                  {suppliers.find((supplier) => supplier.id === item.supplierId)
                    ?.name ?? item.supplierId}
                </td>
                <td data-label="Destination">
                  {item.destinationLocationId.replace("loc-", "")}
                </td>
                <td data-label="Expected">{item.expectedDeliveryDate}</td>
                <td data-label="Lines">{item.lines.length}</td>
                <td data-label="Total">{formatMoney(item.totalMinor)}</td>
                <td data-label="Status">
                  <StatusBadge status={item.status} />
                </td>
                <td data-label="Action">
                  <Link
                    className="table-link"
                    href={`/purchase-orders/${item.id}`}
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
            {!orders.length && (
              <tr>
                <td colSpan={8}>No purchase orders match these filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
