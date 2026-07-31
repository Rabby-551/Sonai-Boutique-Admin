export function AuditFilters({
  defaults,
}: {
  defaults: { query?: string; module?: string; from?: string; to?: string };
}) {
  return (
    <form className="filter-panel" method="get">
      <div className="field compact field-span">
        <label htmlFor="audit-query">Search</label>
        <input
          className="input"
          id="audit-query"
          name="query"
          defaultValue={defaults.query}
        />
      </div>
      <div className="field compact">
        <label htmlFor="audit-module">Module</label>
        <select
          className="select"
          id="audit-module"
          name="module"
          defaultValue={defaults.module ?? "all"}
        >
          <option value="all">All modules</option>
          {[
            "system",
            "staff",
            "users",
            "roles",
            "attendance",
            "payroll",
            "campaigns",
            "settings",
          ].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>
      <div className="field compact">
        <label htmlFor="audit-from">From</label>
        <input
          className="input"
          id="audit-from"
          name="from"
          type="date"
          defaultValue={defaults.from}
        />
      </div>
      <div className="field compact">
        <label htmlFor="audit-to">To</label>
        <input
          className="input"
          id="audit-to"
          name="to"
          type="date"
          defaultValue={defaults.to}
        />
      </div>
      <div className="filter-actions">
        <button className="button">Apply</button>
      </div>
    </form>
  );
}
