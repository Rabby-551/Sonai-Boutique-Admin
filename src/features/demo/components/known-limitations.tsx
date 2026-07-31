import { CircleAlert } from "lucide-react";
import type { KnownLimitation } from "../schemas/demo";

export function KnownLimitations({
  limitations,
}: {
  limitations: KnownLimitation[];
}) {
  return (
    <section
      className="card limitations-panel"
      aria-labelledby="limitations-title"
    >
      <div className="section-title compact">
        <div>
          <div className="eyebrow">Must remain visible</div>
          <h2 id="limitations-title">Known limitations</h2>
        </div>
        <CircleAlert aria-hidden size={22} />
      </div>
      <div className="limitation-list">
        {limitations.map((item) => (
          <article key={item.id}>
            <div>
              <strong>{item.area}</strong>
              <p>{item.limitation}</p>
            </div>
            <small>
              <b>Impact:</b> {item.impact}
              <br />
              <b>Resolution:</b> {item.resolutionBoundary}
            </small>
          </article>
        ))}
      </div>
    </section>
  );
}
