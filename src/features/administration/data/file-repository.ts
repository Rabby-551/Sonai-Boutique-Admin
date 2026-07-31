import { randomUUID } from "node:crypto";
import {
  allPermissions,
  type Permission,
  type Role,
} from "@/lib/auth/permissions";
import { ShonaiFileStore } from "@/lib/mock-store/file-store";
import type { ShonaiStore } from "@/lib/mock-store/schema";
import { OperationsError } from "@/lib/operations-error";
import type {
  AdministrationRepository,
  AuditListInput,
  StaffListInput,
  StaffMutationInput,
} from "./repository";
import type {
  BusinessSettings,
  Staff,
  UserAccount,
} from "../schemas/administration";
import { appendAudit } from "./audit";

export class FileAdministrationRepository implements AdministrationRepository {
  constructor(private readonly store = new ShonaiFileStore()) {}

  async listStaff(input: StaffListInput) {
    const store = await this.store.read();
    const query = input.query?.toLowerCase();
    return store.staff
      .filter(
        (item) =>
          !query ||
          [item.name, item.employeeCode, item.phone, item.email ?? ""].some(
            (value) => value.toLowerCase().includes(query),
          ),
      )
      .filter(
        (item) =>
          !input.status ||
          input.status === "all" ||
          item.status === input.status,
      )
      .filter(
        (item) =>
          !input.locationId ||
          input.locationId === "all" ||
          item.sharedScope ||
          item.branchIds.includes(input.locationId),
      )
      .filter(
        (item) =>
          !input.branchId ||
          item.sharedScope ||
          item.branchIds.includes(input.branchId),
      )
      .sort((a, b) => a.employeeCode.localeCompare(b.employeeCode));
  }
  async getStaff(id: string) {
    return this.staffById(await this.store.read(), id);
  }
  async createStaff(input: StaffMutationInput, actorId: string) {
    return this.store.transaction((store) => {
      this.validateStaff(store, input);
      const now = new Date().toISOString();
      const next = store.staff.length + 1;
      const item: Staff = {
        id: `stf-${randomUUID()}`,
        employeeCode: `EMP-${String(next).padStart(4, "0")}`,
        ...input,
        createdAt: now,
        updatedAt: now,
        version: 1,
      };
      store.staff.push(item);
      appendAudit(store, {
        module: "staff",
        action: "created",
        entityType: "staff",
        entityId: item.id,
        actorId,
        summary: `Created staff profile ${item.employeeCode}.`,
      });
      return item;
    });
  }
  async updateStaff(
    id: string,
    input: StaffMutationInput,
    expectedVersion: number,
    actorId: string,
  ) {
    return this.store.transaction((store) => {
      const item = this.staff(store, id, expectedVersion);
      this.validateStaff(store, input, id);
      Object.assign(item, input, {
        updatedAt: new Date().toISOString(),
        version: item.version + 1,
      });
      appendAudit(store, {
        module: "staff",
        action: "updated",
        entityType: "staff",
        entityId: id,
        actorId,
        summary: `Updated staff profile ${item.employeeCode}.`,
      });
      return item;
    });
  }
  async listUsers() {
    return (await this.store.read()).userAccounts.sort((a, b) =>
      a.username.localeCompare(b.username),
    );
  }
  async createUser(
    input: { staffId: string; username: string; role: Role },
    actorId: string,
  ) {
    return this.store.transaction((store) => {
      this.staffById(store, input.staffId);
      if (
        store.userAccounts.some(
          (item) =>
            item.staffId === input.staffId ||
            item.username.toLowerCase() === input.username.toLowerCase(),
        )
      )
        throw new OperationsError(
          "VALIDATION",
          "This staff member or username already has an account.",
        );
      const now = new Date().toISOString();
      const item: UserAccount = {
        id: `usr-${randomUUID()}`,
        ...input,
        active: true,
        passwordResetRequestedAt: now,
        lastLoginAt: null,
        createdAt: now,
        updatedAt: now,
        version: 1,
      };
      store.userAccounts.push(item);
      appendAudit(store, {
        module: "users",
        action: "created",
        entityType: "user",
        entityId: item.id,
        actorId,
        summary: `Created mock account for ${input.username}.`,
      });
      return item;
    });
  }
  async updateUser(
    id: string,
    input: { role: Role; active: boolean },
    expectedVersion: number,
    actorId: string,
  ) {
    return this.store.transaction((store) => {
      const item = this.user(store, id, expectedVersion);
      if (item.role === "owner" && (!input.active || input.role !== "owner"))
        throw new OperationsError(
          "VALIDATION",
          "The owner account cannot be deactivated or demoted.",
        );
      Object.assign(item, input, {
        updatedAt: new Date().toISOString(),
        version: item.version + 1,
      });
      appendAudit(store, {
        module: "users",
        action: "updated",
        entityType: "user",
        entityId: id,
        actorId,
        summary: `Updated mock account ${item.username}.`,
      });
      return item;
    });
  }
  async requestPasswordReset(
    id: string,
    expectedVersion: number,
    actorId: string,
  ) {
    return this.store.transaction((store) => {
      const item = this.user(store, id, expectedVersion);
      const now = new Date().toISOString();
      item.passwordResetRequestedAt = now;
      item.updatedAt = now;
      item.version += 1;
      appendAudit(store, {
        module: "users",
        action: "password_reset_requested",
        entityType: "user",
        entityId: id,
        actorId,
        summary: `Recorded a fictional password reset for ${item.username}.`,
      });
      return item;
    });
  }
  async listRoles() {
    return (await this.store.read()).roleProfiles;
  }
  async updateRole(
    role: Role,
    permissions: Permission[],
    expectedVersion: number,
    actorId: string,
  ) {
    return this.store.transaction((store) => {
      const item = store.roleProfiles.find((entry) => entry.role === role);
      if (!item)
        throw new OperationsError("NOT_FOUND", "Role profile not found.");
      if (item.version !== expectedVersion)
        throw new OperationsError(
          "CONFLICT",
          "Role permissions changed. Refresh and review them.",
        );
      if (role === "owner" && permissions.length !== allPermissions.length)
        throw new OperationsError(
          "VALIDATION",
          "Owner permissions cannot be weakened.",
        );
      const unique = [...new Set(permissions)];
      if (unique.some((permission) => !allPermissions.includes(permission)))
        throw new OperationsError(
          "VALIDATION",
          "An unknown permission was supplied.",
        );
      item.permissions = unique;
      item.version += 1;
      item.updatedAt = new Date().toISOString();
      item.updatedBy = actorId;
      appendAudit(store, {
        module: "roles",
        action: "permissions_updated",
        entityType: "role",
        entityId: role,
        actorId,
        summary: `Updated ${item.label} permissions.`,
        metadata: { permissionCount: unique.length },
      });
      return item;
    });
  }
  async listAudit(input: AuditListInput) {
    const query = input.query?.toLowerCase();
    return (await this.store.read()).auditEvents
      .filter(
        (item) =>
          !query ||
          `${item.summary} ${item.entityId}`.toLowerCase().includes(query),
      )
      .filter(
        (item) =>
          !input.module ||
          input.module === "all" ||
          item.module === input.module,
      )
      .filter((item) => !input.actorId || item.actorId === input.actorId)
      .filter(
        (item) => !input.from || item.occurredAt.slice(0, 10) >= input.from,
      )
      .filter((item) => !input.to || item.occurredAt.slice(0, 10) <= input.to)
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  }
  async getSettings() {
    return (await this.store.read()).businessSettings;
  }
  async updateSettings(
    input: Omit<BusinessSettings, "version" | "updatedAt" | "updatedBy">,
    expectedVersion: number,
    actorId: string,
  ) {
    return this.store.transaction((store) => {
      const current = store.businessSettings;
      if (current.version !== expectedVersion)
        throw new OperationsError(
          "CONFLICT",
          "Settings changed. Refresh and review them.",
        );
      if (
        !store.locations.some(
          (item) => item.id === input.defaultLocationId && item.active,
        )
      )
        throw new OperationsError(
          "VALIDATION",
          "Choose an active default location.",
        );
      store.businessSettings = {
        ...input,
        version: current.version + 1,
        updatedAt: new Date().toISOString(),
        updatedBy: actorId,
      };
      appendAudit(store, {
        module: "settings",
        action: "updated",
        entityType: "settings",
        entityId: "business",
        actorId,
        summary: "Updated global business settings.",
      });
      return store.businessSettings;
    });
  }
  private staffById(store: ShonaiStore, id: string) {
    const item = store.staff.find((entry) => entry.id === id);
    if (!item)
      throw new OperationsError("NOT_FOUND", "Staff profile not found.");
    return item;
  }
  private staff(store: ShonaiStore, id: string, version: number) {
    const item = this.staffById(store, id);
    if (item.version !== version)
      throw new OperationsError(
        "CONFLICT",
        "Staff profile changed. Refresh and review it.",
      );
    return item;
  }
  private user(store: ShonaiStore, id: string, version: number) {
    const item = store.userAccounts.find((entry) => entry.id === id);
    if (!item)
      throw new OperationsError("NOT_FOUND", "User account not found.");
    if (item.version !== version)
      throw new OperationsError(
        "CONFLICT",
        "User account changed. Refresh and review it.",
      );
    return item;
  }
  private validateStaff(
    store: ShonaiStore,
    input: StaffMutationInput,
    except?: string,
  ) {
    if (
      store.staff.some(
        (item) =>
          item.id !== except &&
          (item.phone === input.phone ||
            (input.email &&
              item.email?.toLowerCase() === input.email.toLowerCase())),
      )
    )
      throw new OperationsError(
        "VALIDATION",
        "Staff phone and email must be unique.",
      );
    if (!input.sharedScope && input.branchIds.length === 0)
      throw new OperationsError(
        "VALIDATION",
        "Assign at least one branch or use shared scope.",
      );
    if (
      input.branchIds.some(
        (id) => !store.locations.some((item) => item.id === id && item.active),
      )
    )
      throw new OperationsError(
        "VALIDATION",
        "A branch assignment is invalid.",
      );
  }
}
