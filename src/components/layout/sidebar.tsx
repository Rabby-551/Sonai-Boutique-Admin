"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { findNavigationItem, navigationForRole } from "@/lib/navigation";
import type { Role } from "@/lib/auth/permissions";

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
  const groups = navigationForRole(role);
  const current = findNavigationItem(pathname, role);

  return (
    <aside
      className={`sidebar ${mobile ? "mobile-sidebar" : "desktop-sidebar"}`}
      aria-label="Primary navigation"
    >
      <div className="brand">
        <Image
          alt="Sonai Boutique"
          className="brand-mark"
          height={44}
          priority
          src="/assets/sonai/logos/sonai-logo-transparent.png"
          width={44}
        />
        <div className="brand-copy">
          <strong>Sonai</strong>
          <small>Boutique operations</small>
        </div>
        {mobile ? (
          <button
            className="sidebar-icon-button drawer-close"
            onClick={onNavigate}
            aria-label="Close navigation"
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
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight aria-hidden size={17} />
          ) : (
            <ChevronLeft aria-hidden size={17} />
          )}
          <span>Collapse sidebar</span>
        </button>
      ) : null}
    </aside>
  );
}
