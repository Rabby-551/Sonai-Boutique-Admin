import type { Order } from "../schemas/orders";

export function OrderTimeline({ order }: { order: Order }) {
  const events = order.timeline.toSorted((a, b) =>
    b.occurredAt.localeCompare(a.occurredAt),
  );
  return (
    <section className="card detail-panel">
      <h2>Timeline</h2>
      <ol className="timeline">
        {events.map((event) => (
          <li key={event.id}>
            <div className="timeline-marker" aria-hidden="true" />
            <div>
              <strong>{event.label}</strong>
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
