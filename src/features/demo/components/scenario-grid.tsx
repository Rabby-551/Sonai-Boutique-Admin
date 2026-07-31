import Link from "next/link";
import { ArrowRight, ListChecks } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import type { DemoScenario } from "../schemas/demo";

export function ScenarioGrid({ scenarios }: { scenarios: DemoScenario[] }) {
  return (
    <section aria-labelledby="demo-scenarios-title">
      <div className="section-title">
        <div>
          <div className="eyebrow">Guided walkthroughs</div>
          <h2 id="demo-scenarios-title">Cross-module scenarios</h2>
        </div>
      </div>
      <div className="demo-scenario-grid">
        {scenarios.map((scenario) => (
          <article className="card demo-scenario" key={scenario.id}>
            <div className="demo-card-heading">
              <span className="demo-icon" aria-hidden>
                <ListChecks size={19} />
              </span>
              <StatusBadge status={scenario.status} />
            </div>
            <div>
              <small>
                {scenario.module} · {scenario.role}
              </small>
              <h3>{scenario.title}</h3>
              <p>{scenario.outcome}</p>
            </div>
            <ol>
              {scenario.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <Link className="text-link" href={scenario.route}>
              Start scenario <ArrowRight aria-hidden size={15} />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
