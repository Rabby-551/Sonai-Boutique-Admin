import { PageHeader } from "@/components/ui/page-header";
import { StaffForm } from "@/features/administration/components/staff-form";
import { listLocations } from "@/features/inventory/server/queries";
import { requirePermission } from "@/lib/auth/session";
export default async function NewStaffPage() {
  await requirePermission("staff.manage");
  const locations = await listLocations();
  return (
    <div className="stack">
      <PageHeader
        eyebrow="People"
        title="New staff profile"
        description="Record employment and branch scope without sensitive identity documents."
      />
      <StaffForm locations={[...locations]} />
    </div>
  );
}
