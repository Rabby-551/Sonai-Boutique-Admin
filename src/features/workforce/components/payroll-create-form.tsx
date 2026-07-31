"use client";
import { useActionState } from "react";
import { createPayrollAction } from "../server/actions";
import { initialWorkforceActionState } from "../server/action-state";
export function PayrollCreateForm({
  locations,
}: {
  locations: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState(
    createPayrollAction,
    initialWorkforceActionState,
  );
  return (
    <form action={action} className="card detail-panel stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Snapshot</span>
          <h2>Create payroll draft</h2>
        </div>
      </div>
      <div className="field">
        <label htmlFor="payroll-month">Month</label>
        <input
          className="input"
          id="payroll-month"
          name="month"
          type="month"
          required
        />
      </div>
      <div className="field">
        <label htmlFor="payroll-location">Scope</label>
        <select className="select" id="payroll-location" name="locationId">
          <option value="">Consolidated</option>
          {locations.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
      {state.message && (
        <p className={`form-message ${state.status}`} role="status">
          {state.message}
        </p>
      )}
      <button className="button" disabled={pending}>
        Create payroll
      </button>
    </form>
  );
}
