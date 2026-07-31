"use client";
import { useActionState, useEffect } from "react";
import { VariantLineEditor } from "@/features/inventory/components/variant-line-editor";
import type {
  InventoryLocation,
  InventoryRow,
} from "@/features/inventory/schemas/inventory";
import { createOrderAction } from "../server/actions";
import { initialOrderActionState } from "../server/action-state";

export function OrderForm({
  rows,
  locations,
}: {
  rows: readonly InventoryRow[];
  locations: readonly InventoryLocation[];
}) {
  const [state, action, pending] = useActionState(
    createOrderAction,
    initialOrderActionState,
  );
  useEffect(() => {
    // A full navigation guarantees the detail query sees the committed file-backed transaction.
    if (state.status === "success" && state.id)
      window.location.assign(`/orders/${state.id}`);
  }, [state]);
  return (
    <form action={action} className="catalog-form">
      {state.message && (
        <div className={`form-message ${state.status}`} role="status">
          {state.message}
        </div>
      )}
      <fieldset>
        <legend>Customer and source</legend>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="source">Source</label>
            <select className="select" id="source" name="source">
              <option value="phone">Phone</option>
              <option value="branch">Branch</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="messenger">Messenger</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="customerName">Customer name</label>
            <input
              className="input"
              id="customerName"
              name="customerName"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="customerPhone">Bangladesh phone</label>
            <input
              className="input"
              id="customerPhone"
              name="customerPhone"
              pattern="\+8801[0-9]{9}"
              placeholder="+8801712345678"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="customerEmail">Email (optional)</label>
            <input
              className="input"
              id="customerEmail"
              name="customerEmail"
              type="email"
            />
          </div>
        </div>
      </fieldset>
      <VariantLineEditor rows={rows} legend="Order lines" />
      <fieldset>
        <legend>Assignment and delivery</legend>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="preferredLocationId">Preferred location</label>
            <select
              className="select"
              id="preferredLocationId"
              name="preferredLocationId"
            >
              <option value="">Auto assign</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="delivery">Delivery fee (BDT)</label>
            <input
              className="input"
              defaultValue={80}
              id="delivery"
              min={0}
              name="delivery"
              step="0.01"
              type="number"
            />
          </div>
          <div className="field field-span">
            <label htmlFor="deliveryAddress">Delivery address</label>
            <textarea
              className="textarea"
              id="deliveryAddress"
              name="deliveryAddress"
              rows={3}
            />
          </div>
        </div>
      </fieldset>
      <fieldset>
        <legend>Payment and notes</legend>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="paymentMethod">Payment method</label>
            <select className="select" id="paymentMethod" name="paymentMethod">
              {["cash", "cod", "bkash", "nagad", "card"].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="notes">Internal notes</label>
            <textarea className="textarea" id="notes" name="notes" rows={3} />
          </div>
        </div>
      </fieldset>
      <button
        className="button"
        disabled={pending || !rows.length}
        type="submit"
      >
        {pending ? "Creating…" : "Create order"}
      </button>
    </form>
  );
}
