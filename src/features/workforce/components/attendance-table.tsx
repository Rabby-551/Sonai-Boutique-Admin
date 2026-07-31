import { StatusBadge } from "@/components/ui/status-badge";
import type { AttendanceRecord } from "../schemas/workforce";
export function AttendanceTable({
  records,
  staffNames,
}: {
  records: AttendanceRecord[];
  staffNames: Record<string, string>;
}) {
  if (!records.length)
    return (
      <div className="empty-state">
        <h2>No attendance records</h2>
        <p>Record a daily status or adjust the filters.</p>
      </div>
    );
  return (
    <div className="table-card">
      <div className="table-scroll responsive-record-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Staff</th>
              <th>Status</th>
              <th>Check in</th>
              <th>Check out</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {records.map((item) => (
              <tr key={item.id}>
                <td data-label="Date">{item.date}</td>
                <td data-label="Staff">
                  {staffNames[item.staffId] ?? item.staffId}
                </td>
                <td data-label="Status">
                  <StatusBadge status={item.status} />
                </td>
                <td data-label="Check in">
                  {item.checkIn?.slice(11, 16) ?? "—"}
                </td>
                <td data-label="Check out">
                  {item.checkOut?.slice(11, 16) ?? "—"}
                </td>
                <td data-label="Note">{item.note || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
