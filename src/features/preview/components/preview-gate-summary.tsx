import { CheckCircle2, CircleAlert, CircleX } from "lucide-react";
import type { PreviewGate } from "../schemas/preview";

const gateIcon = {
  ready: CheckCircle2,
  review: CircleAlert,
  blocked: CircleX,
};

export function PreviewGateSummary({ gates }: { gates: PreviewGate[] }) {
  return (
    <section className="card" aria-labelledby="preview-gates-title">
      <div className="section-title compact">
        <div>
          <div className="eyebrow">Automated evidence</div>
          <h2 id="preview-gates-title">Preview gates</h2>
        </div>
      </div>
      <div className="preview-gate-list">
        {gates.map((gate) => {
          const Icon = gateIcon[gate.status];
          return (
            <article key={gate.id} className={`preview-gate ${gate.status}`}>
              <Icon aria-hidden size={20} />
              <div>
                <strong>{gate.label}</strong>
                <p>{gate.evidence}</p>
              </div>
              <span>{gate.status}</span>
            </article>
          );
        })}
      </div>
    </section>
  );
}
