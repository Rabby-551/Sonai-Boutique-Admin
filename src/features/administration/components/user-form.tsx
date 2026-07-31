"use client";
import { useActionState } from "react";
import type { Staff } from "../schemas/administration";
import { createUserAction } from "../server/actions";
import { initialAdministrationActionState } from "../server/action-state";
export function UserForm({ staff }: { staff: Staff[] }) {
  const [state, action, pending] = useActionState(
    createUserAction,
    initialAdministrationActionState,
  );
  return (
    <form action={action} className="card detail-panel stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Account</span>
          <h2>Create mock user</h2>
        </div>
      </div>
      <div className="field">
        <label htmlFor="staffId">Staff profile</label>
        <select className="select" id="staffId" name="staffId" required>
          <option value="">Select staff</option>
          {staff.map((item) => (
            <option key={item.id} value={item.id}>
              {item.employeeCode} · {item.name}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="username">Username email</label>
        <input
          className="input"
          id="username"
          name="username"
          type="email"
          required
        />
      </div>
      <div className="field">
        <label htmlFor="user-role">Role</label>
        <select
          className="select"
          id="user-role"
          name="role"
          defaultValue="cashier"
        >
          {["owner", "manager", "cashier", "support"].map((role) => (
            <option key={role}>{role}</option>
          ))}
        </select>
      </div>
      {state.message && (
        <p className={`form-message ${state.status}`} role="status">
          {state.message}
        </p>
      )}
      <button className="button" disabled={pending}>
        Create user
      </button>
    </form>
  );
}
