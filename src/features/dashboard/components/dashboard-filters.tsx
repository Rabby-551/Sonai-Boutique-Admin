import Link from "next/link";
import type { DashboardQuery } from "../schemas/dashboard-schema";
export function DashboardFilters({ query }: { query: DashboardQuery }) {
  return (
    <form className="filter-panel dashboard-filter" method="get">
      <div className="field compact">
        <label htmlFor="dashboard-branch">Location</label>
        <select
          className="select"
          defaultValue={query.branch}
          id="dashboard-branch"
          name="branch"
        >
          <option value="all">All locations</option>
          <option value="banani">Banani</option>
          <option value="dhanmondi">Dhanmondi</option>
          <option value="online">Online</option>
        </select>
      </div>
      <div className="field compact">
        <label htmlFor="dashboard-channel">Channel</label>
        <select
          className="select"
          defaultValue={query.channel}
          id="dashboard-channel"
          name="channel"
        >
          <option value="all">All channels</option>
          <option value="branch">Branches</option>
          <option value="online">Online</option>
        </select>
      </div>
      <div className="field compact">
        <label htmlFor="dashboard-range">Date range</label>
        <select
          className="select"
          defaultValue={query.range}
          id="dashboard-range"
          name="range"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>
      <div className="filter-actions">
        <button className="button" type="submit">
          Update dashboard
        </button>
        <Link className="button secondary" href="/dashboard">
          Reset
        </Link>
      </div>
    </form>
  );
}
