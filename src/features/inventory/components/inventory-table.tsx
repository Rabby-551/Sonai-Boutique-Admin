import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatMoney } from "@/lib/formatting";
import type { InventoryRow } from "../schemas/inventory";

export function InventoryTable({ rows }: { rows: readonly InventoryRow[] }) {
  return (
    <section className="card table-card">
      <div className="table-scroll responsive-record-table">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product</th>
              <th>Rupnagar</th>
              <th>Mirpur 2</th>
              <th>Online</th>
              <th>Reserved</th>
              <th>Available</th>
              <th>Value</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.variantId}>
                <td data-label="SKU">
                  <strong>{row.sku}</strong>
                  <small>
                    {row.color} · {row.size}
                  </small>
                </td>
                <td data-label="Product">{row.productName}</td>
                <td data-label="Rupnagar">
                  {row.locations["rupnagar"].onHand}
                </td>
                <td data-label="Mirpur 2">
                  {row.locations["mirpur-shopping-center"].onHand}
                </td>
                <td data-label="Online">
                  {row.locations["loc-online"].onHand}
                </td>
                <td data-label="Reserved">{row.totalReserved}</td>
                <td data-label="Available">{row.totalAvailable}</td>
                <td data-label="Value">{formatMoney(row.valuationMinor)}</td>
                <td data-label="Status">
                  <StatusBadge status={row.status} />
                </td>
                <td data-label="Action">
                  <Link
                    className="table-link"
                    href={`/inventory/${row.variantId}`}
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={10}>
                  <div className="empty-inline">
                    No inventory matches these filters.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
