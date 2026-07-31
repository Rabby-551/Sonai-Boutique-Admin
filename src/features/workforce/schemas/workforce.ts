import { z } from "zod";

export const attendanceStatusSchema = z.enum([
  "present",
  "absent",
  "leave",
  "weekend",
]);
export const attendanceRecordSchema = z.object({
  id: z.string().min(1),
  staffId: z.string().min(1),
  date: z.string().date(),
  status: attendanceStatusSchema,
  checkIn: z.string().datetime().nullable(),
  checkOut: z.string().datetime().nullable(),
  note: z.string().max(500),
  recordedBy: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  version: z.number().int().positive(),
});

export const leaveRequestSchema = z.object({
  id: z.string().min(1),
  staffId: z.string().min(1),
  startDate: z.string().date(),
  endDate: z.string().date(),
  days: z.number().int().positive(),
  reason: z.string().min(3).max(500),
  status: z.enum(["pending", "approved", "rejected"]),
  decisionReason: z.string().max(500).nullable(),
  decidedBy: z.string().nullable(),
  decidedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  version: z.number().int().positive(),
});

export const salaryRecordSchema = z.object({
  id: z.string().min(1),
  staffId: z.string().min(1),
  effectiveFrom: z.string().date(),
  baseSalaryMinor: z.number().int().nonnegative(),
  fixedAllowanceMinor: z.number().int().nonnegative(),
  fixedDeductionMinor: z.number().int().nonnegative(),
  grade: z.string().min(1).max(40),
  note: z.string().max(500),
  createdBy: z.string().min(1),
  createdAt: z.string().datetime(),
});

export const payrollLineSchema = z.object({
  staffId: z.string().min(1),
  staffName: z.string().min(2),
  baseSalaryMinor: z.number().int().nonnegative(),
  allowanceMinor: z.number().int().nonnegative(),
  fixedDeductionMinor: z.number().int().nonnegative(),
  absenceDays: z.number().int().nonnegative(),
  absenceDeductionMinor: z.number().int().nonnegative(),
  adjustmentMinor: z.number().int(),
  adjustmentReason: z.string().max(500),
  netPayMinor: z.number().int().nonnegative(),
});

export const payrollRunSchema = z.object({
  id: z.string().min(1),
  payrollNumber: z.string().min(1),
  month: z.string().regex(/^\d{4}-\d{2}$/),
  locationId: z.string().nullable(),
  status: z.enum(["draft", "submitted", "approved", "paid"]),
  workingDays: z.number().int().min(1).max(31),
  lines: z.array(payrollLineSchema).min(1),
  grossMinor: z.number().int().nonnegative(),
  deductionsMinor: z.number().int().nonnegative(),
  netMinor: z.number().int().nonnegative(),
  submittedBy: z.string().nullable(),
  submittedAt: z.string().datetime().nullable(),
  approvedBy: z.string().nullable(),
  approvedAt: z.string().datetime().nullable(),
  paidBy: z.string().nullable(),
  paidAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  version: z.number().int().positive(),
});

export type AttendanceRecord = z.infer<typeof attendanceRecordSchema>;
export type LeaveRequest = z.infer<typeof leaveRequestSchema>;
export type SalaryRecord = z.infer<typeof salaryRecordSchema>;
export type PayrollRun = z.infer<typeof payrollRunSchema>;
