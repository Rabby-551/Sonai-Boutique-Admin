import { OperationsClient } from "@/lib/http/operations-client";
import { env } from "@/lib/env";
import type { Permission, Role } from "@/lib/auth/permissions";
import type {
  AdministrationRepository,
  AuditListInput,
  StaffListInput,
  StaffMutationInput,
} from "./repository";
import type {
  AuditEvent,
  BusinessSettings,
  RoleProfile,
  Staff,
  UserAccount,
} from "../schemas/administration";

export class HttpAdministrationRepository implements AdministrationRepository {
  private readonly client = new OperationsClient(
    `${env.API_BASE_URL}/administration`,
  );
  listStaff(input: StaffListInput) {
    return this.client.request<Staff[]>(
      `/staff?${new URLSearchParams(Object.entries(input).filter(([, value]) => value != null) as [string, string][]).toString()}`,
    );
  }
  getStaff(id: string) {
    return this.client.request<Staff>(`/staff/${id}`);
  }
  createStaff(input: StaffMutationInput, actorId: string) {
    return this.post<Staff>("/staff", { input, actorId });
  }
  updateStaff(
    id: string,
    input: StaffMutationInput,
    expectedVersion: number,
    actorId: string,
  ) {
    return this.post<Staff>(`/staff/${id}`, {
      input,
      expectedVersion,
      actorId,
    });
  }
  listUsers() {
    return this.client.request<UserAccount[]>("/users");
  }
  createUser(
    input: { staffId: string; username: string; role: Role },
    actorId: string,
  ) {
    return this.post<UserAccount>("/users", { input, actorId });
  }
  updateUser(
    id: string,
    input: { role: Role; active: boolean },
    expectedVersion: number,
    actorId: string,
  ) {
    return this.post<UserAccount>(`/users/${id}`, {
      input,
      expectedVersion,
      actorId,
    });
  }
  requestPasswordReset(id: string, expectedVersion: number, actorId: string) {
    return this.post<UserAccount>(`/users/${id}/password-reset`, {
      expectedVersion,
      actorId,
    });
  }
  listRoles() {
    return this.client.request<RoleProfile[]>("/roles");
  }
  updateRole(
    role: Role,
    permissions: Permission[],
    expectedVersion: number,
    actorId: string,
  ) {
    return this.post<RoleProfile>(`/roles/${role}`, {
      permissions,
      expectedVersion,
      actorId,
    });
  }
  listAudit(input: AuditListInput) {
    return this.client.request<AuditEvent[]>(
      `/audit?${new URLSearchParams(Object.entries(input).filter(([, value]) => value) as [string, string][]).toString()}`,
    );
  }
  getSettings() {
    return this.client.request<BusinessSettings>("/settings");
  }
  updateSettings(
    input: Omit<BusinessSettings, "version" | "updatedAt" | "updatedBy">,
    expectedVersion: number,
    actorId: string,
  ) {
    return this.post<BusinessSettings>("/settings", {
      input,
      expectedVersion,
      actorId,
    });
  }
  private post<T>(path: string, body: unknown) {
    return this.client.request<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }
}
