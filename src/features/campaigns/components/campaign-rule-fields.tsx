import type { Campaign } from "../schemas/campaigns";

export function CampaignRuleFields({ campaign }: { campaign?: Campaign }) {
  return (
    <>
      <div className="field">
        <label htmlFor="name">Name</label>
        <input
          className="input"
          id="name"
          name="name"
          required
          defaultValue={campaign?.name}
        />
      </div>
      <div className="field">
        <label htmlFor="scope">Scope</label>
        <select
          className="select"
          id="scope"
          name="scope"
          defaultValue={campaign?.scope ?? "store"}
        >
          <option value="store">Full store</option>
          <option value="category">Categories</option>
          <option value="product">Products</option>
          <option value="variant">Variants</option>
        </select>
      </div>
      <div className="field full">
        <label htmlFor="description">Description</label>
        <textarea
          className="textarea"
          id="description"
          name="description"
          rows={3}
          defaultValue={campaign?.description}
        />
      </div>
      <div className="field full">
        <label htmlFor="targetIds">Target IDs</label>
        <input
          className="input"
          id="targetIds"
          name="targetIds"
          defaultValue={campaign?.targetIds.join(", ")}
        />
        <small>
          Comma-separated category, product, or variant IDs. Leave empty for
          full store.
        </small>
      </div>
      <div className="field">
        <label htmlFor="percentageOff">Percentage off</label>
        <input
          className="input"
          id="percentageOff"
          name="percentageOff"
          type="number"
          min="1"
          max="40"
          required
          defaultValue={campaign?.percentageOff ?? 10}
        />
      </div>
      <div className="field">
        <label htmlFor="priority">Priority</label>
        <input
          className="input"
          id="priority"
          name="priority"
          type="number"
          min="0"
          max="100"
          defaultValue={campaign?.priority ?? 0}
        />
      </div>
    </>
  );
}
