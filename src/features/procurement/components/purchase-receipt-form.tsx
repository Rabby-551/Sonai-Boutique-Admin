"use client";
import { useActionState } from "react";
import type { PurchaseOrder } from "../schemas/procurement";
import { receivePurchaseOrderAction } from "../server/actions";
import { initialProcurementActionState } from "../server/action-state";
export function PurchaseReceiptForm({ order }: { order: PurchaseOrder }) {
  const [state, action, pending] = useActionState(
    receivePurchaseOrderAction.bind(null, order.id),
    initialProcurementActionState,
  );
  return (
    <form action={action} className="catalog-form">
      <input type="hidden" name="expectedVersion" value={order.version} />
      <input
        type="hidden"
        name="idempotencyKey"
        value={`receipt-${order.id}-${order.version}`}
      />
      <section className="card table-card">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Outstanding</th>
                <th>Accepted</th>
                <th>Damaged</th>
                <th>Rejected</th>
              </tr>
            </thead>
            <tbody>
              {order.lines.map((line) => {
                const outstanding =
                  line.orderedQuantity -
                  line.acceptedQuantity -
                  line.damagedQuantity -
                  line.rejectedQuantity;
                return (
                  <tr key={line.variantId}>
                    <td>
                      {line.sku}
                      <input
                        type="hidden"
                        name="variantId"
                        value={line.variantId}
                      />
                    </td>
                    <td>{outstanding}</td>
                    <td>
                      <input
                        className="input quantity-input"
                        name="acceptedQuantity"
                        type="number"
                        min="0"
                        max={outstanding}
                        defaultValue="0"
                      />
                    </td>
                    <td>
                      <input
                        className="input quantity-input"
                        name="damagedQuantity"
                        type="number"
                        min="0"
                        max={outstanding}
                        defaultValue="0"
                      />
                    </td>
                    <td>
                      <input
                        className="input quantity-input"
                        name="rejectedQuantity"
                        type="number"
                        min="0"
                        max={outstanding}
                        defaultValue="0"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <section className="form-section">
        <div className="form-grid">
          <div className="field">
            <label htmlFor="reference">Receipt reference</label>
            <input
              className="input"
              id="reference"
              name="reference"
              required
              minLength={2}
            />
          </div>
          <div className="field full">
            <label htmlFor="note">Receiving note</label>
            <textarea className="textarea" id="note" name="note" rows={3} />
          </div>
        </div>
      </section>
      {state.message && (
        <p className={`form-message ${state.status}`} role="status">
          {state.message}
        </p>
      )}
      <button className="button" disabled={pending}>
        Record receipt
      </button>
    </form>
  );
}
