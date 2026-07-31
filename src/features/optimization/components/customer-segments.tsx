import { StatusBadge } from "@/components/ui/status-badge";
import type { CustomerSegment } from "../schemas/optimization";

export function CustomerSegments({
  segments,
}: {
  segments: CustomerSegment[];
}) {
  return (
    <section className="service-grid" aria-label="Customer segments">
      {segments.map((segment) => (
        <article className="card segment-card" key={segment.id}>
          <div className="section-heading">
            <div>
              <div className="eyebrow">{segment.refresh}</div>
              <h2>{segment.name}</h2>
            </div>
            <StatusBadge status={segment.status} />
          </div>
          <p>{segment.description}</p>
          <div className="segment-counts">
            <div>
              <strong>{segment.customers}</strong>
              <span>Total members</span>
            </div>
            <div>
              <strong>{segment.consentEligible}</strong>
              <span>Contact eligible</span>
            </div>
          </div>
          <h3>Membership rules</h3>
          <ul className="rule-list">
            {segment.rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  );
}
