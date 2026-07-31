import { formatMoney } from "@/lib/formatting";
import type { ReportResult } from "../schemas/reports";
export function ReportTable({ report }: { report: ReportResult }) {
  if (!report.rows.length)
    return (
      <div className="empty-state">
        <h2>No report rows</h2>
        <p>No source records match the selected filters.</p>
      </div>
    );
  return (
    <div className="table-card">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {report.columns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {report.rows.map((row, index) => (
              <tr key={index}>
                {report.columns.map((column) => {
                  const value = row[column.key] ?? "";
                  return (
                    <td key={column.key}>
                      {column.format === "money"
                        ? formatMoney(Number(value))
                        : String(value)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
