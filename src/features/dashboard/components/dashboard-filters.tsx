"use client";

import Link from "next/link";
import { useAdminLocale } from "@/components/i18n/admin-locale-provider";
import type { DashboardQuery } from "../schemas/dashboard-schema";
export function DashboardFilters({ query }: { query: DashboardQuery }) {
  const { locale, dictionary } = useAdminLocale();
  const copy = dictionary.dashboard;
  return (
    <form className="filter-panel dashboard-filter" method="get">
      <div className="field compact">
        <label htmlFor="dashboard-branch">{copy.location}</label>
        <select
          className="select"
          defaultValue={query.branch}
          id="dashboard-branch"
          name="branch"
        >
          <option value="all">{dictionary.shell.allLocations}</option>
          <option value="rupnagar">
            {locale === "bn" ? "রূপনগর" : "Rupnagar"}
          </option>
          <option value="mirpur-2">
            {locale === "bn" ? "মিরপুর ২" : "Mirpur 2"}
          </option>
          <option value="online">{dictionary.shell.online}</option>
        </select>
      </div>
      <div className="field compact">
        <label htmlFor="dashboard-channel">{copy.channel}</label>
        <select
          className="select"
          defaultValue={query.channel}
          id="dashboard-channel"
          name="channel"
        >
          <option value="all">{copy.allChannels}</option>
          <option value="branch">{copy.branches}</option>
          <option value="online">{dictionary.shell.online}</option>
        </select>
      </div>
      <div className="field compact">
        <label htmlFor="dashboard-range">{copy.dateRange}</label>
        <select
          className="select"
          defaultValue={query.range}
          id="dashboard-range"
          name="range"
        >
          <option value="7d">{copy.last7Days}</option>
          <option value="30d">{copy.last30Days}</option>
          <option value="90d">{copy.last90Days}</option>
        </select>
      </div>
      <div className="filter-actions">
        <button className="button" type="submit">
          {copy.updateDashboard}
        </button>
        <Link className="button secondary" href="/dashboard">
          {copy.reset}
        </Link>
      </div>
    </form>
  );
}
