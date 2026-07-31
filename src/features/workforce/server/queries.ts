import "server-only";
import { requirePermission } from "@/lib/auth/session";
import { getAdministrationRepository } from "@/features/administration/data/repository-factory";
import { getWorkforceRepository } from "../data/repository-factory";
const scope = async () => {
  const user = await requirePermission("attendance.view");
  return {
    user,
    scope: {
      actorId: user.id,
      branchId: user.branchId,
      selfOnly: user.role === "cashier" || user.role === "support",
    },
  };
};
export async function attendanceWorkspace(
  input: { month?: string; staffId?: string; status?: string } = {},
) {
  const { user, scope: permittedScope } = await scope();
  const [records, leave, allStaff, accounts] = await Promise.all([
    getWorkforceRepository().listAttendance(input, permittedScope),
    getWorkforceRepository().listLeave(permittedScope),
    getAdministrationRepository().listStaff({ branchId: user.branchId }),
    getAdministrationRepository().listUsers(),
  ]);
  const ownStaffId = accounts.find((item) => item.id === user.id)?.staffId;
  const staff = permittedScope.selfOnly
    ? allStaff.filter((item) => item.id === ownStaffId)
    : allStaff;
  return { records, leave, staff, user };
}
export async function listPayroll() {
  await requirePermission("payroll.view");
  return getWorkforceRepository().listPayroll();
}
export async function getPayroll(id: string) {
  await requirePermission("payroll.view");
  return getWorkforceRepository().getPayroll(id);
}
export async function payrollOptions() {
  await requirePermission("payroll.manage");
  const [staff, settings] = await Promise.all([
    getAdministrationRepository().listStaff({ status: "active" }),
    getAdministrationRepository().getSettings(),
  ]);
  return { staff, settings };
}
export async function salaryRecords(staffId: string) {
  await requirePermission("payroll.manage");
  return getWorkforceRepository().listSalaryRecords(staffId);
}
