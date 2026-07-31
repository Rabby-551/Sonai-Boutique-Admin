"use client";
import { useActionState } from "react";
import { RotateCcw } from "lucide-react";
import { resetDemoAction } from "../server/actions";
import { initialDemoActionState } from "../server/action-state";

export function ResetDemoData({ canReset }: { canReset: boolean }) {
  const [state, action, pending] = useActionState(
    resetDemoAction,
    initialDemoActionState,
  );
  return (
    <section className="card reset-panel" aria-labelledby="reset-title">
      <div className="demo-card-heading">
        <div>
          <div className="eyebrow">Mock safety control</div>
          <h2 id="reset-title">Restore demo data</h2>
        </div>
        <RotateCcw aria-hidden size={21} />
      </div>
      <p>
        Replace mock changes with the canonical fictional catalog, operations,
        customer, procurement and administration fixtures.
      </p>
      {canReset ? (
        <form action={action} className="inline-controls">
          <div className="field grow">
            <label htmlFor="reset-confirmation">Type RESET DEMO</label>
            <input
              className="input"
              id="reset-confirmation"
              name="confirmation"
              autoComplete="off"
            />
          </div>
          <button className="button danger" disabled={pending}>
            {pending ? "Restoring…" : "Reset demo"}
          </button>
        </form>
      ) : (
        <div className="notice">
          Reset is unavailable. It requires the Owner role, mock data mode and
          the explicit demo reset environment gate.
        </div>
      )}
      {state.message && (
        <p className={`form-message ${state.status}`} role="status">
          {state.message}
        </p>
      )}
    </section>
  );
}
