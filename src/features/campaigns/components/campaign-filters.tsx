export function CampaignFilters({
  defaults,
}: {
  defaults: { query?: string; status?: string };
}) {
  return (
    <form className="filter-panel" method="get">
      <div className="field compact field-span">
        <label htmlFor="campaign-query">Search</label>
        <input
          className="input"
          id="campaign-query"
          name="query"
          defaultValue={defaults.query}
          placeholder="Campaign name or code"
        />
      </div>
      <div className="field compact">
        <label htmlFor="campaign-status">Status</label>
        <select
          className="select"
          id="campaign-status"
          name="status"
          defaultValue={defaults.status ?? "all"}
        >
          <option value="all">All statuses</option>
          {["draft", "scheduled", "active", "paused", "ended", "archived"].map(
            (status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ),
          )}
        </select>
      </div>
      <div className="filter-actions">
        <button className="button">Apply</button>
      </div>
    </form>
  );
}
