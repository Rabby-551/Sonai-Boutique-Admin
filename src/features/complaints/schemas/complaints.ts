import { z } from "zod";
import { locationIdSchema } from "@/features/inventory/schemas/inventory";

export const complaintStatusSchema = z.enum([
  "open",
  "acknowledged",
  "in_progress",
  "resolved",
  "closed",
]);

export const complaintNoteSchema = z.object({
  id: z.string().min(1),
  visibility: z.enum(["internal", "customer_update"]),
  body: z.string().min(3).max(1_000),
  actorId: z.string().min(1),
  createdAt: z.string().datetime(),
});

export const complaintAttachmentSchema = z.object({
  id: z.string().min(1),
  fileName: z.string().min(1).max(160),
  mimeType: z.enum(["image/jpeg", "image/png", "application/pdf"]),
  sizeBytes: z.number().int().positive().max(5_000_000),
});

export const complaintTimelineEventSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  detail: z.string().min(1).max(1_000),
  actorId: z.string().min(1),
  occurredAt: z.string().datetime(),
});

export const complaintSchema = z.object({
  id: z.string().min(1),
  caseNumber: z.string().regex(/^CMP-\d{6}-\d{4}$/),
  type: z.enum(["complaint", "query", "support_request"]),
  category: z.enum([
    "product_quality",
    "delivery",
    "payment",
    "return",
    "staff",
    "other",
  ]),
  priority: z.enum(["low", "normal", "high", "urgent"]),
  status: complaintStatusSchema,
  source: z.enum(["phone", "email", "whatsapp", "messenger", "branch"]),
  customerId: z.string().min(1),
  orderId: z.string().nullable(),
  productId: z.string().nullable(),
  returnId: z.string().nullable(),
  locationId: locationIdSchema.nullable(),
  assignedTo: z.string().nullable(),
  dueAt: z.string().datetime().nullable(),
  description: z.string().min(10).max(2_000),
  resolution: z.string().max(2_000).nullable(),
  notes: z.array(complaintNoteSchema),
  attachments: z.array(complaintAttachmentSchema),
  timeline: z.array(complaintTimelineEventSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  version: z.number().int().positive(),
});

export type Complaint = z.infer<typeof complaintSchema>;
export type ComplaintStatus = z.infer<typeof complaintStatusSchema>;
