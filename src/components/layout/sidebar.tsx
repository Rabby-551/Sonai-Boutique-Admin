"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { findNavigationItem, navigationForRole } from "@/lib/navigation";
import type { Role } from "@/lib/auth/permissions";
import { useAdminLocale } from "@/components/i18n/admin-locale-provider";

interface SidebarProps {
  role: Role;
  collapsed?: boolean;
  mobile?: boolean;
  onNavigate?: () => void;
  onToggle?: () => void;
}

export function Sidebar({
  role,
  collapsed = false,
  mobile = false,
  onNavigate,
  onToggle,
}: SidebarProps) {
  const pathname = usePathname();
  const { locale, dictionary } = useAdminLocale();
  const groups = navigationForRole(role, locale);
  const current = findNavigationItem(pathname, role, locale);

  return (
    <aside
      className={`sidebar ${mobile ? "mobile-sidebar" : "desktop-sidebar"}`}
      aria-label={dictionary.shell.primaryNavigation}
    >
      <div className="brand">
        <Image
          alt={dictionary.shell.brandAlt}
          className="brand-mark"
          height={64}
          priority
          src="/assets/sonai/logos/sonai-logo-transparent.png"
          width={64}
        />
        <div className="brand-copy" aria-hidden="true">
          <Image
            alt=""
            className="brand-wordmark"
            height={locale === "bn" ? 75 : 47}
            src={`/assets/sonai/logos/sonai-wordmark-${locale}.png`}
            width={132}
          />
          <small lang={locale}>{dictionary.shell.boutique}</small>
        </div>
        {mobile ? (
          <button
            className="sidebar-icon-button drawer-close"
            onClick={onNavigate}
            aria-label={dictionary.shell.closeNavigation}
          >
            <X aria-hidden size={18} />
          </button>
        ) : null}
      </div>
      <nav className="primary-nav">
        {groups.map((group) => (
          <section
            className="nav-group"
            key={group.id}
            aria-labelledby={`nav-${group.id}`}
          >
            <h2 className="nav-section" id={`nav-${group.id}`}>
              {group.label}
            </h2>
            {group.items.map((item) => {
              const { href, label, icon: Icon, description, id } = item;
              const active = current?.id === item.id;
              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  aria-label={collapsed ? label : undefined}
                  className={`nav-link${active ? " active" : ""}`}
                  href={href}
                  key={id}
                  onClick={onNavigate}
                  title={collapsed ? `${label} — ${description}` : undefined}
                >
                  <Icon aria-hidden size={18} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </section>
        ))}
      </nav>
      {!mobile ? (
        <button
          className="sidebar-collapse"
          onClick={onToggle}
          aria-label={
            collapsed
              ? dictionary.shell.expandSidebar
              : dictionary.shell.collapseSidebar
          }
        >
          {collapsed ? (
            <ChevronRight aria-hidden size={17} />
          ) : (
            <ChevronLeft aria-hidden size={17} />
          )}
          <span>{dictionary.shell.collapseSidebar}</span>
        </button>
      ) : null}
    </aside>
  );
}
