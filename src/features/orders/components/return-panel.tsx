"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Order } from "../schemas/orders";
import {
  decideReturnAction,
  receiveReturnAction,
  requestReturnAction,
} from "../server/actions";

export function ReturnPanel({
  order,
  canDecide,
  canRefund,
}: {
  order: Order;
  canDecide: boolean;
  canRefund: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const first = order.lines[0];
  const run = (task: () => Promise<{ status: string; message: string }>) =>
    startTransition(async () => {
      const result = await task();
      setMessage(result.message);
      if (result.status === "success") router.refresh();
    });
  return (
    <section className="card detail-panel stack">
      <div>
        <span className="eyebrow">After sales</span>
        <h2>Returns</h2>
      </div>
      {message && (
        <div className="form-message" role="status">
          {message}
        </div>
      )}
      {order.status === "delivered" && first && canDecide && (
        <div className="inline-controls">
          <select
            className="select"
            id="return-variant"
            defaultValue={first.variantId}
          >
            {order.lines.map((line) => (
              <option key={line.variantId} value={line.variantId}>
                {line.sku}
              </option>
            ))}
          </select>
          <input
            aria-label="Return quantity"
            className="input quantity-input"
            min={1}
            onChange={(event) => setQuantity(Number(event.target.value))}
            type="number"
            value={quantity}
          />
          <input
            aria-label="Return reason"
            className="input"
            onChange={(event) => setReason(event.target.value)}
            placeholder="Return reason"
            value={reason}
          />
          <button
            className="button"
            disabled={pending || reason.trim().length < 3}
            onClick={() => {
              const select = document.getElementById(
                "return-variant",
              ) as HTMLSelectElement;
              run(() =>
                requestReturnAction(
                  order.id,
                  select.value,
                  quantity,
                  reason,
                  order.version,
                ),
              );
            }}
            type="button"
          >
            Request return
          </button>
        </div>
      )}
      {order.returns.map((item) => (
        <article className="return-row" key={item.id}>
          <div>
            <strong>{item.id.slice(0, 16)}</strong>
            <small>
              {item.lines
                .map((line) => `${line.quantity} × ${line.variantId}`)
                .join(", ")}
            </small>
          </div>
          <StatusBadge status={item.status} />
          <div className="button-group">
            {item.status === "requested" && canDecide && (
              <>
                <button
                  className="button secondary small"
                  disabled={pending}
                  onClick={() =>
                    run(() =>
                      decideReturnAction(
                        order.id,
                        item.id,
                        "approved",
                        order.version,
                      ),
                    )
                  }
                  type="button"
                >
                  Approve
                </button>
                <button
                  className="button danger small"
                  disabled={pending}
                  onClick={() =>
                    run(() =>
                      decideReturnAction(
                        order.id,
                        item.id,
                        "rejected",
                        order.version,
                      ),
                    )
                  }
                  type="button"
                >
                  Reject
                </button>
              </>
            )}
            {item.status === "approved" && canRefund && (
              <button
                className="button small"
                disabled={pending}
                onClick={() =>
                  run(() =>
                    receiveReturnAction(order.id, item.id, order.version),
                  )
                }
                type="button"
              >
                Receive and refund
              </button>
            )}
          </div>
        </article>
      ))}
      {!order.returns.length && <p className="muted">No returns recorded.</p>}
    </section>
  );
}
