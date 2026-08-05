import { formatMoney } from "@/lib/formatting";

export function PosReconciliationSummary({
  rows,
}: {
  rows: readonly {
    id: string;
    name: string;
    grossMinor: number;
    refundMinor: number;
    netMinor: number;
  }[];
}) {
  return (
    <section className="card">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Recorded POS channels</span>
          <h2>Cash, bank and MFS ledger</h2>
          <p className="muted">
            Manual terminal references are recorded for later provider-statement
            matching.
          </p>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Channel</th>
              <th>Gross</th>
              <th>Refunds</th>
              <th>Net</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>{formatMoney(row.grossMinor)}</td>
                <td>{formatMoney(row.refundMinor)}</td>
                <td>
                  <strong>{formatMoney(row.netMinor)}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length && (
        <p className="muted">No POS tenders have been recorded.</p>
      )}
    </section>
  );
}
