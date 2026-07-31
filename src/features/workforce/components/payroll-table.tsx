import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatMoney } from "@/lib/formatting";
import type { PayrollRun } from "../schemas/workforce";
export function PayrollTable({ runs }: { runs: PayrollRun[] }) {
  if (!runs.length)
    return (
      <div className="empty-state">
        <h2>No payroll runs</h2>
        <p>Create a month and branch snapshot to begin.</p>
      </div>
    );
  return (
    <div className="table-card">
      <div className="table-scroll responsive-record-table">
        <table>
          <thead>
            <tr>
              <th>Payroll</th>
              <th>Month</th>
              <th>Scope</th>
              <th>Staff</th>
              <th>Net</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((item) => (
              <tr key={item.id}>
                <td data-label="Payroll">
                  <Link href={`/payroll/${item.id}`}>
                    <strong>{item.payrollNumber}</strong>
                  </Link>
                </td>
                <td data-label="Month">{item.month}</td>
                <td data-label="Scope">{item.locationId ?? "Consolidated"}</td>
                <td data-label="Staff">{item.lines.length}</td>
                <td data-label="Net">{formatMoney(item.netMinor)}</td>
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
