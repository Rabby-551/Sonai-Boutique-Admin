import type { Permission, Role } from "@/lib/auth/permissions";
import type {
  AuditEvent,
  BusinessSettings,
  RoleProfile,
  Staff,
  UserAccount,
} from "../schemas/administration";

export interface StaffListInput {
  query?: string;
  status?: string;
  locationId?: string;
  branchId?: string | null;
}
export interface StaffMutationInput {
  name: string;
  phone: string;
  email: string | null;
  role: Role;
  branchIds: string[];
  sharedScope: boolean;
  hireDate: string;
  status: Staff["status"];
  salaryGrade: string;
  notes: string;
}
export interface AuditListInput {
  query?: string;
  module?: string;
  actorId?: string;
  from?: string;
  to?: string;
}

/** Administration contract for staff identity, mock accounts, roles, audit and settings. */
export interface AdministrationRepository {
  listStaff(input: StaffListInput): Promise<Staff[]>;
  getStaff(id: string): Promise<Staff>;
  createStaff(input: StaffMutationInput, actorId: string): Promise<Staff>;
  updateStaff(
    id: string,
    input: StaffMutationInput,
    expectedVersion: number,
    actorId: string,
  ): Promise<Staff>;
  listUsers(): Promise<UserAccount[]>;
  createUser(
    input: { staffId: string; username: string; role: Role },
    actorId: string,
  ): Promise<UserAccount>;
  updateUser(
    id: string,
    input: { role: Role; active: boolean },
    expectedVersion: number,
    actorId: string,
  ): Promise<UserAccount>;
  requestPasswordReset(
    id: string,
    expectedVersion: number,
    actorId: string,
  ): Promise<UserAccount>;
  listRoles(): Promise<RoleProfile[]>;
  updateRole(
    role: Role,
    permissions: Permission[],
    expectedVersion: number,
    actorId: string,
  ): Promise<RoleProfile>;
  listAudit(input: AuditListInput): Promise<AuditEvent[]>;
  getSettings(): Promise<BusinessSettings>;
  updateSettings(
    input: Omit<BusinessSettings, "version" | "updatedAt" | "updatedBy">,
    expectedVersion: number,
    actorId: string,
  ): Promise<BusinessSettings>;
}
