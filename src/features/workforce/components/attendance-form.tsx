"use client";
import { useActionState } from "react";
import { recordAttendanceAction } from "../server/actions";
import { initialWorkforceActionState } from "../server/action-state";
export function AttendanceForm({
  staff,
}: {
  staff: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState(
    recordAttendanceAction,
    initialWorkforceActionState,
  );
  return (
    <form action={action} className="card detail-panel stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Daily log</span>
          <h2>Record attendance</h2>
        </div>
      </div>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="attendance-staff-form">Staff</label>
          <select
            className="select"
            id="attendance-staff-form"
            name="staffId"
            required
          >
            {staff.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="attendance-date">Date</label>
          <input
            className="input"
            id="attendance-date"
            name="date"
            type="date"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="attendance-record-status">Status</label>
          <select
            className="select"
            id="attendance-record-status"
            name="status"
            defaultValue="present"
          >
            {["present", "absent", "leave", "weekend"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="checkIn">Check in</label>
          <input className="input" id="checkIn" name="checkIn" type="time" />
        </div>
        <div className="field">
          <label htmlFor="checkOut">Check out</label>
          <input className="input" id="checkOut" name="checkOut" type="time" />
        </div>
        <div className="field full">
          <label htmlFor="attendance-note">Note</label>
          <input className="input" id="attendance-note" name="note" />
        </div>
      </div>
      {state.message && (
        <p className={`form-message ${state.status}`} role="status">
          {state.message}
        </p>
      )}
      <button className="button" disabled={pending}>
        Save attendance
      </button>
    </form>
  );
}
