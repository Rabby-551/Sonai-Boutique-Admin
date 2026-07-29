import Link from "next/link";
import { navigation } from "@/lib/navigation";
import { can, type Role } from "@/lib/auth/permissions";

export function Sidebar({ role }: { role: Role }) {
  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="brand">
        <div className="brand-mark">S</div>
        <div>
          <strong>Shonai</strong>
          <small>Boutique admin</small>
        </div>
      </div>
      <nav>
        {navigation.map((group) => {
          const items = group.items.filter((item) =>
            can(role, item.permission),
          );
          if (!items.length) return null;
          return (
            <div key={group.label}>
              <div className="nav-section">{group.label}</div>
              {items.map(({ href, label, icon: Icon }) => (
                <Link
                  aria-label={label}
                  className="nav-link"
                  href={href}
                  key={href}
                >
                  <Icon aria-hidden size={18} />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
