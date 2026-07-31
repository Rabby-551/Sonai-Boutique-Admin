import { StatusBadge } from "@/components/ui/status-badge";
import type { ReorderSuggestion } from "../schemas/optimization";

export function ReorderSuggestions({
  suggestions,
}: {
  suggestions: ReorderSuggestion[];
}) {
  return (
    <section className="card table-card" aria-labelledby="reorder-title">
      <div className="table-heading">
        <div>
          <div className="eyebrow">Human-reviewed recommendations</div>
          <h2 id="reorder-title">Reorder suggestions</h2>
        </div>
        <span className="badge warning">Advisory only</span>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Product / SKU</th>
              <th scope="col">Location</th>
              <th scope="col">Available</th>
              <th scope="col">Incoming</th>
              <th scope="col">Lead time</th>
              <th scope="col">Suggested</th>
              <th scope="col">Confidence</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {suggestions.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.product}</strong>
                  <small>
                    {item.sku} · {item.explanation}
                  </small>
                </td>
                <td>{item.location}</td>
                <td>{item.available}</td>
                <td>{item.incoming}</td>
                <td>{item.leadTimeDays} days</td>
                <td>
                  <strong>{item.suggested}</strong>
                </td>
                <td>
                  <StatusBadge status={item.confidence} />
                </td>
                <td>
                  <StatusBadge status={item.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-note">
        Accepted suggestions create ordinary draft purchase orders; approval and
        receiving rules remain unchanged.
      </div>
    </section>
  );
}
