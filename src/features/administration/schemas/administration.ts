import { z } from "zod";

export const staffStatusSchema = z.enum(["active", "on_leave", "terminated"]);
export const staffSchema = z.object({
  id: z.string().min(1),
  employeeCode: z.string().min(1),
  name: z.string().min(2).max(120),
  phone: z.string().min(7).max(30),
  email: z.string().email().nullable(),
  role: z.enum(["owner", "manager", "cashier", "support"]),
  branchIds: z.array(z.string().min(1)),
  sharedScope: z.boolean(),
  hireDate: z.string().date(),
  status: staffStatusSchema,
  salaryGrade: z.string().min(1).max(40),
  notes: z.string().max(1_000),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  version: z.number().int().positive(),
});

export const userAccountSchema = z.object({
  id: z.string().min(1),
  staffId: z.string().min(1),
  username: z.string().min(3).max(120),
  role: z.enum(["owner", "manager", "cashier", "support"]),
  active: z.boolean(),
  passwordResetRequestedAt: z.string().datetime().nullable(),
  lastLoginAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  version: z.number().int().positive(),
});

export const roleProfileSchema = z.object({
  role: z.enum(["owner", "manager", "cashier", "support"]),
  label: z.string().min(2).max(80),
  permissions: z.array(z.string().min(1)),
  version: z.number().int().positive(),
  updatedAt: z.string().datetime(),
  updatedBy: z.string().min(1),
});

export const auditEventSchema = z.object({
  id: z.string().min(1),
  module: z.string().min(1).max(80),
  action: z.string().min(1).max(100),
  entityType: z.string().min(1).max(80),
  entityId: z.string().min(1),
  actorId: z.string().min(1),
  branchId: z.string().nullable(),
  summary: z.string().min(2).max(500),
  metadata: z.record(
    z.string(),
    z.union([z.string(), z.number(), z.boolean(), z.null()]),
  ),
  occurredAt: z.string().datetime(),
});

export const businessSettingsSchema = z.object({
  businessName: z.string().min(2).max(120),
  timezone: z.literal("Asia/Dhaka"),
  currency: z.literal("BDT"),
  defaultLocationId: z.string().min(1),
  deliveryChargeMinor: z.number().int().nonnegative(),
  defaultLowStockThreshold: z.number().int().nonnegative(),
  payrollWorkingDays: z.number().int().min(1).max(31),
  supportEmail: z.string().email(),
  version: z.number().int().positive(),
  updatedAt: z.string().datetime(),
  updatedBy: z.string().min(1),
});

export type Staff = z.infer<typeof staffSchema>;
export type UserAccount = z.infer<typeof userAccountSchema>;
export type RoleProfile = z.infer<typeof roleProfileSchema>;
export type AuditEvent = z.infer<typeof auditEventSchema>;
export type BusinessSettings = z.infer<typeof businessSettingsSchema>;
