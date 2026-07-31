import { ClipboardCheck, ShieldAlert } from "lucide-react";
import type { PreviewLimitation } from "../schemas/preview";

export function PreviewHandoff({
  limitations,
  steps,
}: {
  limitations: PreviewLimitation[];
  steps: string[];
}) {
  return (
    <div className="grid-2 balanced preview-handoff">
      <section className="card" aria-labelledby="handoff-title">
        <div className="section-title compact">
          <div>
            <div className="eyebrow">Reviewer checklist</div>
            <h2 id="handoff-title">Safe handoff</h2>
          </div>
          <ClipboardCheck aria-hidden size={22} />
        </div>
        <ol className="preview-steps">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>
      <section className="card" aria-labelledby="preview-limits-title">
        <div className="section-title compact">
          <div>
            <div className="eyebrow">Must remain visible</div>
            <h2 id="preview-limits-title">Preview limitations</h2>
          </div>
          <ShieldAlert aria-hidden size={22} />
        </div>
        <div className="preview-limit-list">
          {limitations.map((item) => (
            <article key={item.id}>
              <strong>{item.area}</strong>
              <p>{item.limitation}</p>
              <small>Production: {item.productionBoundary}</small>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
