import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { PayrollTable } from "@/features/workforce/components/payroll-table";
import { listPayroll } from "@/features/workforce/server/queries";
import { can } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";
export default async function PayrollPage() {
  const [runs, user] = await Promise.all([listPayroll(), getCurrentUser()]);
  return (
    <div className="stack">
      <PageHeader
        eyebrow="People"
        title="Payroll"
        description="Effective salary and attendance snapshots with approval before payment."
        action={
          can(user.role, "payroll.manage") ? (
            <Link className="button" href="/payroll/new">
              New payroll
            </Link>
          ) : undefined
        }
      />
      <PayrollTable runs={runs} />
    </div>
  );
}
