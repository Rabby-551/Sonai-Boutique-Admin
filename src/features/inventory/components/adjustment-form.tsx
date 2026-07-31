"use client";
import { useActionState, useState } from "react";
import { adjustStockAction } from "../server/actions";
import { initialInventoryActionState } from "../server/action-state";
import type {
  InventoryLocation,
  InventoryRow,
  LocationId,
} from "../schemas/inventory";
import { ScannerInput } from "./scanner-input";

export function AdjustmentForm({
  rows,
  locations,
  initialVariantId,
}: {
  rows: readonly InventoryRow[];
  locations: readonly InventoryLocation[];
  initialVariantId?: string;
}) {
  const [state, action, pending] = useActionState(
    adjustStockAction,
    initialInventoryActionState,
  );
  const [selected, setSelected] = useState(
    rows.find((row) => row.variantId === initialVariantId) ?? rows[0],
  );
  const [locationId, setLocationId] = useState<LocationId>("loc-online");
  return (
    <div className="stack">
      <ScannerInput rows={rows} onSelect={setSelected} />
      <form action={action} className="catalog-form compact-form">
        <input
          name="expectedVersion"
          type="hidden"
          value={selected?.balanceVersions[locationId] ?? 1}
        />
        {state.message && (
          <div className={`form-message ${state.status}`} role="status">
            {state.message}
          </div>
        )}
        <div className="form-grid">
          <div className="field">
            <label htmlFor="movement-variant">Variant</label>
            <select
              className="select"
              id="movement-variant"
              name="variantId"
              value={selected?.variantId ?? ""}
              onChange={(event) =>
                setSelected(
                  rows.find((row) => row.variantId === event.target.value) ??
                    rows[0],
                )
              }
            >
              {rows.map((row) => (
                <option key={row.variantId} value={row.variantId}>
                  {row.sku} · {row.productName}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="movement-location">Location</label>
            <select
              className="select"
              id="movement-location"
              name="locationId"
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
          </div>
          <div className="field">
            <label htmlFor="movement-kind">Movement type</label>
            <select className="select" id="movement-kind" name="kind">
              <option value="receipt">Receipt</option>
              <option value="adjustment">Signed adjustment</option>
              <option value="damage">Damage</option>
              <option value="return">Manual return</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="movement-quantity">Quantity</label>
            <input
              className="input"
              id="movement-quantity"
              name="quantity"
              required
              type="number"
            />
          </div>
          <div className="field">
            <label htmlFor="movement-reference">Reference</label>
            <input
              className="input"
              id="movement-reference"
              name="reference"
              placeholder="Document or incident ID"
              required
            />
          </div>
          <div className="field field-span">
            <label htmlFor="movement-reason">Reason</label>
            <textarea
              className="textarea"
              id="movement-reason"
              name="reason"
              required
              rows={3}
            />
          </div>
        </div>
        <button
          className="button"
          disabled={pending || !selected}
          type="submit"
        >
          {pending ? "Recording…" : "Record movement"}
        </button>
      </form>
    </div>
  );
}
