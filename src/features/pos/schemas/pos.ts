import { z } from "zod";
import { locationIdSchema } from "@/features/inventory/schemas/inventory";

export const paymentProviderSchema = z.object({
  id: z.string().min(1),
  category: z.enum(["card", "mfs"]),
  code: z.string().min(2).max(40),
  name: z.string().min(2).max(80),
  active: z.boolean(),
  sortOrder: z.number().int().nonnegative(),
  version: z.number().int().positive(),
});

export const posRegisterSchema = z.object({
  id: z.string().min(1),
  locationId: locationIdSchema,
  code: z.string().min(2).max(30),
  name: z.string().min(2).max(80),
  active: z.boolean(),
  version: z.number().int().positive(),
});

export const registerShiftSchema = z.object({
  id: z.string().min(1),
  registerId: z.string().min(1),
  locationId: locationIdSchema,
  cashierId: z.string().min(1),
  status: z.enum(["open", "closed"]),
  openingFloatMinor: z.number().int().nonnegative(),
  countedCashMinor: z.number().int().nonnegative().nullable(),
  expectedCashMinor: z.number().int().nonnegative().nullable(),
  varianceMinor: z.number().int().nullable(),
  openedAt: z.string().datetime(),
  closedAt: z.string().datetime().nullable(),
  closedBy: z.string().nullable(),
  closeReason: z.string().max(300).nullable(),
  version: z.number().int().positive(),
});

export const posTenderSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["cash", "card", "mfs"]),
  direction: z.enum(["payment", "refund"]),
  providerId: z.string().nullable(),
  reference: z.string().max(120).nullable(),
  amountMinor: z.number().int().positive(),
  receivedMinor: z.number().int().nonnegative().nullable(),
  changeMinor: z.number().int().nonnegative(),
  recordedAt: z.string().datetime(),
});

export const posSaleLineSchema = z.object({
  variantId: z.string().min(1),
  sku: z.string().min(1),
  barcode: z.string().min(1),
  productName: z.string().min(1),
  variantLabel: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPriceMinor: z.number().int().nonnegative(),
  discountMinor: z.number().int().nonnegative(),
  lineTotalMinor: z.number().int().nonnegative(),
  refundableUnitMinor: z.number().int().nonnegative(),
  unitCostMinor: z.number().int().nonnegative(),
});

export const posReturnLineSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().positive(),
  disposition: z.enum(["restock", "damaged"]),
  refundMinor: z.number().int().nonnegative(),
});

export const posReturnSchema = z.object({
  id: z.string().min(1),
  saleId: z.string().nullable(),
  receiptNumber: z.string().nullable(),
  locationId: locationIdSchema,
  shiftId: z.string().min(1),
  status: z.enum(["pending", "approved", "rejected", "completed"]),
  reason: z.string().min(3).max(300),
  noReceipt: z.boolean(),
  lines: z.array(posReturnLineSchema).min(1),
  refundTenders: z.array(posTenderSchema),
  totalRefundMinor: z.number().int().nonnegative(),
  requestedBy: z.string().min(1),
  approvedBy: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  version: z.number().int().positive(),
});

export const posExchangeSchema = z.object({
  id: z.string().min(1),
  returnId: z.string().min(1),
  replacementSaleId: z.string().min(1),
  creditMinor: z.number().int().nonnegative(),
  replacementMinor: z.number().int().nonnegative(),
  netMinor: z.number().int(),
  approvedBy: z.string().min(1),
  createdAt: z.string().datetime(),
});

export const posApprovalSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["discount", "return", "no_receipt_return", "exchange"]),
  status: z.enum(["pending", "approved", "rejected"]),
  entityId: z.string().min(1),
  fingerprint: z.string().min(1),
  reason: z.string().min(3).max(300),
  amountMinor: z.number().int().nonnegative(),
  requestedBy: z.string().min(1),
  decidedBy: z.string().nullable(),
  createdAt: z.string().datetime(),
  decidedAt: z.string().datetime().nullable(),
  version: z.number().int().positive(),
});

export const posSaleSchema = z.object({
  id: z.string().min(1),
  receiptNumber: z.string().regex(/^POS-\d{6}-\d{4}$/),
  locationId: locationIdSchema,
  registerId: z.string().min(1),
  shiftId: z.string().min(1),
  cashierId: z.string().min(1),
  customerId: z.string().nullable(),
  customer: z
    .object({ name: z.string().min(2), phone: z.string().min(7) })
    .nullable(),
  lines: z.array(posSaleLineSchema).min(1),
  subtotalMinor: z.number().int().nonnegative(),
  campaignDiscountMinor: z.number().int().nonnegative(),
  manualDiscountMinor: z.number().int().nonnegative(),
  manualDiscountReason: z.string().max(300).nullable(),
  approvalId: z.string().nullable(),
  totalMinor: z.number().int().nonnegative(),
  tenders: z.array(posTenderSchema),
  status: z.enum(["completed", "partially_refunded", "refunded"]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  version: z.number().int().positive(),
});

export const posSettingsSchema = z.object({
  allowNoReceiptReturns: z.boolean(),
  receiptFooter: z.string().min(2).max(300),
  version: z.number().int().positive(),
  updatedAt: z.string().datetime(),
  updatedBy: z.string().min(1),
});

export type PaymentProvider = z.infer<typeof paymentProviderSchema>;
export type PosRegister = z.infer<typeof posRegisterSchema>;
export type RegisterShift = z.infer<typeof registerShiftSchema>;
export type PosTender = z.infer<typeof posTenderSchema>;
export type PosSaleLine = z.infer<typeof posSaleLineSchema>;
export type PosSale = z.infer<typeof posSaleSchema>;
export type PosReturn = z.infer<typeof posReturnSchema>;
export type PosExchange = z.infer<typeof posExchangeSchema>;
export type PosApproval = z.infer<typeof posApprovalSchema>;
export type PosSettings = z.infer<typeof posSettingsSchema>;
