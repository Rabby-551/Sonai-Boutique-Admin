import { AlarmClockCheck } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import type { SlaPolicy } from "../schemas/optimization";

export function SlaPolicies({ policies }: { policies: SlaPolicy[] }) {
  return (
    <section className="service-grid" aria-label="Complaint SLA policies">
      {policies.map((policy) => (
        <article className="card service-card" key={policy.id}>
          <div className="service-card-head">
            <span className="service-icon" aria-hidden>
              <AlarmClockCheck size={19} />
            </span>
            <StatusBadge status={policy.status} />
          </div>
          <h2>{policy.name}</h2>
          <p>{policy.appliesTo}</p>
          <div className="segment-counts">
            <div>
              <strong>{policy.acknowledgeMinutes}m</strong>
              <span>Acknowledge</span>
            </div>
            <div>
              <strong>{policy.resolveHours}h</strong>
              <span>Resolve</span>
            </div>
          </div>
          <div className="notice">{policy.escalation}</div>
          <small className={policy.currentBreaches ? "field-error" : "muted"}>
            {policy.currentBreaches} fictional active breach
            {policy.currentBreaches === 1 ? "" : "es"}
          </small>
        </article>
      ))}
    </section>
  );
}
