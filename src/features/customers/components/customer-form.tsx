"use client";
import { useActionState } from "react";
import type { Customer } from "../schemas/customers";
import { createCustomerAction, updateCustomerAction } from "../server/actions";
import { initialCustomerActionState } from "../server/action-state";

export function CustomerForm({ customer }: { customer?: Customer }) {
  const action = customer
    ? updateCustomerAction.bind(null, customer.id)
    : createCustomerAction;
  const [state, formAction, pending] = useActionState(
    action,
    initialCustomerActionState,
  );
  return (
    <form action={formAction} className="catalog-form">
      {customer && (
        <input type="hidden" name="expectedVersion" value={customer.version} />
      )}
      <section className="form-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Profile</span>
            <h2>Customer information</h2>
          </div>
        </div>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="name">Name</label>
            <input
              className="input"
              id="name"
              name="name"
              required
              minLength={2}
              defaultValue={customer?.name}
            />
          </div>
          <div className="field">
            <label htmlFor="phone">Bangladesh phone</label>
            <input
              className="input"
              id="phone"
              name="phone"
              required
              defaultValue={customer?.phone}
              placeholder="+8801XXXXXXXXX"
            />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              className="input"
              id="email"
              name="email"
              type="email"
              defaultValue={customer?.email ?? ""}
            />
          </div>
          <div className="field">
            <label htmlFor="birthday">Birthday</label>
            <input
              className="input"
              id="birthday"
              name="birthday"
              type="date"
              defaultValue={customer?.birthday ?? ""}
            />
          </div>
          <div className="field full">
            <label htmlFor="address">Primary address</label>
            <textarea
              className="textarea"
              id="address"
              name="address"
              rows={3}
              defaultValue={customer?.addresses[0]?.address ?? ""}
            />
          </div>
          <div className="field full">
            <label htmlFor="notes">Internal notes</label>
            <textarea
              className="textarea"
              id="notes"
              name="notes"
              rows={3}
              defaultValue={customer?.notes}
            />
          </div>
          <label className="inline-controls field-span">
            <input
              type="checkbox"
              name="enrollLoyalty"
              defaultChecked={Boolean(customer?.loyaltyEnrolledAt)}
              disabled={Boolean(customer?.loyaltyEnrolledAt)}
            />{" "}
            Loyalty consent recorded and customer enrolled
          </label>
        </div>
      </section>
      {state.message && (
        <p className={`form-message ${state.status}`} role="status">
          {state.message}
        </p>
      )}
      <div className="form-footer">
        <button className="button" disabled={pending}>
          {pending ? "Saving…" : customer ? "Save customer" : "Create customer"}
        </button>
      </div>
    </form>
  );
}
