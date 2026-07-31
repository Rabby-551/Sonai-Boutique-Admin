import { formatMoney } from "@/lib/formatting";
import type { PurchaseOrder } from "../schemas/procurement";
export function PurchaseOrderLines({ order }: { order: PurchaseOrder }) {
  return (
    <section className="card table-card">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product</th>
              <th>Supplier SKU</th>
              <th>Ordered</th>
              <th>Accepted</th>
              <th>Damaged</th>
              <th>Rejected</th>
              <th>Outstanding</th>
              <th>Unit cost</th>
            </tr>
          </thead>
          <tbody>
            {order.lines.map((line) => (
              <tr key={line.variantId}>
                <td>{line.sku}</td>
                <td>{line.productName}</td>
                <td>{line.supplierSku}</td>
                <td>{line.orderedQuantity}</td>
                <td>{line.acceptedQuantity}</td>
                <td>{line.damagedQuantity}</td>
                <td>{line.rejectedQuantity}</td>
                <td>
                  {line.orderedQuantity -
                    line.acceptedQuantity -
                    line.damagedQuantity -
                    line.rejectedQuantity}
                </td>
                <td>{formatMoney(line.unitCostMinor)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
