"use client";
import { useActionState } from "react";
import type { InventoryLocation } from "@/features/inventory/schemas/inventory";
import type { Supplier } from "../schemas/procurement";
import { createPurchaseOrderAction } from "../server/actions";
import { initialProcurementActionState } from "../server/action-state";
import { PurchaseOrderLineEditor } from "./purchase-order-line-editor";
import type { VariantOption } from "./variant-options";
export function PurchaseOrderForm({
  suppliers,
  locations,
  options,
}: {
  suppliers: readonly Supplier[];
  locations: readonly InventoryLocation[];
  options: readonly VariantOption[];
}) {
  const [state, action, pending] = useActionState(
    createPurchaseOrderAction,
    initialProcurementActionState,
  );
  return (
    <form action={action} className="catalog-form">
      <section className="form-section">
        <div className="form-grid three">
          <div className="field">
            <label htmlFor="supplierId">Supplier</label>
            <select
              className="select"
              id="supplierId"
              name="supplierId"
              required
            >
              <option value="">Select supplier</option>
              {suppliers
                .filter((item) => item.status === "active")
                .map((item) => (
                  <option value={item.id} key={item.id}>
                    {item.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="destinationLocationId">Destination</label>
            <select
              className="select"
              id="destinationLocationId"
              name="destinationLocationId"
              required
            >
              {locations.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="expectedDeliveryDate">Expected delivery</label>
            <input
              className="input"
              id="expectedDeliveryDate"
              name="expectedDeliveryDate"
              type="date"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="shipping">Shipping (BDT)</label>
            <input
              className="input"
              id="shipping"
              name="shipping"
              type="number"
              min="0"
              step="0.01"
              defaultValue="0"
            />
          </div>
          <div className="field">
            <label htmlFor="other">Other charges (BDT)</label>
            <input
              className="input"
              id="other"
              name="other"
              type="number"
              min="0"
              step="0.01"
              defaultValue="0"
            />
          </div>
          <div className="field full">
            <label htmlFor="note">Notes</label>
            <textarea className="textarea" id="note" name="note" rows={3} />
          </div>
        </div>
        <PurchaseOrderLineEditor options={options} />
      </section>
      {state.message && (
        <p className={`form-message ${state.status}`} role="status">
          {state.message}
        </p>
      )}
      <button className="button" disabled={pending}>
        Create draft
      </button>
    </form>
  );
}
