import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Supplier } from "../schemas/procurement";
export function SupplierTable({
  suppliers,
}: {
  suppliers: readonly Supplier[];
}) {
  return (
    <section className="card table-card">
      <div className="table-scroll responsive-record-table">
        <table>
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Contact</th>
              <th>Terms</th>
              <th>Lead time</th>
              <th>SKUs</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((item) => (
              <tr key={item.id}>
                <td data-label="Supplier">
                  <strong>{item.name}</strong>
                  <small>{item.code}</small>
                </td>
                <td data-label="Contact">
                  {item.contactName}
                  <small>{item.phone}</small>
                </td>
                <td data-label="Terms">{item.paymentTerms}</td>
                <td data-label="Lead time">{item.leadTimeDays} days</td>
                <td data-label="SKUs">{item.variants.length}</td>
                <td data-label="Status">
                  <StatusBadge status={item.status} />
                </td>
                <td data-label="Action">
                  <Link className="table-link" href={`/suppliers/${item.id}`}>
                    Open
                  </Link>
                </td>
              </tr>
            ))}
            {!suppliers.length && (
              <tr>
                <td colSpan={7}>No suppliers available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
