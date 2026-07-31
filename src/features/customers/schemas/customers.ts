import { z } from "zod";

export const customerAddressSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(2).max(40),
  address: z.string().min(8).max(500),
});

export const customerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2).max(120),
  phone: z.string().regex(/^\+8801\d{9}$/),
  email: z.string().email().nullable(),
  birthday: z.string().date().nullable(),
  notes: z.string().max(1_000),
  status: z.enum(["active", "archived"]),
  kind: z.enum(["guest", "registered"]),
  loyaltyEnrolledAt: z.string().datetime().nullable(),
  addresses: z.array(customerAddressSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  version: z.number().int().positive(),
});

export const loyaltySettingsSchema = z.object({
  spendPerPointMinor: z.number().int().positive(),
  pointsPerUnit: z.number().int().positive(),
  version: z.number().int().positive(),
  updatedAt: z.string().datetime(),
  updatedBy: z.string().min(1),
});

export const loyaltyTransactionSchema = z.object({
  id: z.string().min(1),
  customerId: z.string().min(1),
  type: z.enum(["earn", "reversal", "adjustment"]),
  points: z.number().int(),
  reason: z.string().min(3).max(300),
  orderId: z.string().nullable(),
  returnId: z.string().nullable(),
  spendPerPointMinor: z.number().int().positive().nullable(),
  pointsPerUnit: z.number().int().positive().nullable(),
  actorId: z.string().min(1),
  commandId: z.string().min(1),
  occurredAt: z.string().datetime(),
});

export type Customer = z.infer<typeof customerSchema>;
export type LoyaltySettings = z.infer<typeof loyaltySettingsSchema>;
export type LoyaltyTransaction = z.infer<typeof loyaltyTransactionSchema>;
