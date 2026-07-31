import { useState } from "react";
import type { Order } from "../schemas/orders";
import { cancelOrderAction } from "../server/actions";

type CommandResult = { status: string; message: string };

export function CancellationControls({
  order,
  pending,
  run,
}: {
  order: Order;
  pending: boolean;
  run: (task: () => Promise<CommandResult>) => void;
}) {
  const [reason, setReason] = useState("");
  if (!["placed", "confirmed", "picking", "packed"].includes(order.status))
    return null;

  return (
    <div className="inline-controls">
      <label className="sr-only" htmlFor="cancel-reason">
        Cancellation reason
      </label>
      <input
        className="input"
        id="cancel-reason"
        onChange={(event) => setReason(event.target.value)}
        placeholder="Cancellation reason"
        value={reason}
      />
      <button
        className="button danger"
        disabled={pending || reason.trim().length < 3}
        onClick={() =>
          run(() => cancelOrderAction(order.id, reason, order.version))
        }
        type="button"
      >
        Cancel order
      </button>
    </div>
  );
}
