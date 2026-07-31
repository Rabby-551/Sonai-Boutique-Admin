"use client";
import { useActionState } from "react";
import type { PayrollRun } from "../schemas/workforce";
import { adjustPayrollAction } from "../server/actions";
import { initialWorkforceActionState } from "../server/action-state";
export function PayrollAdjustmentForm({ run }: { run: PayrollRun }) {
  const [state, action, pending] = useActionState(
    adjustPayrollAction.bind(null, run.id),
    initialWorkforceActionState,
  );
  if (run.status !== "draft") return null;
  return (
    <form action={action} className="card detail-panel stack">
      <input type="hidden" name="expectedVersion" value={run.version} />
      <div className="section-heading">
        <div>
          <span className="eyebrow">Manual adjustment</span>
          <h2>Adjust a payroll line</h2>
        </div>
      </div>
      <div className="field">
        <label htmlFor="adjust-staff">Staff</label>
        <select className="select" id="adjust-staff" name="staffId">
          {run.lines.map((line) => (
            <option key={line.staffId} value={line.staffId}>
              {line.staffName}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="adjustment">Adjustment (BDT)</label>
        <input
          className="input"
          id="adjustment"
          name="adjustment"
          type="number"
          step="0.01"
          required
        />
      </div>
      <div className="field">
        <label htmlFor="adjust-reason">Mandatory reason</label>
        <textarea
          className="textarea"
          id="adjust-reason"
          name="reason"
          rows={3}
          required
        />
      </div>
      {state.message && (
        <p className={`form-message ${state.status}`} role="status">
          {state.message}
        </p>
      )}
      <button className="button" disabled={pending}>
        Apply adjustment
      </button>
    </form>
  );
}
