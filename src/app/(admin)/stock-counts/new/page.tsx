import { PageHeader } from "@/components/ui/page-header";
import { CountCreateForm } from "@/features/inventory/components/count-create-form";
import { listLocations } from "@/features/inventory/server/queries";

export default async function NewCountPage() {
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Inventory assurance"
        title="Schedule stock count"
        description="A stock snapshot is taken only when the count starts."
      />
      <section className="card form-card">
        <CountCreateForm locations={await listLocations()} />
      </section>
    </div>
  );
}
