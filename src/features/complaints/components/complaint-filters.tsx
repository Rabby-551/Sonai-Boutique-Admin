export function ComplaintFilters({
  defaults,
}: {
  defaults: { query?: string; status?: string; priority?: string };
}) {
  return (
    <form className="filter-panel" method="get">
      <div className="field compact field-span">
        <label htmlFor="case-query">Search</label>
        <input
          className="input"
          id="case-query"
          name="query"
          defaultValue={defaults.query}
          placeholder="Case, customer, or description"
        />
      </div>
      <div className="field compact">
        <label htmlFor="case-status">Status</label>
        <select
          className="select"
          id="case-status"
          name="status"
          defaultValue={defaults.status ?? "all"}
        >
          <option value="all">All</option>
          {["open", "acknowledged", "in_progress", "resolved", "closed"].map(
            (item) => (
              <option key={item}>{item}</option>
            ),
          )}
        </select>
      </div>
      <div className="field compact">
        <label htmlFor="case-priority">Priority</label>
        <select
          className="select"
          id="case-priority"
          name="priority"
          defaultValue={defaults.priority ?? "all"}
        >
          <option value="all">All</option>
          {["low", "normal", "high", "urgent"].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>
      <button className="button">Apply</button>
    </form>
  );
}
