export function StaffFilters({
  defaults,
  locations,
}: {
  defaults: { query?: string; status?: string; locationId?: string };
  locations: { id: string; name: string }[];
}) {
  return (
    <form className="filter-panel" method="get">
      <div className="field compact field-span">
        <label htmlFor="staff-query">Search</label>
        <input
          className="input"
          id="staff-query"
          name="query"
          defaultValue={defaults.query}
          placeholder="Name, employee code, phone"
        />
      </div>
      <div className="field compact">
        <label htmlFor="staff-status">Status</label>
        <select
          className="select"
          id="staff-status"
          name="status"
          defaultValue={defaults.status ?? "all"}
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="on_leave">On leave</option>
          <option value="terminated">Terminated</option>
        </select>
      </div>
      <div className="field compact">
        <label htmlFor="staff-location">Branch</label>
        <select
          className="select"
          id="staff-location"
          name="locationId"
          defaultValue={defaults.locationId ?? "all"}
        >
          <option value="all">All branches</option>
          {locations.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
      <div className="filter-actions">
        <button className="button">Apply</button>
      </div>
    </form>
  );
}
