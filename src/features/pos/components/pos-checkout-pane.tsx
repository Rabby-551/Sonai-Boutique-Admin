"use client";

import { formatMoney } from "@/lib/formatting";
import type { PosBootstrap } from "../data/repository";
import { CustomerPanel } from "./customer-panel";
import { PosCartSection } from "./pos-cart-section";
import { PosDiscountSection } from "./pos-discount-section";
import { TenderEditor } from "./tender-editor";
import type { PosWorkspaceModel } from "./use-pos-workspace";

export function PosCheckoutPane({
  bootstrap,
  model,
}: {
  bootstrap: PosBootstrap;
  model: PosWorkspaceModel;
}) {
  const {
    campaignDiscount,
    cart,
    customer,
    manualMinor,
    payload,
    saleAction,
    salePending,
    saleState,
    setCustomer,
    setTenders,
    subtotal,
    tenders,
    total,
  } = model;
  return (
    <aside className="pos-checkout-pane">
      <PosCartSection model={model} />
      <CustomerPanel onChange={setCustomer} value={customer} />
      <PosDiscountSection model={model} />
      <TenderEditor
        onChange={setTenders}
        providers={bootstrap.providers}
        tenders={tenders}
        totalMinor={total}
      />
      <section className="pos-total-card">
        <div>
          <span>Subtotal</span>
          <strong>{formatMoney(subtotal)}</strong>
        </div>
        <div>
          <span>Discounts</span>
          <strong>− {formatMoney(campaignDiscount + manualMinor)}</strong>
        </div>
        <div className="pos-grand-total">
          <span>Total</span>
          <strong>{formatMoney(total)}</strong>
        </div>
      </section>
      {saleState.message && (
        <div className={`form-message ${saleState.status}`} role="status">
          {saleState.message}
        </div>
      )}
      <form action={saleAction}>
        <input name="payload" type="hidden" value={JSON.stringify(payload)} />
        <button
          className="button pos-pay-button"
          disabled={salePending || !cart.length || total <= 0}
          type="submit"
        >
          {salePending ? "Completing…" : `Accept ${formatMoney(total)}`}
        </button>
      </form>
    </aside>
  );
}
