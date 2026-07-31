import type { ReactNode } from "react";

export function TableShell({
  title,
  eyebrow,
  actions,
  children,
  className = "",
}: {
  title: string;
  eyebrow?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`card table-card table-shell ${className}`}>
      <div className="section-title table-shell-heading">
        <div>
          {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
          <h2>{title}</h2>
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
