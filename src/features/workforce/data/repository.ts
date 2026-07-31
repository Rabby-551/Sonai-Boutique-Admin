import type {
  AttendanceRecord,
  LeaveRequest,
  PayrollRun,
  SalaryRecord,
} from "../schemas/workforce";

export interface WorkforceScope {
  actorId: string;
  branchId: string | null;
  selfOnly?: boolean;
}
export interface AttendanceInput {
  staffId: string;
  date: string;
  status: AttendanceRecord["status"];
  checkIn: string | null;
  checkOut: string | null;
  note: string;
}

/** Workforce contract for attendance, leave, effective salary, and approved payroll snapshots. */
export interface WorkforceRepository {
  listAttendance(
    input: { month?: string; staffId?: string; status?: string },
    scope: WorkforceScope,
  ): Promise<AttendanceRecord[]>;
  recordAttendance(
    input: AttendanceInput,
    expectedVersion: number | null,
    scope: WorkforceScope,
  ): Promise<AttendanceRecord>;
  listLeave(scope: WorkforceScope): Promise<LeaveRequest[]>;
  createLeave(
    input: {
      staffId: string;
      startDate: string;
      endDate: string;
      reason: string;
    },
    scope: WorkforceScope,
  ): Promise<LeaveRequest>;
  decideLeave(
    id: string,
    decision: "approved" | "rejected",
    reason: string,
    expectedVersion: number,
    actorId: string,
  ): Promise<LeaveRequest>;
  listSalaryRecords(staffId?: string): Promise<SalaryRecord[]>;
  setSalary(
    input: Omit<SalaryRecord, "id" | "createdAt" | "createdBy">,
    actorId: string,
  ): Promise<SalaryRecord>;
  listPayroll(): Promise<PayrollRun[]>;
  getPayroll(id: string): Promise<PayrollRun>;
  createPayroll(
    input: { month: string; locationId: string | null },
    actorId: string,
  ): Promise<PayrollRun>;
  adjustPayroll(
    id: string,
    staffId: string,
    adjustmentMinor: number,
    reason: string,
    expectedVersion: number,
    actorId: string,
  ): Promise<PayrollRun>;
  transitionPayroll(
    id: string,
    next: "submitted" | "approved" | "paid",
    expectedVersion: number,
    commandId: string,
    actorId: string,
  ): Promise<PayrollRun>;
}
