import { Monitor, Smartphone } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import type { VisualCheckpoint } from "../schemas/demo";

export function VisualEvidence({
  checkpoints,
}: {
  checkpoints: VisualCheckpoint[];
}) {
  return (
    <section aria-labelledby="visual-evidence-title">
      <div className="section-title">
        <div>
          <div className="eyebrow">Screenshot comparison</div>
          <h2 id="visual-evidence-title">Visual baselines</h2>
        </div>
      </div>
      <div className="visual-evidence-grid">
        {checkpoints.map((checkpoint) => {
          const Icon = checkpoint.viewport === "mobile" ? Smartphone : Monitor;
          return (
            <article className="card visual-evidence-card" key={checkpoint.id}>
              <div className="demo-card-heading">
                <Icon aria-hidden size={20} />
                <StatusBadge status={checkpoint.status} />
              </div>
              <strong>{checkpoint.route}</strong>
              <span>
                {checkpoint.viewport} · {checkpoint.width}px
              </span>
              <small>{checkpoint.baseline}</small>
            </article>
          );
        })}
      </div>
    </section>
  );
}
