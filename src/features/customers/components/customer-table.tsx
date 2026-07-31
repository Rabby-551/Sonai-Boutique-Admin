import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatMoney } from "@/lib/formatting";
import type { CustomerSummary } from "../data/repository";
import {
  maskCustomerEmail,
  maskCustomerPhone,
} from "../utils/customer-contact";

export function CustomerTable({
  customers,
}: {
  customers: readonly CustomerSummary[];
}) {
  return (
    <section className="card table-card">
      <div className="table-scroll responsive-record-table">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Contact</th>
              <th>Orders</th>
              <th>Delivered spend</th>
              <th>Points</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td data-label="Customer">
                  <strong>{customer.name}</strong>
                  <small>{customer.kind}</small>
                </td>
                <td data-label="Contact">
                  {maskCustomerPhone(customer.phone)}
                  <small>{maskCustomerEmail(customer.email)}</small>
                </td>
                <td data-label="Orders">{customer.orderCount}</td>
                <td data-label="Delivered spend">
                  {formatMoney(customer.totalSpendMinor)}
                </td>
                <td data-label="Points">{customer.loyaltyBalance}</td>
                <td data-label="Status">
                  <StatusBadge status={customer.status} />
                </td>
                <td data-label="Action">
                  <Link
                    className="table-link"
                    href={`/customers/${customer.id}`}
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
            {!customers.length && (
              <tr>
                <td colSpan={7}>
                  <div className="empty-inline">
                    No customers match these filters.
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
