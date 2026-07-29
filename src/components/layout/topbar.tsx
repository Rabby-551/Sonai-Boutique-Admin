import { Bell, ChevronDown } from "lucide-react";
import type { CurrentUser } from "@/lib/auth/session";

export function Topbar({ user }: { user: CurrentUser }) {
  return (
    <header className="topbar">
      <div>
        <span className="eyebrow">Operations workspace</span>
      </div>
      <div className="topbar-actions">
        <label>
          <span className="sr-only">Active branch</span>
          <select className="branch-select" defaultValue="all">
            <option value="all">All locations</option>
            <option>Banani</option>
            <option>Dhanmondi</option>
            <option>Online</option>
          </select>
        </label>
        <button className="button secondary" aria-label="Notifications">
          <Bell size={17} />
        </button>
        <button
          className="button secondary"
          aria-label={`Profile menu for ${user.name}`}
        >
          <span>{user.name.split(" ")[0]}</span>
          <ChevronDown size={15} />
        </button>
      </div>
    </header>
  );
}
