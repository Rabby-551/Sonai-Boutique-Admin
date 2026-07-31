import { CheckCircle2 } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import type { RouteReadiness as RouteReadinessItem } from "../schemas/demo";

export function RouteReadiness({ groups }: { groups: RouteReadinessItem[] }) {
  return (
    <section aria-labelledby="route-readiness-title">
      <div className="section-title">
        <div>
          <div className="eyebrow">Route inventory</div>
          <h2 id="route-readiness-title">Mock design readiness</h2>
        </div>
      </div>
      <div className="acceptance-grid">
        {groups.map((group) => (
          <article className="card readiness-card" key={group.id}>
            <div className="demo-card-heading">
              <span className="route-count">{group.routeCount}</span>
              <StatusBadge status={group.status} />
            </div>
            <div>
              <h3>{group.group}</h3>
              <p>Evidence owner: {group.owner}</p>
            </div>
            <ul className="plain-list positive">
              {group.evidence.map((item) => (
                <li key={item}>
                  <CheckCircle2 aria-hidden size={15} />
                  {item}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
