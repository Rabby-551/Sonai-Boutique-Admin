import { StatusBadge } from "@/components/ui/status-badge";
import { formatMoney } from "@/lib/formatting";
import type { ReconciliationRun } from "../schemas/optimization";

export function ReconciliationRuns({ runs }: { runs: ReconciliationRun[] }) {
  const active = runs[0];
  return (
    <div className="stack">
      <section className="metric-grid" aria-label="Reconciliation summary">
        <article className="card metric-card">
          <span>Settlement total</span>
          <strong>{formatMoney(active.totalMinor)}</strong>
          <small>{active.provider}</small>
        </article>
        <article className="card metric-card">
          <span>Exact matches</span>
          <strong>
            {active.matched}/{active.received}
          </strong>
          <small>Only exact matches auto-close</small>
        </article>
        <article className="card metric-card">
          <span>Exceptions</span>
          <strong>{active.exceptions}</strong>
          <small>Authorized review required</small>
        </article>
      </section>
      <section
        className="card table-card"
        aria-labelledby="reconciliation-title"
      >
        <div className="table-heading">
          <div>
            <div className="eyebrow">Settlement exceptions</div>
            <h2 id="reconciliation-title">
              {active.provider} · {active.settlementDate}
            </h2>
          </div>
          <StatusBadge status={active.status} />
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">Provider reference</th>
                <th scope="col">Order</th>
                <th scope="col">Provider</th>
                <th scope="col">Internal</th>
                <th scope="col">Difference</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {active.items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.providerReference}</strong>
                    <small>{item.reason}</small>
                  </td>
                  <td>{item.orderNumber ?? "Not found"}</td>
                  <td>{formatMoney(item.providerMinor)}</td>
                  <td>
                    {item.internalMinor === null
                      ? "—"
                      : formatMoney(item.internalMinor)}
                  </td>
                  <td>{formatMoney(item.differenceMinor)}</td>
                  <td>
                    <StatusBadge status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
