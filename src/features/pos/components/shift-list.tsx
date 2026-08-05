"use client";
import { useActionState, useEffect } from "react";
import { formatDate, formatMoney } from "@/lib/formatting";
import type { PosRegister, RegisterShift } from "../schemas/pos";
import { closeShiftAction } from "../server/actions";
import { initialPosActionState } from "../server/action-state";

function CloseShiftForm({ shift }: { shift: RegisterShift }) {
  const [state, action, pending] = useActionState(
    closeShiftAction,
    initialPosActionState,
  );
  useEffect(() => {
    if (state.status === "success") window.location.reload();
  }, [state.status]);
  return (
    <form action={action} className="inline-controls">
      <input name="shiftId" type="hidden" value={shift.id} />
      <input name="version" type="hidden" value={shift.version} />
      <input
        aria-label="Counted cash BDT"
        className="input"
        min="0"
        name="countedCash"
        placeholder="Counted cash BDT"
        required
        step="0.01"
        type="number"
      />
      <input
        aria-label="Override reason"
        className="input"
        name="reason"
        placeholder="Override reason if needed"
      />
      <button className="button small" disabled={pending}>
        Close shift
      </button>
      {state.message && (
        <small className={state.status === "error" ? "danger-text" : "muted"}>
          {state.message}
        </small>
      )}
    </form>
  );
}

export function ShiftList({
  shifts,
  registers,
}: {
  shifts: readonly RegisterShift[];
  registers: readonly PosRegister[];
}) {
  return (
    <div className="stack">
      {shifts.map((shift) => (
        <article className="card pos-shift-card" key={shift.id}>
          <div>
            <span className="eyebrow">
              {registers.find((item) => item.id === shift.registerId)?.name ??
                shift.registerId}
            </span>
            <h3>{shift.status === "open" ? "Open shift" : "Closed shift"}</h3>
            <p className="muted">
              Opened {formatDate(shift.openedAt)} · Float{" "}
              {formatMoney(shift.openingFloatMinor)}
            </p>
          </div>
          <div className="pos-shift-totals">
            <span>
              Expected{" "}
              <strong>
                {shift.expectedCashMinor === null
                  ? "—"
                  : formatMoney(shift.expectedCashMinor)}
              </strong>
            </span>
            <span>
              Counted{" "}
              <strong>
                {shift.countedCashMinor === null
                  ? "—"
                  : formatMoney(shift.countedCashMinor)}
              </strong>
            </span>
            <span>
              Variance{" "}
              <strong>
                {shift.varianceMinor === null
                  ? "—"
                  : formatMoney(shift.varianceMinor)}
              </strong>
            </span>
          </div>
          {shift.status === "open" && <CloseShiftForm shift={shift} />}
        </article>
      ))}
      {!shifts.length && (
        <div className="card empty-state">
          No register shifts have been recorded.
        </div>
      )}
    </div>
  );
}
