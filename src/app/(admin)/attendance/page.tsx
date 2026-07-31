import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { AttendanceFilters } from "@/features/workforce/components/attendance-filters";
import { AttendanceForm } from "@/features/workforce/components/attendance-form";
import { AttendanceTable } from "@/features/workforce/components/attendance-table";
import { attendanceWorkspace } from "@/features/workforce/server/queries";
export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const input = {
    month: typeof raw.month === "string" ? raw.month : undefined,
    staffId: typeof raw.staffId === "string" ? raw.staffId : undefined,
    status: typeof raw.status === "string" ? raw.status : undefined,
  };
  const { records, staff } = await attendanceWorkspace(input);
  const names = Object.fromEntries(staff.map((item) => [item.id, item.name]));
  return (
    <div className="stack">
      <PageHeader
        eyebrow="People"
        title="Attendance"
        description="Branch-scoped daily records and auditable attendance corrections."
        action={
          <Link className="button secondary" href="/attendance/leave">
            Leave requests
          </Link>
        }
      />
      <AttendanceFilters defaults={input} staff={staff} />
      <AttendanceForm staff={staff} />
      <AttendanceTable records={records} staffNames={names} />
    </div>
  );
}
