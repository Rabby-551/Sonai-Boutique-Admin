"use client";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createTransferAction } from "../server/actions";
import { initialInventoryActionState } from "../server/action-state";
import type { InventoryLocation, InventoryRow } from "../schemas/inventory";
import { VariantLineEditor } from "./variant-line-editor";

export function TransferForm({
  rows,
  locations,
}: {
  rows: readonly InventoryRow[];
  locations: readonly InventoryLocation[];
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    createTransferAction,
    initialInventoryActionState,
  );
  useEffect(() => {
    if (state.status === "success" && state.id)
      router.push(`/inventory/transfers/${state.id}`);
  }, [router, state]);
  return (
    <form action={action} className="catalog-form">
      <div className="form-grid">
        <div className="field">
          <label htmlFor="transfer-source">Source</label>
          <select
            className="select"
            id="transfer-source"
            name="sourceLocationId"
          >
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="transfer-destination">Destination</label>
          <select
            className="select"
            defaultValue="mirpur-shopping-center"
            id="transfer-destination"
            name="destinationLocationId"
          >
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <VariantLineEditor rows={rows} legend="Transfer lines" />
      <div className="field">
        <label htmlFor="transfer-note">Transfer note</label>
        <textarea
          className="textarea"
          id="transfer-note"
          name="note"
          rows={3}
        />
      </div>
      {state.message && (
        <div className={`form-message ${state.status}`} role="status">
          {state.message}
        </div>
      )}
      <button className="button" disabled={pending} type="submit">
        {pending ? "Creating…" : "Create transfer draft"}
      </button>
    </form>
  );
}
