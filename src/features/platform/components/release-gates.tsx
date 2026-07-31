import { CheckCircle2, CircleAlert, ShieldX } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import type { ReleaseGate } from "../schemas/platform";

const iconByStatus = {
  passed: CheckCircle2,
  review: CircleAlert,
  blocked: ShieldX,
};

export function ReleaseGates({ gates }: { gates: ReleaseGate[] }) {
  return (
    <section aria-labelledby="release-gates-title">
      <div className="section-title">
        <div>
          <div className="eyebrow">Go / no-go</div>
          <h2 id="release-gates-title">Release evidence</h2>
        </div>
      </div>
      <div className="gate-list">
        {gates.map((gate) => {
          const Icon = iconByStatus[gate.status];
          return (
            <article className="card gate-row" key={gate.id}>
              <span className={`gate-icon ${gate.status}`} aria-hidden>
                <Icon size={20} />
              </span>
              <div>
                <h3>{gate.label}</h3>
                <p>{gate.evidence}</p>
                <small>
                  Owner: {gate.owner} · Area: {gate.area}
                </small>
              </div>
              <StatusBadge status={gate.status} />
            </article>
          );
        })}
      </div>
    </section>
  );
}
