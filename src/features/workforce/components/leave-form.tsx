"use client";
import { useActionState } from "react";
import { createLeaveAction } from "../server/actions";
import { initialWorkforceActionState } from "../server/action-state";
export function LeaveForm({
  staff,
}: {
  staff: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState(
    createLeaveAction,
    initialWorkforceActionState,
  );
  return (
    <form action={action} className="card detail-panel stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Time away</span>
          <h2>Request leave</h2>
        </div>
      </div>
      <div className="field">
        <label htmlFor="leave-staff">Staff</label>
        <select className="select" id="leave-staff" name="staffId" required>
          {staff.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="startDate">Start</label>
          <input
            className="input"
            id="startDate"
            name="startDate"
            type="date"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="endDate">End</label>
          <input
            className="input"
            id="endDate"
            name="endDate"
            type="date"
            required
          />
        </div>
      </div>
      <div className="field">
        <label htmlFor="leave-reason">Reason</label>
        <textarea
          className="textarea"
          id="leave-reason"
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
        Submit leave
      </button>
    </form>
  );
}
