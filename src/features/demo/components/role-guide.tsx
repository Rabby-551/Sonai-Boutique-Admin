import Link from "next/link";
import { Check, Minus } from "lucide-react";
import type { DemoRoleGuide } from "../schemas/demo";

export function RoleGuide({ roles }: { roles: DemoRoleGuide[] }) {
  return (
    <section aria-labelledby="role-guide-title">
      <div className="section-title">
        <div>
          <div className="eyebrow">Four-role review</div>
          <h2 id="role-guide-title">Role walkthrough guide</h2>
        </div>
      </div>
      <div className="demo-role-grid">
        {roles.map((guide) => (
          <article className="card demo-role" key={guide.role}>
            <div>
              <span className="eyebrow">{guide.role}</span>
              <h3>{guide.label}</h3>
            </div>
            <p>{guide.scope}</p>
            <h4>Can demonstrate</h4>
            <ul className="plain-list positive">
              {guide.can.map((item) => (
                <li key={item}>
                  <Check aria-hidden size={15} />
                  {item}
                </li>
              ))}
            </ul>
            <h4>Restricted</h4>
            <ul className="plain-list muted-list">
              {guide.cannot.map((item) => (
                <li key={item}>
                  <Minus aria-hidden size={15} />
                  {item}
                </li>
              ))}
            </ul>
            <Link className="button secondary" href={guide.startRoute}>
              Open starting view
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
