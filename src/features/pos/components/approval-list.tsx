"use client";
import { useState, useTransition } from "react";
import { formatDate, formatMoney } from "@/lib/formatting";
import type { PosApproval } from "../schemas/pos";
import { decidePosApprovalAction } from "../server/actions";

export function ApprovalList({
  approvals,
}: {
  approvals: readonly PosApproval[];
}) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState("");
  return (
    <div className="stack">
      {approvals.map((approval) => (
        <article className="card pos-approval-card" key={approval.id}>
          <div>
            <span className="eyebrow">
              {approval.type.replaceAll("_", " ")}
            </span>
            <h3>{formatMoney(approval.amountMinor)}</h3>
            <p>{approval.reason}</p>
            <small className="muted">
              {approval.id} · {formatDate(approval.createdAt)}
            </small>
          </div>
          <span
            className={`badge ${approval.status === "approved" ? "success" : approval.status === "rejected" ? "danger" : "warning"}`}
          >
            {approval.status}
          </span>
          {approval.status === "pending" && (
            <div className="button-group">
              <button
                className="button small"
                disabled={pending}
                onClick={() =>
                  start(async () =>
                    setMessage(
                      (
                        await decidePosApprovalAction(
                          approval.id,
                          "approved",
                          approval.version,
                        )
                      ).message,
                    ),
                  )
                }
              >
                Approve
              </button>
              <button
                className="button danger small"
                disabled={pending}
                onClick={() =>
                  start(async () =>
                    setMessage(
                      (
                        await decidePosApprovalAction(
                          approval.id,
                          "rejected",
                          approval.version,
                        )
                      ).message,
                    ),
                  )
                }
              >
                Reject
              </button>
            </div>
          )}
        </article>
      ))}
      {message && (
        <div className="form-message success" role="status">
          {message}
        </div>
      )}
      {!approvals.length && (
        <div className="card empty-state">No POS approval requests.</div>
      )}
    </div>
  );
}
