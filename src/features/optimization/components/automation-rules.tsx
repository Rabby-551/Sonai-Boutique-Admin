import { StatusBadge } from "@/components/ui/status-badge";
import type { AutomationRule } from "../schemas/optimization";

export function AutomationRules({ rules }: { rules: AutomationRule[] }) {
  return (
    <section className="card table-card" aria-labelledby="automation-title">
      <div className="table-heading">
        <div>
          <div className="eyebrow">Allow-listed actions</div>
          <h2 id="automation-title">Automation rules</h2>
        </div>
        <span className="badge warning">Human-controlled</span>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Rule</th>
              <th scope="col">Trigger and condition</th>
              <th scope="col">Action</th>
              <th scope="col">Status</th>
              <th scope="col">Approval</th>
              <th scope="col">Runs / failures</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => (
              <tr key={rule.id}>
                <td>
                  <strong>{rule.name}</strong>
                </td>
                <td>
                  {rule.trigger}
                  <small>{rule.condition}</small>
                </td>
                <td>{rule.action}</td>
                <td>
                  <StatusBadge status={rule.status} />
                </td>
                <td>
                  <StatusBadge status={rule.approval} />
                </td>
                <td>
                  {rule.runs} / {rule.failures}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-note">
        Financial, stock, payroll, privacy, role and campaign publication
        actions are intentionally excluded from mock automation.
      </div>
    </section>
  );
}
