"use client";
import { useActionState } from "react";
import type { LoyaltySettings } from "../schemas/customers";
import { updateLoyaltySettingsAction } from "../server/actions";
import { initialCustomerActionState } from "../server/action-state";

export function LoyaltySettingsForm({
  settings,
}: {
  settings: LoyaltySettings;
}) {
  const [state, action, pending] = useActionState(
    updateLoyaltySettingsAction,
    initialCustomerActionState,
  );
  return (
    <form action={action} className="card form-card">
      <input type="hidden" name="expectedVersion" value={settings.version} />
      <div className="form-grid">
        <div className="field">
          <label htmlFor="spend">Spend for each point (BDT)</label>
          <input
            className="input"
            id="spend"
            name="spend"
            type="number"
            min="1"
            defaultValue={settings.spendPerPointMinor / 100}
          />
        </div>
        <div className="field">
          <label htmlFor="points">Points awarded</label>
          <input
            className="input"
            id="points"
            name="points"
            type="number"
            min="1"
            defaultValue={settings.pointsPerUnit}
          />
        </div>
      </div>
      {state.message && (
        <p className={`form-message ${state.status}`} role="status">
          {state.message}
        </p>
      )}
      <button className="button" disabled={pending}>
        Save loyalty settings
      </button>
    </form>
  );
}
