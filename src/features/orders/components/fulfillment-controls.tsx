"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type {
  InventoryLocation,
  LocationId,
} from "@/features/inventory/schemas/inventory";
import type { Order } from "../schemas/orders";
import {
  assignOrderAction,
  confirmOrderAction,
  transitionOrderAction,
} from "../server/actions";
import { CancellationControls } from "./cancellation-controls";
import { PaymentControls } from "./payment-controls";

type Result = { status: string; message: string };
export function FulfillmentControls({
  order,
  locations,
  canCancel,
}: {
  order: Order;
  locations: readonly InventoryLocation[];
  canCancel: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [locationId, setLocationId] = useState(
    order.fulfillmentLocationId ?? "loc-online",
  );
  const run = (task: () => Promise<Result>) =>
    startTransition(async () => {
      const result = await task();
      setMessage(result.message);
      if (result.status === "success") router.refresh();
    });
  const next =
    order.status === "confirmed"
      ? "picking"
      : order.status === "picking"
        ? "packed"
        : order.status === "packed"
          ? "shipped"
          : order.status === "shipped"
            ? "delivered"
            : null;
  return (
    <section className="card detail-panel stack">
      <div>
        <span className="eyebrow">Order operations</span>
        <h2>Fulfillment controls</h2>
      </div>
      {message && (
        <div className="form-message" role="status">
          {message}
        </div>
      )}
      {order.status === "placed" && (
        <div className="inline-controls">
          <label htmlFor="fulfillment-location">Location</label>
          <select
            className="select"
            id="fulfillment-location"
            value={locationId}
            onChange={(event) =>
              setLocationId(event.target.value as LocationId)
            }
          >
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
          <button
            className="button secondary"
            disabled={pending}
            onClick={() =>
              run(() => assignOrderAction(order.id, locationId, order.version))
            }
            type="button"
          >
            Assign
          </button>
          <button
            className="button"
            disabled={pending || !order.fulfillmentLocationId}
            onClick={() =>
              run(() => confirmOrderAction(order.id, order.version))
            }
            type="button"
          >
            Confirm and reserve
          </button>
        </div>
      )}
      <PaymentControls order={order} pending={pending} run={run} />
      {next && (
        <button
          className="button"
          disabled={
            pending ||
            (next === "shipped" &&
              order.paymentMethod !== "cod" &&
              order.paymentStatus !== "paid")
          }
          onClick={() =>
            run(() => transitionOrderAction(order.id, next, order.version))
          }
          type="button"
        >
          Mark {next}
        </button>
      )}
      {canCancel && (
        <CancellationControls order={order} pending={pending} run={run} />
      )}
      {order.shipment && (
        <div className="notice">
          <strong>{order.shipment.courier}</strong> ·{" "}
          {order.shipment.trackingReference} ·{" "}
          {order.shipment.status.replaceAll("_", " ")}
        </div>
      )}
    </section>
  );
}
