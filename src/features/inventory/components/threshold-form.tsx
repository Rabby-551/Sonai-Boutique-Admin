"use client";
import { useActionState, useState } from "react";
import { setThresholdAction } from "../server/actions";
import { initialInventoryActionState } from "../server/action-state";
import type {
  InventoryLocation,
  InventoryRow,
  LocationId,
} from "../schemas/inventory";

export function ThresholdForm({
  row,
  locations,
}: {
  row: InventoryRow;
  locations: readonly InventoryLocation[];
}) {
  const [state, action, pending] = useActionState(
    setThresholdAction,
    initialInventoryActionState,
  );
  const [locationId, setLocationId] = useState<LocationId>(
    locations[0]?.id ?? "loc-online",
  );
  return (
    <section className="card detail-panel">
      <h2>Location threshold override</h2>
      {state.message && (
        <div className={`form-message ${state.status}`} role="status">
          {state.message}
        </div>
      )}
      <form action={action} className="inline-controls">
        <input name="variantId" type="hidden" value={row.variantId} />
        <div className="field compact">
          <label htmlFor="threshold-location">Location</label>
          <select
            className="select"
            id="threshold-location"
            name="locationId"
            onChange={(event) =>
              setLocationId(event.target.value as LocationId)
            }
            value={locationId}
          >
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field compact">
          <label htmlFor="threshold-value">Override</label>
          <input
            className="input"
            id="threshold-value"
            min={0}
            name="threshold"
            placeholder={`Default ${row.threshold}`}
            type="number"
          />
        </div>
        <input
          name="expectedVersion"
          type="hidden"
          value={row.balanceVersions[locationId]}
        />
        <button className="button" disabled={pending} type="submit">
          Save threshold
        </button>
      </form>
      <p className="muted">Leave blank to use the catalog default.</p>
    </section>
  );
}
