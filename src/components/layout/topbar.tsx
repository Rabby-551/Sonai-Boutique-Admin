"use client";

import { Bell, ChevronDown, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import type { RefObject } from "react";
import type { CurrentUser } from "@/lib/auth/session";
import { findNavigationItem } from "@/lib/navigation";
import { QuickNavigation } from "./quick-navigation";
import { signOutAction } from "@/app/(auth)/login/actions";
import { useAdminLocale } from "@/components/i18n/admin-locale-provider";
import { AdminLocaleSwitcher } from "@/components/i18n/admin-locale-switcher";

interface TopbarProps {
  user: CurrentUser;
  onOpenNavigation: () => void;
  menuButtonRef: RefObject<HTMLButtonElement | null>;
}

export function Topbar({ user, onOpenNavigation, menuButtonRef }: TopbarProps) {
  const pathname = usePathname();
  const { locale, dictionary } = useAdminLocale();
  const current = findNavigationItem(pathname, user.role, locale);

  return (
    <header className="topbar">
      <div className="topbar-context">
        <button
          aria-label={dictionary.shell.openNavigation}
          className="topbar-icon-button mobile-menu-button"
          onClick={onOpenNavigation}
          ref={menuButtonRef}
        >
          <Menu aria-hidden size={20} />
        </button>
        <div className="topbar-title">
          <span className="eyebrow">
            {dictionary.shell.operationsWorkspace}
          </span>
          <strong>{current?.label ?? dictionary.shell.adminFallback}</strong>
        </div>
      </div>
      <div className="topbar-actions">
        <QuickNavigation role={user.role} />
        <AdminLocaleSwitcher />
        <label className="branch-control">
          <span className="sr-only">{dictionary.shell.activeBranch}</span>
          <select
            className="branch-select"
            defaultValue={user.branchId ?? "all"}
          >
            <option value="all">{dictionary.shell.allLocations}</option>
            <option value="rupnagar">
              {locale === "bn" ? "রূপনগর" : "Rupnagar"}
            </option>
            <option value="mirpur-shopping-center">
              {locale === "bn" ? "মিরপুর ২" : "Mirpur 2"}
            </option>
            <option value="online">{dictionary.shell.online}</option>
          </select>
        </label>
        <button
          className="topbar-icon-button"
          aria-label={dictionary.shell.notifications}
          title={dictionary.shell.noUnreadNotifications}
        >
          <Bell aria-hidden size={18} />
        </button>
        <details className="profile-menu">
          <summary aria-label={`${dictionary.shell.profileMenu} ${user.name}`}>
            <span className="profile-avatar" aria-hidden>
              {user.name.slice(0, 1)}
            </span>
            <span className="profile-name">{user.name.split(" ")[0]}</span>
            <ChevronDown aria-hidden size={15} />
          </summary>
          <div className="profile-popover">
            <strong>{user.name}</strong>
            <span>
              {user.role} {dictionary.shell.access}
            </span>
            <form action={signOutAction}>
              <button className="profile-sign-out" type="submit">
                {dictionary.shell.signOut}
              </button>
            </form>
          </div>
        </details>
      </div>
    </header>
  );
}
