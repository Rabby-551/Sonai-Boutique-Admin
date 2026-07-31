"use client";
import { useActionState } from "react";
import type { Supplier } from "../schemas/procurement";
import { createSupplierAction, updateSupplierAction } from "../server/actions";
import { initialProcurementActionState } from "../server/action-state";
import { SupplierVariantEditor } from "./supplier-variant-editor";
import type { VariantOption } from "./variant-options";
export function SupplierForm({
  supplier,
  options,
}: {
  supplier?: Supplier;
  options: readonly VariantOption[];
}) {
  const action = supplier
    ? updateSupplierAction.bind(null, supplier.id)
    : createSupplierAction;
  const [state, formAction, pending] = useActionState(
    action,
    initialProcurementActionState,
  );
  return (
    <form action={formAction} className="catalog-form">
      {supplier && (
        <input type="hidden" name="expectedVersion" value={supplier.version} />
      )}
      <section className="form-section">
        <div className="form-grid three">
          <div className="field">
            <label htmlFor="name">Supplier name</label>
            <input
              className="input"
              id="name"
              name="name"
              required
              defaultValue={supplier?.name}
            />
          </div>
          <div className="field">
            <label htmlFor="contactName">Contact</label>
            <input
              className="input"
              id="contactName"
              name="contactName"
              required
              defaultValue={supplier?.contactName}
            />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone</label>
            <input
              className="input"
              id="phone"
              name="phone"
              required
              defaultValue={supplier?.phone}
            />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              className="input"
              id="email"
              name="email"
              type="email"
              defaultValue={supplier?.email ?? ""}
            />
          </div>
          <div className="field">
            <label htmlFor="paymentTerms">Payment terms</label>
            <input
              className="input"
              id="paymentTerms"
              name="paymentTerms"
              required
              defaultValue={supplier?.paymentTerms ?? "30 days"}
            />
          </div>
          <div className="field">
            <label htmlFor="leadTimeDays">Default lead time</label>
            <input
              className="input"
              id="leadTimeDays"
              name="leadTimeDays"
              type="number"
              min="0"
              defaultValue={supplier?.leadTimeDays ?? 14}
            />
          </div>
          <div className="field full">
            <label htmlFor="address">Address</label>
            <textarea
              className="textarea"
              id="address"
              name="address"
              required
              rows={3}
              defaultValue={supplier?.address}
            />
          </div>
          <div className="field full">
            <label htmlFor="notes">Notes</label>
            <textarea
              className="textarea"
              id="notes"
              name="notes"
              rows={3}
              defaultValue={supplier?.notes}
            />
          </div>
        </div>
        <SupplierVariantEditor options={options} initial={supplier?.variants} />
      </section>
      {state.message && (
        <p className={`form-message ${state.status}`} role="status">
          {state.message}
        </p>
      )}
      <button className="button" disabled={pending}>
        {supplier ? "Save supplier" : "Create supplier"}
      </button>
    </form>
  );
}
