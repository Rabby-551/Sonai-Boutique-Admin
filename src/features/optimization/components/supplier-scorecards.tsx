import { StatusBadge } from "@/components/ui/status-badge";
import type { SupplierScorecard } from "../schemas/optimization";

export function SupplierScorecards({
  scorecards,
}: {
  scorecards: SupplierScorecard[];
}) {
  return (
    <section aria-labelledby="supplier-score-title">
      <div className="section-title">
        <div>
          <div className="eyebrow">Transparent scoring</div>
          <h2 id="supplier-score-title">Supplier performance</h2>
        </div>
      </div>
      <div className="service-grid">
        {scorecards.map((item) => (
          <article className="card scorecard" key={item.id}>
            <div className="section-heading">
              <h3>{item.supplier}</h3>
              <StatusBadge status={item.status} />
            </div>
            <strong className="score-value">
              {item.status === "insufficient_data" ? "—" : item.score}
            </strong>
            <span className="muted">
              Composite score · {item.sampleSize} receipts
            </span>
            <div className="score-bars">
              <div>
                <span>On time</span>
                <strong>{item.onTimeRate}%</strong>
              </div>
              <div className="progress">
                <span style={{ width: `${item.onTimeRate}%` }} />
              </div>
              <div>
                <span>Fill rate</span>
                <strong>{item.fillRate}%</strong>
              </div>
              <div className="progress">
                <span style={{ width: `${item.fillRate}%` }} />
              </div>
            </div>
            <small className="muted">
              Rejected {item.rejectionRate}% · Average lead time{" "}
              {item.leadTimeDays} days
            </small>
          </article>
        ))}
      </div>
    </section>
  );
}
