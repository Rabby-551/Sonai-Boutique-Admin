"use client";
import { useActionState } from "react";
import type { BusinessSettings } from "../schemas/administration";
import { updateSettingsAction } from "../server/actions";
import { initialAdministrationActionState } from "../server/action-state";
export function SettingsForm({
  settings,
  locations,
  editable,
}: {
  settings: BusinessSettings;
  locations: { id: string; name: string }[];
  editable: boolean;
}) {
  const [state, action, pending] = useActionState(
    updateSettingsAction,
    initialAdministrationActionState,
  );
  return (
    <form action={action} className="catalog-form">
      <input type="hidden" name="expectedVersion" value={settings.version} />
      <fieldset className="settings-fieldset" disabled={!editable}>
        <section className="form-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Global configuration</span>
              <h2>Business settings</h2>
            </div>
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="businessName">Business name</label>
              <input
                className="input"
                id="businessName"
                name="businessName"
                required
                defaultValue={settings.businessName}
              />
            </div>
            <div className="field">
              <label htmlFor="supportEmail">Support email</label>
              <input
                className="input"
                id="supportEmail"
                name="supportEmail"
                type="email"
                required
                defaultValue={settings.supportEmail}
              />
            </div>
            <div className="field">
              <label htmlFor="defaultLocationId">Default location</label>
              <select
                className="select"
                id="defaultLocationId"
                name="defaultLocationId"
                defaultValue={settings.defaultLocationId}
              >
                {locations.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="deliveryCharge">Delivery charge (BDT)</label>
              <input
                className="input"
                id="deliveryCharge"
                name="deliveryCharge"
                type="number"
                min="0"
                defaultValue={settings.deliveryChargeMinor / 100}
              />
            </div>
            <div className="field">
              <label htmlFor="defaultLowStockThreshold">
                Default low-stock threshold
              </label>
              <input
                className="input"
                id="defaultLowStockThreshold"
                name="defaultLowStockThreshold"
                type="number"
                min="0"
                defaultValue={settings.defaultLowStockThreshold}
              />
            </div>
            <div className="field">
              <label htmlFor="payrollWorkingDays">Payroll working days</label>
              <input
                className="input"
                id="payrollWorkingDays"
                name="payrollWorkingDays"
                type="number"
                min="1"
                max="31"
                defaultValue={settings.payrollWorkingDays}
              />
            </div>
            <div className="field">
              <label>Timezone</label>
              <input className="input" value="Asia/Dhaka" disabled />
            </div>
            <div className="field">
              <label>Currency</label>
              <input className="input" value="BDT" disabled />
            </div>
          </div>
        </section>
        {state.message && (
          <p className={`form-message ${state.status}`} role="status">
            {state.message}
          </p>
        )}
        <div className="form-footer">
          {editable ? (
            <button className="button" disabled={pending}>
              Save settings
            </button>
          ) : (
            <span className="muted">Settings are read only for your role.</span>
          )}
        </div>
      </fieldset>
    </form>
  );
}
