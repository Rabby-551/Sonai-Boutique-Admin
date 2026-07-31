import { randomUUID } from "node:crypto";
import { appendAudit } from "@/features/administration/data/audit";
import { ShonaiFileStore } from "@/lib/mock-store/file-store";
import type { ShonaiStore } from "@/lib/mock-store/schema";
import { OperationsError } from "@/lib/operations-error";
import type {
  AttendanceRecord,
  LeaveRequest,
  PayrollRun,
  SalaryRecord,
} from "../schemas/workforce";
import type {
  AttendanceInput,
  WorkforceRepository,
  WorkforceScope,
} from "./repository";

export class FileWorkforceRepository implements WorkforceRepository {
  constructor(private readonly store = new ShonaiFileStore()) {}
  async listAttendance(
    input: { month?: string; staffId?: string; status?: string },
    scope: WorkforceScope,
  ) {
    const store = await this.store.read();
    const allowed = this.allowedStaffIds(store, scope);
    return store.attendanceRecords
      .filter((item) => allowed.has(item.staffId))
      .filter((item) => !input.month || item.date.startsWith(input.month))
      .filter((item) => !input.staffId || item.staffId === input.staffId)
      .filter(
        (item) =>
          !input.status ||
          input.status === "all" ||
          item.status === input.status,
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  }
  async recordAttendance(
    input: AttendanceInput,
    expectedVersion: number | null,
    scope: WorkforceScope,
  ) {
    return this.store.transaction((store) => {
      this.assertStaffScope(store, input.staffId, scope);
      const existing = store.attendanceRecords.find(
        (item) => item.staffId === input.staffId && item.date === input.date,
      );
      const now = new Date().toISOString();
      if (existing) {
        if (expectedVersion !== existing.version)
          throw new OperationsError(
            "CONFLICT",
            "Attendance changed. Refresh and review it.",
          );
        Object.assign(existing, input, {
          recordedBy: scope.actorId,
          updatedAt: now,
          version: existing.version + 1,
        });
        appendAudit(store, {
          module: "attendance",
          action: "updated",
          entityType: "attendance",
          entityId: existing.id,
          actorId: scope.actorId,
          summary: `Updated attendance for ${input.date}.`,
        });
        return existing;
      }
      const item: AttendanceRecord = {
        id: `att-${randomUUID()}`,
        ...input,
        recordedBy: scope.actorId,
        createdAt: now,
        updatedAt: now,
        version: 1,
      };
      store.attendanceRecords.push(item);
      appendAudit(store, {
        module: "attendance",
        action: "recorded",
        entityType: "attendance",
        entityId: item.id,
        actorId: scope.actorId,
        summary: `Recorded attendance for ${input.date}.`,
      });
      return item;
    });
  }
  async listLeave(scope: WorkforceScope) {
    const store = await this.store.read();
    const allowed = this.allowedStaffIds(store, scope);
    return store.leaveRequests
      .filter((item) => allowed.has(item.staffId))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  async createLeave(
    input: {
      staffId: string;
      startDate: string;
      endDate: string;
      reason: string;
    },
    scope: WorkforceScope,
  ) {
    return this.store.transaction((store) => {
      this.assertStaffScope(store, input.staffId, scope);
      const days = this.days(input.startDate, input.endDate);
      const now = new Date().toISOString();
      const item: LeaveRequest = {
        id: `lev-${randomUUID()}`,
        ...input,
        days,
        status: "pending",
        decisionReason: null,
        decidedBy: null,
        decidedAt: null,
        createdAt: now,
        updatedAt: now,
        version: 1,
      };
      store.leaveRequests.push(item);
      appendAudit(store, {
        module: "attendance",
        action: "leave_requested",
        entityType: "leave",
        entityId: item.id,
        actorId: scope.actorId,
        summary: `Requested ${days} day(s) leave.`,
      });
      return item;
    });
  }
  async decideLeave(
    id: string,
    decision: "approved" | "rejected",
    reason: string,
    expectedVersion: number,
    actorId: string,
  ) {
    return this.store.transaction((store) => {
      const item = store.leaveRequests.find((entry) => entry.id === id);
      if (!item)
        throw new OperationsError("NOT_FOUND", "Leave request not found.");
      if (item.version !== expectedVersion)
        throw new OperationsError(
          "CONFLICT",
          "Leave request changed. Refresh and review it.",
        );
      if (item.status !== "pending")
        throw new OperationsError(
          "INVALID_TRANSITION",
          "This leave request was already decided.",
        );
      const now = new Date().toISOString();
      Object.assign(item, {
        status: decision,
        decisionReason: reason,
        decidedBy: actorId,
        decidedAt: now,
        updatedAt: now,
        version: item.version + 1,
      });
      appendAudit(store, {
        module: "attendance",
        action: `leave_${decision}`,
        entityType: "leave",
        entityId: id,
        actorId,
        summary: `${decision === "approved" ? "Approved" : "Rejected"} leave request.`,
      });
      return item;
    });
  }
  async listSalaryRecords(staffId?: string) {
    return (await this.store.read()).salaryRecords
      .filter((item) => !staffId || item.staffId === staffId)
      .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom));
  }
  async setSalary(
    input: Omit<SalaryRecord, "id" | "createdAt" | "createdBy">,
    actorId: string,
  ) {
    return this.store.transaction((store) => {
      this.staff(store, input.staffId);
      if (
        store.salaryRecords.some(
          (item) =>
            item.staffId === input.staffId &&
            item.effectiveFrom === input.effectiveFrom,
        )
      )
        throw new OperationsError(
          "VALIDATION",
          "A salary record already starts on this date.",
        );
      const item: SalaryRecord = {
        id: `sal-${randomUUID()}`,
        ...input,
        createdBy: actorId,
        createdAt: new Date().toISOString(),
      };
      store.salaryRecords.push(item);
      appendAudit(store, {
        module: "payroll",
        action: "salary_created",
        entityType: "salary",
        entityId: item.id,
        actorId,
        summary: "Created an effective-dated salary record.",
      });
      return item;
    });
  }
  async listPayroll() {
    return (await this.store.read()).payrollRuns.sort((a, b) =>
      b.month.localeCompare(a.month),
    );
  }
  async getPayroll(id: string) {
    return this.payroll(await this.store.read(), id);
  }
  async createPayroll(
    input: { month: string; locationId: string | null },
    actorId: string,
  ) {
    return this.store.transaction((store) => {
      if (
        store.payrollRuns.some(
          (item) =>
            item.month === input.month && item.locationId === input.locationId,
        )
      )
        throw new OperationsError(
          "VALIDATION",
          "A payroll run already exists for this month and scope.",
        );
      const staff = store.staff.filter(
        (item) =>
          item.status === "active" &&
          (!input.locationId ||
            item.sharedScope ||
            item.branchIds.includes(input.locationId)),
      );
      if (!staff.length)
        throw new OperationsError(
          "VALIDATION",
          "No active staff match this payroll scope.",
        );
      const lines = staff.map((item) =>
        this.payrollLine(store, item.id, input.month),
      );
      const sequence = (store.payrollSequences[input.month] ?? 0) + 1;
      store.payrollSequences[input.month] = sequence;
      const now = new Date().toISOString();
      const item: PayrollRun = {
        id: `pay-${randomUUID()}`,
        payrollNumber: `PAY-${input.month.replace("-", "")}-${String(sequence).padStart(3, "0")}`,
        ...input,
        status: "draft",
        workingDays: store.businessSettings.payrollWorkingDays,
        lines,
        ...this.totals(lines),
        submittedBy: null,
        submittedAt: null,
        approvedBy: null,
        approvedAt: null,
        paidBy: null,
        paidAt: null,
        createdAt: now,
        updatedAt: now,
        version: 1,
      };
      store.payrollRuns.push(item);
      appendAudit(store, {
        module: "payroll",
        action: "created",
        entityType: "payroll",
        entityId: item.id,
        actorId,
        summary: `Created payroll ${item.payrollNumber}.`,
      });
      return item;
    });
  }
  async adjustPayroll(
    id: string,
    staffId: string,
    adjustmentMinor: number,
    reason: string,
    expectedVersion: number,
    actorId: string,
  ) {
    return this.store.transaction((store) => {
      const item = this.payrollVersion(store, id, expectedVersion);
      if (item.status !== "draft")
        throw new OperationsError(
          "INVALID_TRANSITION",
          "Only draft payroll can be adjusted.",
        );
      if (!reason.trim())
        throw new OperationsError(
          "VALIDATION",
          "An adjustment reason is required.",
        );
      const line = item.lines.find((entry) => entry.staffId === staffId);
      if (!line)
        throw new OperationsError("NOT_FOUND", "Payroll line not found.");
      line.adjustmentMinor = adjustmentMinor;
      line.adjustmentReason = reason;
      line.netPayMinor = Math.max(
        0,
        line.baseSalaryMinor +
          line.allowanceMinor -
          line.fixedDeductionMinor -
          line.absenceDeductionMinor +
          adjustmentMinor,
      );
      Object.assign(item, this.totals(item.lines), {
        version: item.version + 1,
        updatedAt: new Date().toISOString(),
      });
      appendAudit(store, {
        module: "payroll",
        action: "adjusted",
        entityType: "payroll",
        entityId: id,
        actorId,
        summary: `Adjusted payroll line for ${line.staffName}.`,
        metadata: { adjustmentMinor },
      });
      return item;
    });
  }
  async transitionPayroll(
    id: string,
    next: "submitted" | "approved" | "paid",
    expectedVersion: number,
    commandId: string,
    actorId: string,
  ) {
    return this.store.transaction((store) => {
      const current = this.payroll(store, id);
      if (store.processedCommands.includes(commandId)) return current;
      const item = this.payrollVersion(store, id, expectedVersion);
      const allowed =
        (item.status === "draft" && next === "submitted") ||
        (item.status === "submitted" && next === "approved") ||
        (item.status === "approved" && next === "paid");
      if (!allowed)
        throw new OperationsError(
          "INVALID_TRANSITION",
          `Payroll cannot move from ${item.status} to ${next}.`,
        );
      const now = new Date().toISOString();
      item.status = next;
      item.version += 1;
      item.updatedAt = now;
      if (next === "submitted") {
        item.submittedBy = actorId;
        item.submittedAt = now;
      }
      if (next === "approved") {
        item.approvedBy = actorId;
        item.approvedAt = now;
      }
      if (next === "paid") {
        item.paidBy = actorId;
        item.paidAt = now;
      }
      store.processedCommands.push(commandId);
      appendAudit(store, {
        module: "payroll",
        action: next,
        entityType: "payroll",
        entityId: id,
        actorId,
        summary: `Payroll ${item.payrollNumber} marked ${next}.`,
        metadata: { netMinor: item.netMinor },
      });
      return item;
    });
  }
  private payrollLine(
    store: ShonaiStore,
    staffId: string,
    month: string,
  ): PayrollRun["lines"][number] {
    const staff = this.staff(store, staffId);
    const salary = store.salaryRecords
      .filter(
        (item) =>
          item.staffId === staffId && item.effectiveFrom <= `${month}-31`,
      )
      .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))[0];
    if (!salary)
      throw new OperationsError(
        "VALIDATION",
        `No effective salary exists for ${staff.name}.`,
      );
    const absenceDays = store.attendanceRecords.filter(
      (item) =>
        item.staffId === staffId &&
        item.date.startsWith(month) &&
        item.status === "absent",
    ).length;
    const absenceDeductionMinor = Math.round(
      (salary.baseSalaryMinor / store.businessSettings.payrollWorkingDays) *
        absenceDays,
    );
    return {
      staffId,
      staffName: staff.name,
      baseSalaryMinor: salary.baseSalaryMinor,
      allowanceMinor: salary.fixedAllowanceMinor,
      fixedDeductionMinor: salary.fixedDeductionMinor,
      absenceDays,
      absenceDeductionMinor,
      adjustmentMinor: 0,
      adjustmentReason: "",
      netPayMinor: Math.max(
        0,
        salary.baseSalaryMinor +
          salary.fixedAllowanceMinor -
          salary.fixedDeductionMinor -
          absenceDeductionMinor,
      ),
    };
  }
  private totals(lines: PayrollRun["lines"]) {
    const grossMinor = lines.reduce(
      (sum, line) =>
        sum +
        line.baseSalaryMinor +
        line.allowanceMinor +
        Math.max(0, line.adjustmentMinor),
      0,
    );
    const deductionsMinor = lines.reduce(
      (sum, line) =>
        sum +
        line.fixedDeductionMinor +
        line.absenceDeductionMinor +
        Math.max(0, -line.adjustmentMinor),
      0,
    );
    return {
      grossMinor,
      deductionsMinor,
      netMinor: lines.reduce((sum, line) => sum + line.netPayMinor, 0),
    };
  }
  private allowedStaffIds(store: ShonaiStore, scope: WorkforceScope) {
    const account = store.userAccounts.find(
      (item) => item.id === scope.actorId,
    );
    if (scope.selfOnly && account) return new Set([account.staffId]);
    return new Set(
      store.staff
        .filter(
          (item) =>
            !scope.branchId ||
            item.sharedScope ||
            item.branchIds.includes(scope.branchId),
        )
        .map((item) => item.id),
    );
  }
  private assertStaffScope(
    store: ShonaiStore,
    staffId: string,
    scope: WorkforceScope,
  ) {
    if (!this.allowedStaffIds(store, scope).has(staffId))
      throw new OperationsError(
        "FORBIDDEN",
        "This staff profile is outside your permitted scope.",
      );
  }
  private staff(store: ShonaiStore, id: string) {
    const item = store.staff.find((entry) => entry.id === id);
    if (!item)
      throw new OperationsError("NOT_FOUND", "Staff profile not found.");
    return item;
  }
  private payroll(store: ShonaiStore, id: string) {
    const item = store.payrollRuns.find((entry) => entry.id === id);
    if (!item) throw new OperationsError("NOT_FOUND", "Payroll run not found.");
    return item;
  }
  private payrollVersion(store: ShonaiStore, id: string, version: number) {
    const item = this.payroll(store, id);
    if (item.version !== version)
      throw new OperationsError(
        "CONFLICT",
        "Payroll changed. Refresh and review it.",
      );
    return item;
  }
  private days(start: string, end: string) {
    const value =
      Math.floor(
        (Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) /
          86_400_000,
      ) + 1;
    if (value < 1 || value > 90)
      throw new OperationsError(
        "VALIDATION",
        "Leave dates must span 1 to 90 days.",
      );
    return value;
  }
}
