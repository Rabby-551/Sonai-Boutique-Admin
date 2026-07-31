import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import type { CustomerSummary } from "@/features/customers/data/repository";
import type { Complaint } from "../schemas/complaints";
export function ComplaintTable({
  complaints,
  customers,
}: {
  complaints: readonly Complaint[];
  customers: readonly CustomerSummary[];
}) {
  return (
    <section className="card table-card">
      <div className="table-scroll responsive-record-table">
        <table>
          <thead>
            <tr>
              <th>Case</th>
              <th>Customer</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Assignee</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((item) => (
              <tr key={item.id}>
                <td data-label="Case">
                  <strong>{item.caseNumber}</strong>
                  <small>
                    {new Date(item.createdAt).toLocaleDateString("en-BD")}
                  </small>
                </td>
                <td data-label="Customer">
                  {customers.find((customer) => customer.id === item.customerId)
                    ?.name ?? item.customerId}
                </td>
                <td data-label="Category">
                  {item.category.replaceAll("_", " ")}
                </td>
                <td data-label="Priority">
                  <StatusBadge status={item.priority} />
                </td>
                <td data-label="Assignee">
                  {item.assignedTo?.replace("usr-", "") ?? "Unassigned"}
                </td>
                <td data-label="Status">
                  <StatusBadge status={item.status} />
                </td>
                <td data-label="Action">
                  <Link className="table-link" href={`/complaints/${item.id}`}>
                    Open
                  </Link>
                </td>
              </tr>
            ))}
            {!complaints.length && (
              <tr>
                <td colSpan={7}>
                  <div className="empty-inline">
                    No complaints match these filters.
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
