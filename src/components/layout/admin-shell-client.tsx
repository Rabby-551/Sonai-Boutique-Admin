"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { CurrentUser } from "@/lib/auth/session";
import {
  AdminLocaleProvider,
  useAdminLocale,
} from "@/components/i18n/admin-locale-provider";
import { PageTransition } from "@/components/motion/page-transition";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function AdminShellClient({
  user,
  children,
}: {
  user: CurrentUser;
  children: ReactNode;
}) {
  return (
    <AdminLocaleProvider>
      <AdminShellFrame user={user}>{children}</AdminShellFrame>
    </AdminLocaleProvider>
  );
}

function AdminShellFrame({
  user,
  children,
}: {
  user: CurrentUser;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { locale, dictionary } = useAdminLocale();
  const drawerRef = useRef<HTMLDialogElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    drawerRef.current?.close();
  }, [pathname]);

  function toggleSidebar() {
    setCollapsed((value) => !value);
  }

  function openDrawer() {
    drawerRef.current?.showModal();
  }

  function closeDrawer() {
    drawerRef.current?.close();
    menuButtonRef.current?.focus();
  }

  return (
    <div
      className={`app-shell locale-${locale}${collapsed ? " sidebar-collapsed" : ""}`}
      lang={locale}
    >
      <a className="skip-link" href="#main-content">
        {dictionary.shell.skipToContent}
      </a>
      <Sidebar
        collapsed={collapsed}
        onToggle={toggleSidebar}
        role={user.role}
      />
      <dialog
        aria-label={dictionary.shell.navigationMenu}
        className="navigation-drawer"
        onClick={(event) =>
          event.target === event.currentTarget && closeDrawer()
        }
        onClose={() => menuButtonRef.current?.focus()}
        ref={drawerRef}
      >
        <Sidebar mobile onNavigate={closeDrawer} role={user.role} />
      </dialog>
      <div className="main">
        <Topbar
          menuButtonRef={menuButtonRef}
          onOpenNavigation={openDrawer}
          user={user}
        />
        <main className="content" id="main-content" tabIndex={-1}>
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
