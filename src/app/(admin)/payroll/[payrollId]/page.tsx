import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { PayrollAdjustmentForm } from "@/features/workforce/components/payroll-adjustment-form";
import { PayrollControls } from "@/features/workforce/components/payroll-controls";
import { PayrollSummary } from "@/features/workforce/components/payroll-summary";
import { getPayroll } from "@/features/workforce/server/queries";
import { can } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";
export default async function PayrollDetailPage({
  params,
}: {
  params: Promise<{ payrollId: string }>;
}) {
  const { payrollId } = await params;
  const [run, user] = await Promise.all([
    getPayroll(payrollId).catch(() => null),
    getCurrentUser(),
  ]);
  if (!run) notFound();
  return (
    <div className="stack">
      <PageHeader
        eyebrow="People"
        title={run.payrollNumber}
        description={`${run.month} · ${run.locationId ?? "Consolidated"} · ${run.status}`}
      />
      <PayrollSummary run={run} />
      {can(user.role, "payroll.manage") && <PayrollAdjustmentForm run={run} />}
      <PayrollControls
        run={run}
        canApprove={can(user.role, "payroll.approve")}
      />
    </div>
  );
}
