import { Activity, Database, LockKeyhole, ServerCog } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import type { PlatformService } from "../schemas/platform";

const iconByCategory = {
  application: ServerCog,
  data: Database,
  security: LockKeyhole,
  operations: Activity,
};

export function ServiceHealthGrid({
  services,
}: {
  services: PlatformService[];
}) {
  return (
    <section aria-labelledby="service-health-title">
      <div className="section-title">
        <div>
          <div className="eyebrow">Runtime boundaries</div>
          <h2 id="service-health-title">Service health</h2>
        </div>
      </div>
      <div className="service-grid">
        {services.map((service) => {
          const Icon = iconByCategory[service.category];
          return (
            <article className="card service-card" key={service.id}>
              <div className="service-card-head">
                <span className="service-icon" aria-hidden>
                  <Icon size={19} />
                </span>
                <StatusBadge status={service.status} />
              </div>
              <h3>{service.name}</h3>
              <p>{service.detail}</p>
              <dl className="compact-facts">
                <div>
                  <dt>Mode</dt>
                  <dd>{service.mode}</dd>
                </div>
                <div>
                  <dt>Latency</dt>
                  <dd>
                    {service.latencyMs === null
                      ? "Not measured"
                      : `${service.latencyMs} ms`}
                  </dd>
                </div>
              </dl>
            </article>
          );
        })}
      </div>
    </section>
  );
}
