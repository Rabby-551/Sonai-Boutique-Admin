"use client";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createCountAction } from "../server/actions";
import { initialInventoryActionState } from "../server/action-state";
import type { InventoryLocation } from "../schemas/inventory";

export function CountCreateForm({
  locations,
}: {
  locations: readonly InventoryLocation[];
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    createCountAction,
    initialInventoryActionState,
  );
  useEffect(() => {
    if (state.status === "success" && state.id)
      router.push(`/stock-counts/${state.id}`);
  }, [router, state]);
  return (
    <form action={action} className="catalog-form">
      <div className="form-grid">
        <div className="field">
          <label htmlFor="count-location">Location</label>
          <select className="select" id="count-location" name="locationId">
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="count-date">Scheduled date</label>
          <input
            className="input"
            defaultValue={new Date().toISOString().slice(0, 10)}
            id="count-date"
            name="scheduledDate"
            type="date"
          />
        </div>
        <div className="field field-span">
          <label htmlFor="count-scope">Scope</label>
          <input
            className="input"
            defaultValue="Full location"
            id="count-scope"
            name="scope"
          />
        </div>
      </div>
      {state.message && (
        <div className={`form-message ${state.status}`} role="status">
          {state.message}
        </div>
      )}
      <button className="button" disabled={pending} type="submit">
        Schedule count
      </button>
    </form>
  );
}
