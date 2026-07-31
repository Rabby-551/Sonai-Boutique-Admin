"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import type { PurchaseOrder } from "../schemas/procurement";
import { transitionPurchaseOrderAction } from "../server/actions";

export function PurchaseOrderLogisticsControls({
  order,
  canCreate,
  canReceive,
}: {
  order: PurchaseOrder;
  canCreate: boolean;
  canReceive: boolean;
}) {
  const [reference, setReference] = useState("");
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  const next =
    order.status === "approved" ? "supplier_confirmed" : "in_transit";
  const canTransition =
    canCreate && ["approved", "supplier_confirmed"].includes(order.status);
  return (
    <div className="stack-sm">
      <div className="inline-controls">
        {canTransition && (
          <>
            <input
              className="input"
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              placeholder={
                next === "supplier_confirmed"
                  ? "Supplier confirmation reference"
                  : "Shipment reference"
              }
            />
            <button
              className="button"
              disabled={pending}
              onClick={() =>
                start(async () =>
                  setMessage(
                    (
                      await transitionPurchaseOrderAction(
                        order.id,
                        next,
                        reference,
                        order.version,
                      )
                    ).message,
                  ),
                )
              }
            >
              {next === "supplier_confirmed"
                ? "Supplier confirmed"
                : "Mark in transit"}
            </button>
          </>
        )}
        {canReceive &&
          ["supplier_confirmed", "in_transit", "partially_received"].includes(
            order.status,
          ) && (
            <Link
              className="button"
              href={`/purchase-orders/${order.id}/receive`}
            >
              Receive stock
            </Link>
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
