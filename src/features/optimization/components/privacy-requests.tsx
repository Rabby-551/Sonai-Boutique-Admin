import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/formatting";
import type { PrivacyRequest } from "../schemas/optimization";

export function PrivacyRequests({ requests }: { requests: PrivacyRequest[] }) {
  return (
    <section className="card table-card" aria-labelledby="privacy-title">
      <div className="table-heading">
        <div>
          <div className="eyebrow">Identity and retention control</div>
          <h2 id="privacy-title">Privacy request queue</h2>
        </div>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Request</th>
              <th scope="col">Customer</th>
              <th scope="col">Type</th>
              <th scope="col">Status</th>
              <th scope="col">Due</th>
              <th scope="col">Owner</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.id}</strong>
                  <small>{item.detail}</small>
                </td>
                <td>{item.customer}</td>
                <td>{item.type}</td>
                <td>
                  <StatusBadge status={item.status} />
                </td>
                <td>{formatDate(item.dueAt)}</td>
                <td>{item.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
