"use client";
import { useActionState } from "react";
import { setSalaryAction } from "../server/actions";
import { initialWorkforceActionState } from "../server/action-state";
export function SalaryForm({ staffId }: { staffId: string }) {
  const [state, action, pending] = useActionState(
    setSalaryAction,
    initialWorkforceActionState,
  );
  return (
    <form action={action} className="card detail-panel stack">
      <input type="hidden" name="staffId" value={staffId} />
      <div className="section-heading">
        <div>
          <span className="eyebrow">Compensation</span>
          <h2>New salary record</h2>
        </div>
      </div>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="effectiveFrom">Effective from</label>
          <input
            className="input"
            id="effectiveFrom"
            name="effectiveFrom"
            type="date"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="grade">Grade</label>
          <input className="input" id="grade" name="grade" required />
        </div>
        <div className="field">
          <label htmlFor="baseSalary">Base salary (BDT)</label>
          <input
            className="input"
            id="baseSalary"
            name="baseSalary"
            type="number"
            min="0"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="allowance">Fixed allowance (BDT)</label>
          <input
            className="input"
            id="allowance"
            name="allowance"
            type="number"
            min="0"
            defaultValue="0"
          />
        </div>
        <div className="field">
          <label htmlFor="deduction">Fixed deduction (BDT)</label>
          <input
            className="input"
            id="deduction"
            name="deduction"
            type="number"
            min="0"
            defaultValue="0"
          />
        </div>
        <div className="field full">
          <label htmlFor="salary-note">Reason/note</label>
          <input className="input" id="salary-note" name="note" />
        </div>
      </div>
      {state.message && (
        <p className={`form-message ${state.status}`} role="status">
          {state.message}
        </p>
      )}
      <button className="button" disabled={pending}>
        Add salary record
      </button>
    </form>
  );
}
