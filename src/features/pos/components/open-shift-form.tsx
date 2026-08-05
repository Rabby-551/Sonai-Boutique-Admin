"use client";
import { useActionState, useEffect } from "react";
import type { PosRegister } from "../schemas/pos";
import { openShiftAction } from "../server/actions";
import { initialPosActionState } from "../server/action-state";

export function OpenShiftForm({
  registers,
}: {
  registers: readonly PosRegister[];
}) {
  const [state, action, pending] = useActionState(
    openShiftAction,
    initialPosActionState,
  );
  useEffect(() => {
    if (state.status === "success") window.location.reload();
  }, [state.status]);
  return (
    <form action={action} className="pos-start-card">
      <span className="eyebrow">Register control</span>
      <h2>Open your shift</h2>
      <p className="muted">
        Choose your counter and record the opening cash float before selling.
      </p>
      {state.message && (
        <div className={`form-message ${state.status}`} role="status">
          {state.message}
        </div>
      )}
      <label className="field">
        <span>Register</span>
        <select className="select" name="registerId" required>
          <option value="">Select a register</option>
          {registers.map((register) => (
            <option key={register.id} value={register.id}>
              {register.code} · {register.name}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Opening cash float (BDT)</span>
        <input
          className="input"
          min="0"
          name="openingFloat"
          required
          step="0.01"
          type="number"
        />
      </label>
      <button className="button" disabled={pending || !registers.length}>
        Open shift
      </button>
      {!registers.length && (
        <p className="form-message error">
          No active register is assigned to this store.
        </p>
      )}
    </form>
  );
}
