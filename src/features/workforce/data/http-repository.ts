import { env } from "@/lib/env";
import { OperationsClient } from "@/lib/http/operations-client";
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
export class HttpWorkforceRepository implements WorkforceRepository {
  private readonly client = new OperationsClient(
    `${env.API_BASE_URL}/workforce`,
  );
  listAttendance(
    input: { month?: string; staffId?: string; status?: string },
    scope: WorkforceScope,
  ) {
    return this.post<AttendanceRecord[]>("/attendance/query", { input, scope });
  }
  recordAttendance(
    input: AttendanceInput,
    expectedVersion: number | null,
    scope: WorkforceScope,
  ) {
    return this.post<AttendanceRecord>("/attendance", {
      input,
      expectedVersion,
      scope,
    });
  }
  listLeave(scope: WorkforceScope) {
    return this.post<LeaveRequest[]>("/leave/query", { scope });
  }
  createLeave(
    input: {
      staffId: string;
      startDate: string;
      endDate: string;
      reason: string;
    },
    scope: WorkforceScope,
  ) {
    return this.post<LeaveRequest>("/leave", { input, scope });
  }
  decideLeave(
    id: string,
    decision: "approved" | "rejected",
    reason: string,
    expectedVersion: number,
    actorId: string,
  ) {
    return this.post<LeaveRequest>(`/leave/${id}`, {
      decision,
      reason,
      expectedVersion,
      actorId,
    });
  }
  listSalaryRecords(staffId?: string) {
    return this.client.request<SalaryRecord[]>(
      `/salary${staffId ? `?staffId=${staffId}` : ""}`,
    );
  }
  setSalary(
    input: Omit<SalaryRecord, "id" | "createdAt" | "createdBy">,
    actorId: string,
  ) {
    return this.post<SalaryRecord>("/salary", { input, actorId });
  }
  listPayroll() {
    return this.client.request<PayrollRun[]>("/payroll");
  }
  getPayroll(id: string) {
    return this.client.request<PayrollRun>(`/payroll/${id}`);
  }
  createPayroll(
    input: { month: string; locationId: string | null },
    actorId: string,
  ) {
    return this.post<PayrollRun>("/payroll", { input, actorId });
  }
  adjustPayroll(
    id: string,
    staffId: string,
    adjustmentMinor: number,
    reason: string,
    expectedVersion: number,
    actorId: string,
  ) {
    return this.post<PayrollRun>(`/payroll/${id}/adjust`, {
      staffId,
      adjustmentMinor,
      reason,
      expectedVersion,
      actorId,
    });
  }
  transitionPayroll(
    id: string,
    next: "submitted" | "approved" | "paid",
    expectedVersion: number,
    commandId: string,
    actorId: string,
  ) {
    return this.post<PayrollRun>(`/payroll/${id}/${next}`, {
      expectedVersion,
      commandId,
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
