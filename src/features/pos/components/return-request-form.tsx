"use client";
import { useActionState, useMemo, useState } from "react";
import { formatMoney } from "@/lib/formatting";
import type { PosSale } from "../schemas/pos";
import { requestPosReturnAction } from "../server/actions";
import { initialPosActionState } from "../server/action-state";

export function ReturnRequestForm({
  sale,
  shiftId,
}: {
  sale: PosSale;
  shiftId: string;
}) {
  const [state, action, pending] = useActionState(
    requestPosReturnAction,
    initialPosActionState,
  );
  const [variantId, setVariantId] = useState(sale.lines[0]?.variantId ?? "");
  const [quantity, setQuantity] = useState(1);
  const [disposition, setDisposition] = useState<"restock" | "damaged">(
    "restock",
  );
  const line = useMemo(
    () => sale.lines.find((item) => item.variantId === variantId),
    [sale.lines, variantId],
  );
  const refundMinor = (line?.refundableUnitMinor ?? 0) * quantity;
  const payload = {
    saleId: sale.id,
    receiptNumber: sale.receiptNumber,
    locationId: sale.locationId,
    shiftId,
    reason: "Customer return at POS",
    noReceipt: false,
    lines: [{ variantId, quantity, disposition, refundMinor }],
  };
  return (
    <form action={action} className="pos-return-form">
      <select
        className="select"
        onChange={(event) => setVariantId(event.target.value)}
        value={variantId}
      >
        {sale.lines.map((item) => (
          <option key={item.variantId} value={item.variantId}>
            {item.productName} · {item.variantLabel}
          </option>
        ))}
      </select>
      <input
        aria-label="Return quantity"
        className="input"
        max={line?.quantity ?? 1}
        min="1"
        onChange={(event) => setQuantity(Number(event.target.value))}
        type="number"
        value={quantity}
      />
      <select
        aria-label="Item condition"
        className="select"
        onChange={(event) =>
          setDisposition(event.target.value as "restock" | "damaged")
        }
        value={disposition}
      >
        <option value="restock">Restockable</option>
        <option value="damaged">Damaged</option>
      </select>
      <input name="payload" type="hidden" value={JSON.stringify(payload)} />
      <button
        className="button secondary small"
        disabled={pending || !variantId}
      >
        Prepare {formatMoney(refundMinor)} return
      </button>
      {state.message && (
        <small className={state.status === "error" ? "danger-text" : "muted"}>
          {state.message}
          {state.id && ` · ${state.id}`}
        </small>
      )}
    </form>
  );
}
