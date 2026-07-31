import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { PreviewRoute } from "../schemas/preview";

export function ReviewRouteDirectory({ routes }: { routes: PreviewRoute[] }) {
  return (
    <section className="card" aria-labelledby="review-routes-title">
      <div className="section-title compact">
        <div>
          <div className="eyebrow">Guided navigation</div>
          <h2 id="review-routes-title">Review route directory</h2>
        </div>
      </div>
      <div className="review-route-grid">
        {routes.map((item) => (
          <Link href={item.route} key={item.route} className="review-route">
            <span>
              <strong>{item.label}</strong>
              <small>{item.purpose}</small>
            </span>
            <ArrowUpRight aria-hidden size={18} />
          </Link>
        ))}
      </div>
    </section>
  );
}
