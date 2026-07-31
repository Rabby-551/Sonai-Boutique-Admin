import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Staff } from "../schemas/administration";
export function StaffTable({
  staff,
  locationNames,
}: {
  staff: Staff[];
  locationNames: Record<string, string>;
}) {
  if (!staff.length)
    return (
      <div className="empty-state">
        <h2>No staff found</h2>
        <p>Adjust the filters or create a staff profile.</p>
      </div>
    );
  return (
    <div className="table-card">
      <div className="table-scroll responsive-record-table">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Role</th>
              <th>Branch scope</th>
              <th>Hire date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((item) => (
              <tr key={item.id}>
                <td data-label="Employee">
                  <Link href={`/staff/${item.id}`}>
                    <strong>{item.employeeCode}</strong>
                    <small>{item.name}</small>
                  </Link>
                </td>
                <td data-label="Role">{item.role}</td>
                <td data-label="Branch scope">
                  {item.sharedScope
                    ? "Shared"
                    : item.branchIds
                        .map((id) => locationNames[id] ?? id)
                        .join(", ")}
                </td>
                <td data-label="Hire date">{item.hireDate}</td>
                <td data-label="Status">
                  <StatusBadge status={item.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
