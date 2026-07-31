const statuses = [
  "draft",
  "submitted",
  "approved",
  "rejected",
  "supplier_confirmed",
  "in_transit",
  "partially_received",
  "received",
  "closed",
  "cancelled",
];

export function PurchaseOrderFilters({
  query,
  status,
}: {
  query?: string;
  status?: string;
}) {
  return (
    <form className="filter-panel" method="get">
      <div className="field compact field-span">
        <label htmlFor="po-query">Search</label>
        <input
          className="input"
          id="po-query"
          name="query"
          defaultValue={query}
          placeholder="PO number or reference"
        />
      </div>
      <div className="field compact">
        <label htmlFor="po-status">Status</label>
        <select
          className="select"
          id="po-status"
          name="status"
          defaultValue={status ?? "all"}
        >
          <option value="all">All</option>
          {statuses.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>
      <button className="button">Apply</button>
    </form>
  );
}
