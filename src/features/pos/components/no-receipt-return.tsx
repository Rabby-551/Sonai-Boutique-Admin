"use client";

import { useActionState, useState } from "react";
import { formatMoney } from "@/lib/formatting";
import type { PosBootstrap } from "../data/repository";
import { requestPosReturnAction } from "../server/actions";
import { initialPosActionState } from "../server/action-state";

export function NoReceiptReturn({ bootstrap }: { bootstrap: PosBootstrap }) {
  const [state, action, pending] = useActionState(
    requestPosReturnAction,
    initialPosActionState,
  );
  const [variantId, setVariantId] = useState(
    bootstrap.catalog[0]?.variantId ?? "",
  );
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [disposition, setDisposition] = useState<"restock" | "damaged">(
    "restock",
  );
  const product = bootstrap.catalog.find(
    (item) => item.variantId === variantId,
  );
  const shift = bootstrap.openShift;
  if (!shift || !bootstrap.settings.allowNoReceiptReturns) return null;
  const refundMinor = Math.round(Number(amount || 0) * 100);
  const payload = {
    saleId: null,
    receiptNumber: null,
    locationId: shift.locationId,
    shiftId: shift.id,
    reason,
    noReceipt: true,
    lines: [{ variantId, quantity: 1, disposition, refundMinor }],
  };
  return (
    <section className="card">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Manager override</span>
          <h2>No-receipt return</h2>
          <p className="muted">
            The approved value cannot exceed the current catalog price.
          </p>
        </div>
      </div>
      <form action={action} className="pos-no-receipt-form">
        <select
          className="select"
          onChange={(event) => {
            setVariantId(event.target.value);
            setAmount("");
          }}
          value={variantId}
        >
          {bootstrap.catalog.map((item) => (
            <option key={item.variantId} value={item.variantId}>
              {item.productName} · {item.variantLabel} · max{" "}
              {formatMoney(item.priceMinor)}
            </option>
          ))}
        </select>
        <input
          className="input"
          max={(product?.priceMinor ?? 0) / 100}
          min="0.01"
          onChange={(event) => setAmount(event.target.value)}
          placeholder="Approved value BDT"
          required
          step="0.01"
          type="number"
          value={amount}
        />
        <select
          className="select"
          onChange={(event) =>
            setDisposition(event.target.value as typeof disposition)
          }
          value={disposition}
        >
          <option value="restock">Restockable</option>
          <option value="damaged">Damaged</option>
        </select>
        <input
          className="input"
          minLength={3}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Required override reason"
          required
          value={reason}
        />
        <input name="payload" type="hidden" value={JSON.stringify(payload)} />
        <button
          className="button secondary"
          disabled={pending || !variantId || refundMinor <= 0}
        >
          Request approval
        </button>
        {state.message && <small>{state.message}</small>}
      </form>
    </section>
  );
}
