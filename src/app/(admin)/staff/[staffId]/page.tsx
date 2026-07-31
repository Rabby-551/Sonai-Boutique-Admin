import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { StaffForm } from "@/features/administration/components/staff-form";
import { getStaff } from "@/features/administration/server/queries";
import { listLocations } from "@/features/inventory/server/queries";
import { requirePermission } from "@/lib/auth/session";
import { SalaryForm } from "@/features/workforce/components/salary-form";
export default async function StaffDetailPage({
  params,
}: {
  params: Promise<{ staffId: string }>;
}) {
  await requirePermission("staff.manage");
  const { staffId } = await params;
  const [staff, locations] = await Promise.all([
    getStaff(staffId).catch(() => null),
    listLocations(),
  ]);
  if (!staff) notFound();
  return (
    <div className="stack">
      <PageHeader
        eyebrow="People"
        title={staff.name}
        description={`${staff.employeeCode} · ${staff.role}`}
      />
      <StaffForm staff={staff} locations={[...locations]} />
      <SalaryForm staffId={staff.id} />
    </div>
  );
}
