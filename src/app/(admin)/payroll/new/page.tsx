import { PageHeader } from "@/components/ui/page-header";
import { PayrollCreateForm } from "@/features/workforce/components/payroll-create-form";
import { listLocations } from "@/features/inventory/server/queries";
import { requirePermission } from "@/lib/auth/session";
export default async function NewPayrollPage() {
  await requirePermission("payroll.manage");
  const locations = await listLocations();
  return (
    <div className="stack">
      <PageHeader
        eyebrow="People"
        title="New payroll"
        description="Snapshot effective salary and attendance for one month and scope."
      />
      <PayrollCreateForm locations={[...locations]} />
    </div>
  );
}
