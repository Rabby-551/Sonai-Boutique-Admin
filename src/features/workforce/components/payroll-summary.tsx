import { formatMoney } from "@/lib/formatting";
import type { PayrollRun } from "../schemas/workforce";
export function PayrollSummary({ run }: { run: PayrollRun }) {
  return (
    <>
      <div className="metric-grid">
        <article className="metric-card">
          <span>Gross</span>
          <strong>{formatMoney(run.grossMinor)}</strong>
        </article>
        <article className="metric-card">
          <span>Deductions</span>
          <strong>{formatMoney(run.deductionsMinor)}</strong>
        </article>
        <article className="metric-card">
          <span>Net payroll</span>
          <strong>{formatMoney(run.netMinor)}</strong>
        </article>
        <article className="metric-card">
          <span>Staff</span>
          <strong>{run.lines.length}</strong>
        </article>
      </div>
      <div className="table-card">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Staff</th>
                <th>Base</th>
                <th>Allowance</th>
                <th>Absent</th>
                <th>Deductions</th>
                <th>Adjustment</th>
                <th>Net</th>
              </tr>
            </thead>
            <tbody>
              {run.lines.map((line) => (
                <tr key={line.staffId}>
                  <td>{line.staffName}</td>
                  <td>{formatMoney(line.baseSalaryMinor)}</td>
                  <td>{formatMoney(line.allowanceMinor)}</td>
                  <td>{line.absenceDays}</td>
                  <td>
                    {formatMoney(
                      line.fixedDeductionMinor + line.absenceDeductionMinor,
                    )}
                  </td>
                  <td>{formatMoney(line.adjustmentMinor)}</td>
                  <td>
                    <strong>{formatMoney(line.netPayMinor)}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
