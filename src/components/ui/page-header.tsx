import Link from "next/link";
import type { ReactNode } from "react";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
  actions?: ReactNode;
  breadcrumbs?: readonly Breadcrumb[];
  metadata?: ReactNode;
  compact?: boolean;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  actions,
  breadcrumbs,
  metadata,
  compact = false,
}: PageHeaderProps) {
  return (
    <header className={`page-heading${compact ? " compact" : ""}`}>
      <div className="page-heading-copy">
        {breadcrumbs?.length ? (
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            {breadcrumbs.map((item, index) => (
              <span key={`${item.label}-${index}`}>
                {item.href ? (
                  <Link href={item.href}>{item.label}</Link>
                ) : (
                  <span aria-current="page">{item.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : null}
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        {description ? <div className="subtitle">{description}</div> : null}
        {metadata ? <div className="page-metadata">{metadata}</div> : null}
      </div>
      {(actions ?? action) ? (
        <div className="page-actions">{actions ?? action}</div>
      ) : null}
    </header>
  );
}
