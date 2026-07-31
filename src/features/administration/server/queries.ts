import "server-only";
import { requirePermission } from "@/lib/auth/session";
import { getAdministrationRepository } from "../data/repository-factory";
import type { AuditListInput, StaffListInput } from "../data/repository";
export async function listStaff(input: StaffListInput = {}) {
  const user = await requirePermission("staff.view");
  return getAdministrationRepository().listStaff({
    ...input,
    branchId: user.branchId,
  });
}
export async function getStaff(id: string) {
  await requirePermission("staff.view");
  return getAdministrationRepository().getStaff(id);
}
export async function listUsers() {
  await requirePermission("users.view");
  return getAdministrationRepository().listUsers();
}
export async function listRoles() {
  await requirePermission("roles.view");
  return getAdministrationRepository().listRoles();
}
export async function listAudit(input: AuditListInput) {
  await requirePermission("audit.view");
  return getAdministrationRepository().listAudit(input);
}
export async function getBusinessSettings() {
  await requirePermission("settings.view");
  return getAdministrationRepository().getSettings();
}
