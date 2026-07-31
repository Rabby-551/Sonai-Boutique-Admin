import { PageHeader } from "@/components/ui/page-header";
import { LeaveForm } from "@/features/workforce/components/leave-form";
import { LeaveTable } from "@/features/workforce/components/leave-table";
import { attendanceWorkspace } from "@/features/workforce/server/queries";
import { can } from "@/lib/auth/permissions";
export default async function LeavePage() {
  const { leave, staff, user } = await attendanceWorkspace();
  const names = Object.fromEntries(staff.map((item) => [item.id, item.name]));
  return (
    <div className="stack">
      <PageHeader
        eyebrow="People"
        title="Leave requests"
        description="Self-service requests with manager approval and immutable decisions."
      />
      <div className="grid-2 balanced">
        <LeaveForm staff={staff} />
        <LeaveTable
          requests={leave}
          staffNames={names}
          canApprove={can(user.role, "attendance.approve")}
        />
      </div>
    </div>
  );
}
