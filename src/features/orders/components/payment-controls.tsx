import type { Order } from "../schemas/orders";
import { paymentAction } from "../server/actions";

type CommandResult = { status: string; message: string };

export function PaymentControls({
  order,
  pending,
  run,
}: {
  order: Order;
  pending: boolean;
  run: (task: () => Promise<CommandResult>) => void;
}) {
  if (
    order.status !== "placed" ||
    order.paymentStatus === "paid" ||
    order.paymentMethod === "cod"
  ) {
    return null;
  }

  return (
    <div className="button-group">
      <button
        className="button secondary"
        disabled={pending}
        onClick={() =>
          run(() => paymentAction(order.id, "paid", order.version))
        }
        type="button"
      >
        Mock payment success
      </button>
      <button
        className="button danger"
        disabled={pending}
        onClick={() =>
          run(() => paymentAction(order.id, "failed", order.version))
        }
        type="button"
      >
        Mock payment failure
      </button>
    </div>
  );
}
