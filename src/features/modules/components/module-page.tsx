import { Plus } from "lucide-react";
import { notFound } from "next/navigation";
import { ModuleTable } from "@/components/ui/module-table";
import { PageHeader } from "@/components/ui/page-header";
import { getModule } from "../server/queries";

export async function ModulePage({ slug }: { slug: string }) {
  const definition = await getModule(slug);
  if (!definition) notFound();
  return (
    <>
      <PageHeader
        eyebrow={`${definition.eyebrow} · ${definition.requirements.join(", ")}`}
        title={definition.title}
        description={definition.description}
        action={
          <button className="button">
            <Plus size={17} />
            {definition.action}
          </button>
        }
      />
      <div className="cards" style={{ marginBottom: 20 }}>
        {definition.metrics.map((metric) => (
          <article className="card" key={metric.label}>
            <span className="metric-label">{metric.label}</span>
            <strong className="metric-value">{metric.value}</strong>
            <span className="metric-change">{metric.note}</span>
          </article>
        ))}
      </div>
      <ModuleTable module={definition} />
    </>
  );
}
