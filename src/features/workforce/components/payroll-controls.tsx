"use client";
import { useState, useTransition } from "react";
import type { PayrollRun } from "../schemas/workforce";
import { transitionPayrollAction } from "../server/actions";
export function PayrollControls({
  run,
  canApprove,
}: {
  run: PayrollRun;
  canApprove: boolean;
}) {
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  const next =
    run.status === "draft"
      ? "submitted"
      : run.status === "submitted"
        ? "approved"
        : run.status === "approved"
          ? "paid"
          : null;
  const allowed = next && (next === "submitted" || canApprove);
  return (
    <section className="card detail-panel stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Approval</span>
          <h2>Payroll workflow</h2>
        </div>
      </div>
      {allowed ? (
        <button
          className="button"
          disabled={pending}
          onClick={() =>
            start(async () =>
              setMessage(
                (await transitionPayrollAction(run.id, next, run.version))
                  .message,
              ),
            )
          }
        >
          Mark {next}
        </button>
      ) : (
        <p className="muted">
          No payroll transition is available for this role and status.
        </p>
      )}
      {message && <p role="status">{message}</p>}
    </section>
  );
}
