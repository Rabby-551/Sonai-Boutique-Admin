export function AttendanceFilters({
  defaults,
  staff,
}: {
  defaults: { month?: string; staffId?: string; status?: string };
  staff: { id: string; name: string }[];
}) {
  return (
    <form className="filter-panel" method="get">
      <div className="field compact">
        <label htmlFor="attendance-month">Month</label>
        <input
          className="input"
          id="attendance-month"
          name="month"
          type="month"
          defaultValue={defaults.month}
        />
      </div>
      <div className="field compact">
        <label htmlFor="attendance-staff">Staff</label>
        <select
          className="select"
          id="attendance-staff"
          name="staffId"
          defaultValue={defaults.staffId ?? ""}
        >
          <option value="">All staff</option>
          {staff.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
      <div className="field compact">
        <label htmlFor="attendance-status">Status</label>
        <select
          className="select"
          id="attendance-status"
          name="status"
          defaultValue={defaults.status ?? "all"}
        >
          <option value="all">All statuses</option>
          {["present", "absent", "leave", "weekend"].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>
      <div className="filter-actions">
        <button className="button">Apply</button>
      </div>
    </form>
  );
}
