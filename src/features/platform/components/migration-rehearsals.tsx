import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/formatting";
import type { MigrationRehearsal } from "../schemas/platform";

export function MigrationRehearsals({
  rehearsals,
}: {
  rehearsals: MigrationRehearsal[];
}) {
  return (
    <section className="card table-card" aria-labelledby="migration-title">
      <div className="table-heading">
        <div>
          <div className="eyebrow">Mock cutover evidence</div>
          <h2 id="migration-title">Rehearsal history</h2>
        </div>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Rehearsal</th>
              <th scope="col">Status</th>
              <th scope="col">Records</th>
              <th scope="col">Reconciled</th>
              <th scope="col">Warnings</th>
              <th scope="col">Started</th>
            </tr>
          </thead>
          <tbody>
            {rehearsals.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.label}</strong>
                  <small>
                    {item.sourceVersion} → {item.target}
                  </small>
                </td>
                <td>
                  <StatusBadge status={item.status} />
                </td>
                <td>{item.records.toLocaleString("en-BD")}</td>
                <td>{item.reconciled.toLocaleString("en-BD")}</td>
                <td>{item.warnings}</td>
                <td>{formatDate(item.startedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
