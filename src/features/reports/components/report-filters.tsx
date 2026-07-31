import type { ReportQuery } from "../schemas/reports";
export function ReportFilters({
  defaults,
  locations,
}: {
  defaults: ReportQuery;
  locations: { id: string; name: string }[];
}) {
  return (
    <form className="filter-panel" method="get">
      <div className="field compact">
        <label htmlFor="report-type">Report</label>
        <select
          className="select"
          id="report-type"
          name="type"
          defaultValue={defaults.type}
        >
          {[
            "sales",
            "profit",
            "inventory",
            "campaigns",
            "procurement",
            "payroll",
          ].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>
      <div className="field compact">
        <label htmlFor="report-from">From</label>
        <input
          className="input"
          id="report-from"
          name="from"
          type="date"
          defaultValue={defaults.from}
        />
      </div>
      <div className="field compact">
        <label htmlFor="report-to">To</label>
        <input
          className="input"
          id="report-to"
          name="to"
          type="date"
          defaultValue={defaults.to}
        />
      </div>
      <div className="field compact">
        <label htmlFor="report-location">Location</label>
        <select
          className="select"
          id="report-location"
          name="locationId"
          defaultValue={defaults.locationId ?? "all"}
        >
          <option value="all">All locations</option>
          {locations.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
      <div className="field compact">
        <label htmlFor="report-channel">Channel</label>
        <select
          className="select"
          id="report-channel"
          name="channel"
          defaultValue={defaults.channel}
        >
          <option value="all">All channels</option>
          {["website", "whatsapp", "messenger", "phone", "branch"].map(
            (item) => (
              <option key={item}>{item}</option>
            ),
          )}
        </select>
      </div>
      <div className="filter-actions">
        <button className="button">Run report</button>
      </div>
    </form>
  );
}
