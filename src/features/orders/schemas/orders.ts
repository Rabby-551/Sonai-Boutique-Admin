import { z } from "zod";
import { locationIdSchema } from "@/features/inventory/schemas/inventory";

export const orderStatusSchema = z.enum([
  "placed",
  "confirmed",
  "picking",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
]);
export const paymentStatusSchema = z.enum([
  "pending",
  "paid",
  "failed",
  "partially_refunded",
  "refunded",
]);
export const paymentMethodSchema = z.enum([
  "cash",
  "cod",
  "bkash",
  "nagad",
  "card",
]);
export const orderLineSchema = z.object({
  variantId: z.string().min(1),
  sku: z.string().min(1),
  productName: z.string().min(1),
  variantLabel: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPriceMinor: z.number().int().nonnegative(),
  unitCostMinor: z.number().int().nonnegative(),
});
export const orderTimelineEventSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  label: z.string().min(1),
  detail: z.string().max(500),
  actorId: z.string().min(1),
  occurredAt: z.string().datetime(),
});
export const paymentAttemptSchema = z.object({
  id: z.string().min(1),
  method: paymentMethodSchema,
  amountMinor: z.number().int().nonnegative(),
  status: paymentStatusSchema,
  providerReference: z.string().min(1),
  createdAt: z.string().datetime(),
});
export const shipmentSchema = z.object({
  id: z.string().min(1),
  courier: z.string().min(1),
  trackingReference: z.string().min(1),
  status: z.enum([
    "label_created",
    "in_transit",
    "out_for_delivery",
    "delivered",
    "failed",
    "returned",
  ]),
  createdAt: z.string().datetime(),
});
export const returnLineSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().positive(),
});
export const orderReturnSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["requested", "approved", "received", "rejected"]),
  lines: z.array(returnLineSchema).min(1),
  reason: z.string().min(3).max(300),
  refundMinor: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  version: z.number().int().positive(),
});
export const orderSchema = z.object({
  id: z.string().min(1),
  customerId: z.string().min(1),
  orderNumber: z.string().regex(/^(?:SH-\d{6}-\d{4}|SN-\d{4}-\d{6})$/),
  source: z.enum(["website", "whatsapp", "messenger", "phone", "branch"]),
  customer: z.object({
    name: z.string().min(2).max(120),
    phone: z.string().regex(/^\+8801\d{9}$/),
    email: z.string().email().nullable(),
  }),
  deliveryAddress: z.string().min(8).max(500).nullable(),
  fulfillmentLocationId: locationIdSchema.nullable(),
  lines: z.array(orderLineSchema).min(1),
  campaignId: z.string().nullable().default(null),
  discountMinor: z.number().int().nonnegative().default(0),
  subtotalMinor: z.number().int().nonnegative(),
  deliveryMinor: z.number().int().nonnegative(),
  totalMinor: z.number().int().nonnegative(),
  paymentMethod: paymentMethodSchema,
  paymentStatus: paymentStatusSchema,
  status: orderStatusSchema,
  notes: z.string().max(1_000),
  timeline: z.array(orderTimelineEventSchema),
  payments: z.array(paymentAttemptSchema),
  shipment: shipmentSchema.nullable(),
  returns: z.array(orderReturnSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  version: z.number().int().positive(),
});

export type Order = z.infer<typeof orderSchema>;
export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type OrderReturn = z.infer<typeof orderReturnSchema>;
