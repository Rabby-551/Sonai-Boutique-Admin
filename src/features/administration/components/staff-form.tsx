"use client";
import { useActionState } from "react";
import type { Staff } from "../schemas/administration";
import { createStaffAction, updateStaffAction } from "../server/actions";
import { initialAdministrationActionState } from "../server/action-state";
export function StaffForm({
  staff,
  locations,
}: {
  staff?: Staff;
  locations: { id: string; name: string }[];
}) {
  const action = staff
    ? updateStaffAction.bind(null, staff.id)
    : createStaffAction;
  const [state, formAction, pending] = useActionState(
    action,
    initialAdministrationActionState,
  );
  return (
    <form action={formAction} className="catalog-form">
      {staff && (
        <input type="hidden" name="expectedVersion" value={staff.version} />
      )}
      <section className="form-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">People</span>
            <h2>Employment profile</h2>
          </div>
        </div>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="name">Name</label>
            <input
              className="input"
              id="name"
              name="name"
              required
              defaultValue={staff?.name}
            />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone</label>
            <input
              className="input"
              id="phone"
              name="phone"
              required
              defaultValue={staff?.phone}
            />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              className="input"
              id="email"
              name="email"
              type="email"
              defaultValue={staff?.email ?? ""}
            />
          </div>
          <div className="field">
            <label htmlFor="role">Base role</label>
            <select
              className="select"
              id="role"
              name="role"
              defaultValue={staff?.role ?? "cashier"}
            >
              {["owner", "manager", "cashier", "support"].map((role) => (
                <option key={role}>{role}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="hireDate">Hire date</label>
            <input
              className="input"
              id="hireDate"
              name="hireDate"
              type="date"
              required
              defaultValue={staff?.hireDate}
            />
          </div>
          <div className="field">
            <label htmlFor="salaryGrade">Salary grade</label>
            <input
              className="input"
              id="salaryGrade"
              name="salaryGrade"
              required
              defaultValue={staff?.salaryGrade}
            />
          </div>
          <div className="field">
            <label htmlFor="status">Employment status</label>
            <select
              className="select"
              id="status"
              name="status"
              defaultValue={staff?.status ?? "active"}
            >
              <option value="active">Active</option>
              <option value="on_leave">On leave</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>
          <div className="field full">
            <span className="label">Branch assignments</span>
            <div className="button-group">
              {locations.map((item) => (
                <label key={item.id} className="inline-controls">
                  <input
                    type="checkbox"
                    name="branchIds"
                    value={item.id}
                    defaultChecked={staff?.branchIds.includes(item.id)}
                  />
                  {item.name}
                </label>
              ))}
              <label className="inline-controls">
                <input
                  type="checkbox"
                  name="sharedScope"
                  defaultChecked={staff?.sharedScope}
                />
                Shared/admin scope
              </label>
            </div>
          </div>
          <div className="field full">
            <label htmlFor="notes">Internal notes</label>
            <textarea
              className="textarea"
              id="notes"
              name="notes"
              rows={3}
              defaultValue={staff?.notes}
            />
          </div>
        </div>
      </section>
      {state.message && (
        <p className={`form-message ${state.status}`} role="status">
          {state.message}
        </p>
      )}
      <div className="form-footer">
        <button className="button" disabled={pending}>
          {pending ? "Saving…" : staff ? "Save profile" : "Create staff"}
        </button>
      </div>
    </form>
  );
}
