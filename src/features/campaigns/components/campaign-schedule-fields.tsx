import type { Campaign } from "../schemas/campaigns";
const local = (iso?: string) => (iso ? iso.slice(0, 16) : "");
export function CampaignScheduleFields({ campaign }: { campaign?: Campaign }) {
  return (
    <>
      <div className="field">
        <label htmlFor="startsAt">Starts</label>
        <input
          className="input"
          id="startsAt"
          name="startsAt"
          type="datetime-local"
          required
          defaultValue={local(campaign?.startsAt)}
        />
      </div>
      <div className="field">
        <label htmlFor="endsAt">Ends</label>
        <input
          className="input"
          id="endsAt"
          name="endsAt"
          type="datetime-local"
          required
          defaultValue={local(campaign?.endsAt)}
        />
      </div>
      <div className="field">
        <label htmlFor="budget">Discount budget (BDT)</label>
        <input
          className="input"
          id="budget"
          name="budget"
          type="number"
          min="0"
          defaultValue={campaign?.budgetMinor ? campaign.budgetMinor / 100 : ""}
        />
      </div>
      <div className="field">
        <label htmlFor="usageLimit">Usage limit</label>
        <input
          className="input"
          id="usageLimit"
          name="usageLimit"
          type="number"
          min="1"
          defaultValue={campaign?.usageLimit ?? ""}
        />
      </div>
      <div className="field">
        <label htmlFor="estimatedCost">Estimated campaign cost (BDT)</label>
        <input
          className="input"
          id="estimatedCost"
          name="estimatedCost"
          type="number"
          min="0"
          defaultValue={
            campaign?.estimatedCostMinor ? campaign.estimatedCostMinor / 100 : 0
          }
        />
      </div>
    </>
  );
}
