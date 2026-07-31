"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  dispatchTransferAction,
  receiveTransferAction,
} from "../server/actions";
import type { StockTransfer } from "../schemas/inventory";

export function TransferControls({ transfer }: { transfer: StockTransfer }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const run = (operation: "dispatch" | "receive") =>
    startTransition(async () => {
      const result =
        operation === "dispatch"
          ? await dispatchTransferAction(transfer.id, transfer.version)
          : await receiveTransferAction(transfer.id, transfer.version);
      setMessage(result.message);
      if (result.status === "success") router.refresh();
    });
  if (!(["draft", "in_transit"] as string[]).includes(transfer.status))
    return null;
  return (
    <div className="stack-sm">
      {message && (
        <div className="form-message" role="status">
          {message}
        </div>
      )}
      <button
        className="button"
        disabled={pending}
        onClick={() =>
          run(transfer.status === "draft" ? "dispatch" : "receive")
        }
        type="button"
      >
        {pending
          ? "Updating…"
          : transfer.status === "draft"
            ? "Dispatch transfer"
            : "Receive transfer"}
      </button>
    </div>
  );
}
