export function CustomerFilters({
  defaults,
}: {
  defaults: { query?: string; status?: string; loyalty?: string };
}) {
  return (
    <form className="filter-panel" method="get">
      <div className="field compact field-span">
        <label htmlFor="customer-query">Search</label>
        <input
          className="input"
          id="customer-query"
          name="query"
          defaultValue={defaults.query}
          placeholder="Name, phone, or email"
        />
      </div>
      <div className="field compact">
        <label htmlFor="customer-status">Status</label>
        <select
          className="select"
          id="customer-status"
          name="status"
          defaultValue={defaults.status ?? "all"}
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </div>
      <div className="field compact">
        <label htmlFor="customer-loyalty">Loyalty</label>
        <select
          className="select"
          id="customer-loyalty"
          name="loyalty"
          defaultValue={defaults.loyalty ?? "all"}
        >
          <option value="all">All customers</option>
          <option value="enrolled">Enrolled</option>
          <option value="guest">Not enrolled</option>
        </select>
      </div>
      <div className="filter-actions">
        <button className="button" type="submit">
          Apply
        </button>
      </div>
    </form>
  );
}
