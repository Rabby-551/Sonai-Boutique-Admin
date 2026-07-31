import { z } from "zod";
import { locationIdSchema } from "@/features/inventory/schemas/inventory";

export const supplierVariantSchema = z.object({
  variantId: z.string().min(1),
  supplierSku: z.string().min(1).max(80),
  minimumQuantity: z.number().int().positive(),
  lastUnitCostMinor: z.number().int().nonnegative(),
  leadTimeDays: z.number().int().nonnegative().max(365),
});

export const supplierSchema = z.object({
  id: z.string().min(1),
  code: z.string().regex(/^SUP-\d{4}$/),
  name: z.string().min(2).max(160),
  contactName: z.string().min(2).max(120),
  phone: z.string().min(7).max(30),
  email: z.string().email().nullable(),
  address: z.string().min(8).max(500),
  paymentTerms: z.string().min(2).max(160),
  leadTimeDays: z.number().int().nonnegative().max(365),
  notes: z.string().max(1_000),
  status: z.enum(["active", "inactive", "archived"]),
  variants: z.array(supplierVariantSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  version: z.number().int().positive(),
});

export const purchaseOrderLineSchema = z.object({
  variantId: z.string().min(1),
  sku: z.string().min(1),
  productName: z.string().min(1),
  supplierSku: z.string().min(1),
  orderedQuantity: z.number().int().positive(),
  unitCostMinor: z.number().int().nonnegative(),
  acceptedQuantity: z.number().int().nonnegative(),
  damagedQuantity: z.number().int().nonnegative(),
  rejectedQuantity: z.number().int().nonnegative(),
});

export const purchaseReceiptLineSchema = z.object({
  variantId: z.string().min(1),
  acceptedQuantity: z.number().int().nonnegative(),
  damagedQuantity: z.number().int().nonnegative(),
  rejectedQuantity: z.number().int().nonnegative(),
});

export const purchaseReceiptSchema = z.object({
  id: z.string().min(1),
  purchaseOrderId: z.string().min(1),
  lines: z.array(purchaseReceiptLineSchema).min(1),
  reference: z.string().min(2).max(160),
  note: z.string().max(500),
  actorId: z.string().min(1),
  commandId: z.string().min(1),
  receivedAt: z.string().datetime(),
});

export const purchaseOrderEventSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  detail: z.string().min(1).max(1_000),
  actorId: z.string().min(1),
  occurredAt: z.string().datetime(),
});

export const purchaseOrderStatusSchema = z.enum([
  "draft",
  "submitted",
  "approved",
  "rejected",
  "supplier_confirmed",
  "in_transit",
  "partially_received",
  "received",
  "closed",
  "cancelled",
]);

export const purchaseOrderSchema = z.object({
  id: z.string().min(1),
  orderNumber: z.string().regex(/^PO-\d{6}-\d{4}$/),
  supplierId: z.string().min(1),
  destinationLocationId: locationIdSchema,
  expectedDeliveryDate: z.string().date(),
  status: purchaseOrderStatusSchema,
  lines: z.array(purchaseOrderLineSchema).min(1),
  shippingMinor: z.number().int().nonnegative(),
  otherMinor: z.number().int().nonnegative(),
  subtotalMinor: z.number().int().nonnegative(),
  totalMinor: z.number().int().nonnegative(),
  supplierReference: z.string().max(160).nullable(),
  shipmentReference: z.string().max(160).nullable(),
  note: z.string().max(1_000),
  receipts: z.array(purchaseReceiptSchema),
  timeline: z.array(purchaseOrderEventSchema),
  createdBy: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  version: z.number().int().positive(),
});

export type Supplier = z.infer<typeof supplierSchema>;
export type PurchaseOrder = z.infer<typeof purchaseOrderSchema>;
export type PurchaseOrderStatus = z.infer<typeof purchaseOrderStatusSchema>;
export type PurchaseReceipt = z.infer<typeof purchaseReceiptSchema>;
