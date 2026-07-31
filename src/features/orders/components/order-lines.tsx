import { formatMoney } from "@/lib/formatting";
import type { Order } from "../schemas/orders";

export function OrderLines({ order }: { order: Order }) {
  return (
    <section className="card table-card">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product</th>
              <th>Variant</th>
              <th>Quantity</th>
              <th>Unit price</th>
              <th>Line total</th>
            </tr>
          </thead>
          <tbody>
            {order.lines.map((line) => (
              <tr key={line.variantId}>
                <td>
                  <strong>{line.sku}</strong>
                </td>
                <td>{line.productName}</td>
                <td>{line.variantLabel}</td>
                <td>{line.quantity}</td>
                <td>{formatMoney(line.unitPriceMinor)}</td>
                <td>{formatMoney(line.unitPriceMinor * line.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
