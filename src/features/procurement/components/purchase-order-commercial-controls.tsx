"use client";
import { useState, useTransition } from "react";
import type { PurchaseOrder } from "../schemas/procurement";
import {
  decidePurchaseOrderAction,
  finishPurchaseOrderAction,
  submitPurchaseOrderAction,
} from "../server/actions";

export function PurchaseOrderCommercialControls({
  order,
  canCreate,
  canApprove,
}: {
  order: PurchaseOrder;
  canCreate: boolean;
  canApprove: boolean;
}) {
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  const run = (task: Promise<{ message: string }>) =>
    start(async () => setMessage((await task).message));
  return (
    <div className="stack-sm">
      <div className="inline-controls">
        {canCreate && order.status === "draft" && (
          <button
            className="button"
            disabled={pending}
            onClick={() =>
              run(submitPurchaseOrderAction(order.id, order.version))
            }
          >
            Submit for approval
          </button>
        )}
        {canApprove && order.status === "submitted" && (
          <>
            <button
              className="button"
              disabled={pending}
              onClick={() =>
                run(
                  decidePurchaseOrderAction(
                    order.id,
                    "approved",
                    "",
                    order.version,
                  ),
                )
              }
            >
              Approve
            </button>
            <input
              className="input"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Rejection reason"
            />
            <button
              className="button danger"
              disabled={pending}
              onClick={() =>
                run(
                  decidePurchaseOrderAction(
                    order.id,
                    "rejected",
                    reason,
                    order.version,
                  ),
                )
              }
            >
              Reject
            </button>
          </>
        )}
        {canApprove &&
          ["received", "partially_received"].includes(order.status) && (
            <>
              <input
                className="input"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Closure reason"
              />
              <button
                className="button"
                disabled={pending}
                onClick={() =>
                  run(
                    finishPurchaseOrderAction(
                      order.id,
                      "close",
                      reason,
                      order.version,
                    ),
                  )
                }
              >
                Close PO
              </button>
            </>
          )}
        {canApprove &&
          ["draft", "submitted", "approved"].includes(order.status) && (
            <button
              className="button danger"
              disabled={pending}
              onClick={() =>
                run(
                  finishPurchaseOrderAction(
                    order.id,
                    "cancel",
                    reason || "Cancelled by authorized approver.",
                    order.version,
                  ),
                )
              }
            >
              Cancel PO
            </button>
          )}
      </div>
      {message && (
        <p className="form-message" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
