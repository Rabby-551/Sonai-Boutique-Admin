import { z } from "zod";
import {
  categorySchema,
  productSchema,
} from "@/features/catalog/schemas/catalog";
import {
  inventoryLocationSchema,
  stockBalanceSchema,
  stockCountSchema,
  stockMovementSchema,
  stockTransferSchema,
} from "@/features/inventory/schemas/inventory";
import { orderSchema } from "@/features/orders/schemas/orders";
import {
  customerSchema,
  loyaltySettingsSchema,
  loyaltyTransactionSchema,
} from "@/features/customers/schemas/customers";
import { complaintSchema } from "@/features/complaints/schemas/complaints";
import {
  purchaseOrderSchema,
  supplierSchema,
} from "@/features/procurement/schemas/procurement";
import {
  auditEventSchema,
  businessSettingsSchema,
  roleProfileSchema,
  staffSchema,
  userAccountSchema,
} from "@/features/administration/schemas/administration";
import {
  attendanceRecordSchema,
  leaveRequestSchema,
  payrollRunSchema,
  salaryRecordSchema,
} from "@/features/workforce/schemas/workforce";
import { campaignSchema } from "@/features/campaigns/schemas/campaigns";

export const shonaiStoreV2Schema = z.object({
  schemaVersion: z.literal(2),
  products: z.array(productSchema),
  categories: z.array(categorySchema),
  locations: z.array(inventoryLocationSchema),
  balances: z.array(stockBalanceSchema),
  movements: z.array(stockMovementSchema),
  transfers: z.array(stockTransferSchema),
  counts: z.array(stockCountSchema),
  orders: z.array(orderSchema.omit({ customerId: true })),
  processedCommands: z.array(z.string().min(1)),
  orderSequences: z.record(z.string(), z.number().int().nonnegative()),
});

export const shonaiStoreV3Schema = z.object({
  schemaVersion: z.literal(3),
  products: z.array(productSchema),
  categories: z.array(categorySchema),
  locations: z.array(inventoryLocationSchema),
  balances: z.array(stockBalanceSchema),
  movements: z.array(stockMovementSchema),
  transfers: z.array(stockTransferSchema),
  counts: z.array(stockCountSchema),
  orders: z.array(orderSchema),
  customers: z.array(customerSchema),
  loyaltySettings: loyaltySettingsSchema,
  loyaltyTransactions: z.array(loyaltyTransactionSchema),
  complaints: z.array(complaintSchema),
  complaintSequences: z.record(z.string(), z.number().int().nonnegative()),
  suppliers: z.array(supplierSchema),
  purchaseOrders: z.array(purchaseOrderSchema),
  purchaseOrderSequences: z.record(z.string(), z.number().int().nonnegative()),
  processedCommands: z.array(z.string().min(1)),
  orderSequences: z.record(z.string(), z.number().int().nonnegative()),
});

export const shonaiStoreSchema = shonaiStoreV3Schema.extend({
  schemaVersion: z.literal(4),
  staff: z.array(staffSchema),
  userAccounts: z.array(userAccountSchema),
  roleProfiles: z.array(roleProfileSchema),
  attendanceRecords: z.array(attendanceRecordSchema),
  leaveRequests: z.array(leaveRequestSchema),
  salaryRecords: z.array(salaryRecordSchema),
  payrollRuns: z.array(payrollRunSchema),
  payrollSequences: z.record(z.string(), z.number().int().nonnegative()),
  campaigns: z.array(campaignSchema),
  campaignSequences: z.number().int().nonnegative(),
  auditEvents: z.array(auditEventSchema),
  businessSettings: businessSettingsSchema,
});

export type ShonaiStore = z.infer<typeof shonaiStoreSchema>;
export type ShonaiStoreV2 = z.infer<typeof shonaiStoreV2Schema>;
export type ShonaiStoreV3 = z.infer<typeof shonaiStoreV3Schema>;
