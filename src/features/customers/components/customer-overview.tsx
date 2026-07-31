import Link from "next/link";
import { formatMoney } from "@/lib/formatting";
import type { CustomerDetail } from "../data/repository";

export function CustomerOverview({ customer }: { customer: CustomerDetail }) {
  return (
    <div className="grid-2 balanced">
      <section className="card detail-panel">
        <span className="eyebrow">Contact</span>
        <h2>{customer.name}</h2>
        <dl className="detail-list">
          <div>
            <dt>Phone</dt>
            <dd>{customer.phone}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{customer.email ?? "—"}</dd>
          </div>
          <div>
            <dt>Birthday</dt>
            <dd>{customer.birthday ?? "—"}</dd>
          </div>
          <div>
            <dt>Complaints</dt>
            <dd>{customer.complaintCount}</dd>
          </div>
        </dl>
        {customer.addresses.map((address) => (
          <p className="notice" key={address.id}>
            <strong>{address.label}:</strong> {address.address}
          </p>
        ))}
      </section>
      <section className="card detail-panel">
        <span className="eyebrow">Relationship</span>
        <h2>{customer.loyaltyBalance} points</h2>
        <dl className="detail-list">
          <div>
            <dt>Orders</dt>
            <dd>{customer.orderCount}</dd>
          </div>
          <div>
            <dt>Delivered spend</dt>
            <dd>{formatMoney(customer.totalSpendMinor)}</dd>
          </div>
          <div>
            <dt>Loyalty</dt>
            <dd>{customer.loyaltyEnrolledAt ? "Enrolled" : "Not enrolled"}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{customer.status}</dd>
          </div>
        </dl>
        <Link
          className="button secondary"
          href={`/customers/${customer.id}/edit`}
        >
          Edit profile
        </Link>
      </section>
    </div>
  );
}
