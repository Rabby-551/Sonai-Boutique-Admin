import { StatusBadge } from "@/components/ui/status-badge";
import type { ProviderIntegration } from "../schemas/platform";

export function IntegrationTable({
  integrations,
}: {
  integrations: ProviderIntegration[];
}) {
  return (
    <section className="card table-card" aria-labelledby="integration-title">
      <div className="table-heading">
        <div>
          <div className="eyebrow">Adapter catalog</div>
          <h2 id="integration-title">Fictional provider integrations</h2>
        </div>
        <span className="badge warning">No live calls</span>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Integration</th>
              <th scope="col">Type</th>
              <th scope="col">Status</th>
              <th scope="col">Events today</th>
              <th scope="col">Success</th>
              <th scope="col">Safety boundary</th>
            </tr>
          </thead>
          <tbody>
            {integrations.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.name}</strong>
                  <small>{item.environment} environment</small>
                </td>
                <td>{item.type}</td>
                <td>
                  <StatusBadge status={item.status} />
                </td>
                <td>{item.eventsToday}</td>
                <td>{item.successRate.toFixed(1)}%</td>
                <td>{item.boundary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
