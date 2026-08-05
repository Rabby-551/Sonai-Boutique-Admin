"use client";

import { formatMoney } from "@/lib/formatting";
import type { PosWorkspaceModel } from "./use-pos-workspace";

export function PosDiscountSection({ model }: { model: PosWorkspaceModel }) {
  const {
    approvalAction,
    approvalId,
    approvalPending,
    approvalState,
    campaignDiscount,
    discountReason,
    fingerprint,
    manualDiscount,
    manualMinor,
    setApprovalId,
    setDiscountReason,
    setManualDiscount,
  } = model;
  return (
    <section className="pos-section">
      <div className="pos-section-heading">
        <span className="eyebrow">Discounts</span>
        <span>
          {campaignDiscount
            ? `${formatMoney(campaignDiscount)} campaign`
            : "No campaign"}
        </span>
      </div>
      <div className="pos-discount-row">
        <input
          className="input"
          min="0"
          onChange={(event) => {
            setManualDiscount(event.target.value);
            setApprovalId("");
          }}
          placeholder="Manual BDT"
          step="0.01"
          type="number"
          value={manualDiscount}
        />
        <input
          className="input"
          onChange={(event) => {
            setDiscountReason(event.target.value);
            setApprovalId("");
          }}
          placeholder="Required reason"
          value={discountReason}
        />
      </div>
      {manualMinor > 0 && (
        <form action={approvalAction}>
          <input name="amount" type="hidden" value={manualDiscount} />
          <input name="reason" type="hidden" value={discountReason} />
          <input name="fingerprint" type="hidden" value={fingerprint} />
          <button
            className="button secondary small"
            disabled={approvalPending || discountReason.length < 3}
            type="submit"
          >
            Request manager approval
          </button>
          {approvalState.message && (
            <small className="muted">
              {approvalState.message}{" "}
              {approvalState.id && `ID: ${approvalState.id}`}
            </small>
          )}
        </form>
      )}
      <label className="field">
        <span>Approved request ID</span>
        <input
          className="input"
          disabled={!manualMinor}
          onChange={(event) => setApprovalId(event.target.value)}
          value={approvalId}
        />
      </label>
    </section>
  );
}
