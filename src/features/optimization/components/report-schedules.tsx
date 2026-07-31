import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/formatting";
import type { ReportSchedule } from "../schemas/optimization";

export function ReportSchedules({
  schedules,
}: {
  schedules: ReportSchedule[];
}) {
  return (
    <section className="service-grid" aria-label="Scheduled reports">
      {schedules.map((schedule) => (
        <article className="card schedule-card" key={schedule.id}>
          <div className="section-heading">
            <div>
              <div className="eyebrow">{schedule.format}</div>
              <h2>{schedule.name}</h2>
            </div>
            <StatusBadge status={schedule.lastStatus} />
          </div>
          <p>{schedule.report}</p>
          <dl className="compact-facts">
            <div>
              <dt>Cadence</dt>
              <dd>{schedule.cadence}</dd>
            </div>
            <div>
              <dt>Next run</dt>
              <dd>{formatDate(schedule.nextRunAt)}</dd>
            </div>
            <div>
              <dt>Recipients</dt>
              <dd>{schedule.recipients.join(", ")}</dd>
            </div>
            <div>
              <dt>Scope</dt>
              <dd>{schedule.scope}</dd>
            </div>
          </dl>
        </article>
      ))}
    </section>
  );
}
