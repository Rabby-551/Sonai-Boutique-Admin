import type { AuditEvent } from "../schemas/administration";
export function AuditTable({ events }: { events: AuditEvent[] }) {
  if (!events.length)
    return (
      <div className="empty-state">
        <h2>No audit events found</h2>
        <p>Adjust the filters to inspect other activity.</p>
      </div>
    );
  return (
    <div className="table-card">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Module</th>
              <th>Action</th>
              <th>Actor</th>
              <th>Summary</th>
              <th>Entity</th>
            </tr>
          </thead>
          <tbody>
            {events.map((item) => (
              <tr key={item.id}>
                <td>
                  {new Date(item.occurredAt).toLocaleString("en-BD", {
                    timeZone: "Asia/Dhaka",
                  })}
                </td>
                <td>{item.module}</td>
                <td>{item.action.replaceAll("_", " ")}</td>
                <td>{item.actorId}</td>
                <td>{item.summary}</td>
                <td>
                  {item.entityType}
                  <small>{item.entityId}</small>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
