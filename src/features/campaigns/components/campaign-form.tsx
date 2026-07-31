"use client";
import { useActionState } from "react";
import type { Campaign } from "../schemas/campaigns";
import { createCampaignAction, updateCampaignAction } from "../server/actions";
import { initialCampaignActionState } from "../server/action-state";
import { CampaignRuleFields } from "./campaign-rule-fields";
import { CampaignScheduleFields } from "./campaign-schedule-fields";
export function CampaignForm({ campaign }: { campaign?: Campaign }) {
  const action = campaign
    ? updateCampaignAction.bind(null, campaign.id)
    : createCampaignAction;
  const [state, formAction, pending] = useActionState(
    action,
    initialCampaignActionState,
  );
  return (
    <form action={formAction} className="catalog-form">
      <section className="form-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Discount rule</span>
            <h2>{campaign ? "Edit campaign" : "Campaign draft"}</h2>
          </div>
        </div>
        {campaign && (
          <input
            type="hidden"
            name="expectedVersion"
            value={campaign.version}
          />
        )}
        <div className="form-grid">
          <CampaignRuleFields campaign={campaign} />
          <CampaignScheduleFields campaign={campaign} />
        </div>
      </section>
      {state.message && (
        <p className={`form-message ${state.status}`} role="status">
          {state.message}
        </p>
      )}
      <div className="form-footer">
        <button className="button" disabled={pending}>
          {pending ? "Saving…" : campaign ? "Save campaign" : "Create draft"}
        </button>
      </div>
    </form>
  );
}
