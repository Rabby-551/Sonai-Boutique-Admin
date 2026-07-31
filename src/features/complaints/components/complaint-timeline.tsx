import type { Complaint } from "../schemas/complaints";
export function ComplaintTimeline({ complaint }: { complaint: Complaint }) {
  return (
    <section className="card detail-panel">
      <span className="eyebrow">Audit trail</span>
      <h2>Case timeline</h2>
      <ol className="timeline">
        {complaint.timeline.toReversed().map((event) => (
          <li key={event.id}>
            <span className="timeline-marker" />
            <div>
              <strong>{event.type.replaceAll("_", " ")}</strong>
              <p>{event.detail}</p>
              <small>
                {new Date(event.occurredAt).toLocaleString("en-BD")} ·{" "}
                {event.actorId}
              </small>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
