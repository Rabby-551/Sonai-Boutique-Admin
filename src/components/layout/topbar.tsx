"use client";

import { Bell, ChevronDown, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import type { RefObject } from "react";
import type { CurrentUser } from "@/lib/auth/session";
import { findNavigationItem } from "@/lib/navigation";
import { QuickNavigation } from "./quick-navigation";
import { signOutAction } from "@/app/(auth)/login/actions";

interface TopbarProps {
  user: CurrentUser;
  onOpenNavigation: () => void;
  menuButtonRef: RefObject<HTMLButtonElement | null>;
}

export function Topbar({ user, onOpenNavigation, menuButtonRef }: TopbarProps) {
  const pathname = usePathname();
  const current = findNavigationItem(pathname, user.role);

  return (
    <header className="topbar">
      <div className="topbar-context">
        <button
          aria-label="Open navigation"
          className="topbar-icon-button mobile-menu-button"
          onClick={onOpenNavigation}
          ref={menuButtonRef}
        >
          <Menu aria-hidden size={20} />
        </button>
        <div className="topbar-title">
          <span className="eyebrow">Operations workspace</span>
          <strong>{current?.label ?? "Sonai Admin"}</strong>
        </div>
      </div>
      <div className="topbar-actions">
        <QuickNavigation role={user.role} />
        <label className="branch-control">
          <span className="sr-only">Active branch</span>
          <select
            className="branch-select"
            defaultValue={user.branchId ?? "all"}
          >
            <option value="all">All locations</option>
            <option value="rupnagar">Rupnagar</option>
            <option value="mirpur-shopping-center">Mirpur 2</option>
            <option value="online">Online</option>
          </select>
        </label>
        <button
          className="topbar-icon-button"
          aria-label="Notifications, none unread"
          title="No unread notifications"
        >
          <Bell aria-hidden size={18} />
        </button>
        <details className="profile-menu">
          <summary aria-label={`Profile menu for ${user.name}`}>
            <span className="profile-avatar" aria-hidden>
              {user.name.slice(0, 1)}
            </span>
            <span className="profile-name">{user.name.split(" ")[0]}</span>
            <ChevronDown aria-hidden size={15} />
          </summary>
          <div className="profile-popover">
            <strong>{user.name}</strong>
            <span>{user.role} access</span>
            <form action={signOutAction}>
              <button className="profile-sign-out" type="submit">
                Sign out
              </button>
            </form>
          </div>
        </details>
      </div>
    </header>
  );
}
