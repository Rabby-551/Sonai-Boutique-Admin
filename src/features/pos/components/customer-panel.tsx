"use client";
import { useActionState, useEffect } from "react";
import { lookupPosCustomerAction } from "../server/actions";
import { initialPosActionState } from "../server/action-state";

export interface SelectedCustomer {
  id: string | null;
  name: string;
  phone: string;
}

export function CustomerPanel({
  value,
  onChange,
}: {
  value: SelectedCustomer;
  onChange: (value: SelectedCustomer) => void;
}) {
  const [state, action, pending] = useActionState(
    lookupPosCustomerAction,
    initialPosActionState,
  );
  useEffect(() => {
    if (state.customer) onChange(state.customer);
  }, [state.customer, onChange]);
  return (
    <section className="pos-section">
      <div className="pos-section-heading">
        <span className="eyebrow">Customer</span>
        <button
          className="text-button"
          onClick={() => onChange({ id: null, name: "", phone: "" })}
          type="button"
        >
          Walk-in
        </button>
      </div>
      <form action={action} className="pos-customer-search">
        <input
          className="input"
          name="phone"
          onChange={(event) =>
            onChange({ ...value, id: null, phone: event.target.value })
          }
          placeholder="01XXXXXXXXX"
          value={value.phone}
        />
        <button
          className="button secondary small"
          disabled={pending}
          type="submit"
        >
          Find
        </button>
      </form>
      {state.message && (
        <small className={state.status === "error" ? "danger-text" : "muted"}>
          {state.message}
        </small>
      )}
      {value.phone && !value.id && (
        <label className="field">
          <span>Name for new customer</span>
          <input
            className="input"
            onChange={(event) =>
              onChange({ ...value, name: event.target.value })
            }
            placeholder="Customer name"
            value={value.name}
          />
        </label>
      )}
      {value.id && (
        <div className="pos-customer-chip">
          <strong>{value.name}</strong>
          <span>{value.phone}</span>
        </div>
      )}
    </section>
  );
}
