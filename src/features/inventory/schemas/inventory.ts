import { z } from "zod";

export const locationIdSchema = z.enum([
  "rupnagar",
  "mirpur-shopping-center",
  "loc-online",
]);
export const stockMovementTypeSchema = z.enum([
  "migration_opening",
  "receipt",
  "adjustment",
  "damage",
  "transfer_out",
  "transfer_in",
  "reservation",
  "reservation_release",
  "sale",
  "return",
  "count_correction",
  "purchase_receipt",
]);

export const inventoryLocationSchema = z.object({
  id: locationIdSchema,
  name: z.string().min(1),
  kind: z.enum(["branch", "online"]),
  active: z.boolean(),
});
export const stockBalanceSchema = z
  .object({
    variantId: z.string().min(1),
    locationId: locationIdSchema,
    onHand: z.number().int().nonnegative(),
    reserved: z.number().int().nonnegative(),
    thresholdOverride: z.number().int().nonnegative().nullable(),
    version: z.number().int().positive(),
  })
  .refine((value) => value.reserved <= value.onHand, {
    message: "Reserved stock cannot exceed on-hand stock.",
  });
export const stockMovementSchema = z.object({
  id: z.string().min(1),
  variantId: z.string().min(1),
  locationId: locationIdSchema,
  type: stockMovementTypeSchema,
  onHandDelta: z.number().int(),
  reservedDelta: z.number().int(),
  reason: z.string().min(3).max(240),
  referenceType: z.string().min(1),
  referenceId: z.string().min(1),
  actorId: z.string().min(1),
  commandId: z.string().min(1),
  occurredAt: z.string().datetime(),
});
export const stockTransferLineSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().positive(),
});
export const stockTransferSchema = z.object({
  id: z.string().min(1),
  sourceLocationId: locationIdSchema,
  destinationLocationId: locationIdSchema,
  lines: z.array(stockTransferLineSchema).min(1),
  status: z.enum(["draft", "in_transit", "received", "cancelled"]),
  note: z.string().max(500),
  createdBy: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  version: z.number().int().positive(),
});
export const stockCountLineSchema = z.object({
  variantId: z.string().min(1),
  expected: z.number().int().nonnegative(),
  counted: z.number().int().nonnegative().nullable(),
});
export const stockCountSchema = z.object({
  id: z.string().min(1),
  locationId: locationIdSchema,
  scope: z.string().min(2).max(120),
  scheduledDate: z.string().date(),
  status: z.enum([
    "scheduled",
    "in_progress",
    "pending_review",
    "approved",
    "cancelled",
  ]),
  lines: z.array(stockCountLineSchema),
  createdBy: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  version: z.number().int().positive(),
});

export type InventoryLocation = z.infer<typeof inventoryLocationSchema>;
export type LocationId = z.infer<typeof locationIdSchema>;
export type StockBalance = z.infer<typeof stockBalanceSchema>;
export type StockMovement = z.infer<typeof stockMovementSchema>;
export type StockMovementType = z.infer<typeof stockMovementTypeSchema>;
export type StockTransfer = z.infer<typeof stockTransferSchema>;
export type StockCount = z.infer<typeof stockCountSchema>;

export interface InventoryRow {
  variantId: string;
  productId: string;
  productName: string;
  sku: string;
  barcode: string;
  color: string;
  size: string;
  unitCostMinor: number;
  threshold: number;
  locations: Record<
    LocationId,
    { onHand: number; reserved: number; thresholdOverride: number | null }
  >;
  balanceVersions: Record<LocationId, number>;
  totalOnHand: number;
  totalReserved: number;
  totalAvailable: number;
  valuationMinor: number;
  status: "healthy" | "low" | "out";
}
