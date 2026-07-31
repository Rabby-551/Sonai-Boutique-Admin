import { z } from "zod";

export const reportQuerySchema = z.object({
  type: z
    .enum([
      "sales",
      "profit",
      "inventory",
      "campaigns",
      "procurement",
      "payroll",
    ])
    .default("sales"),
  from: z.string().date().optional(),
  to: z.string().date().optional(),
  locationId: z.string().optional(),
  channel: z
    .enum(["all", "website", "whatsapp", "messenger", "phone", "branch"])
    .default("all"),
});

export const reportRowSchema = z.record(
  z.string(),
  z.union([z.string(), z.number()]),
);
export const reportResultSchema = z.object({
  title: z.string(),
  description: z.string(),
  metrics: z.array(
    z.object({
      label: z.string(),
      value: z.number(),
      format: z.enum(["money", "number", "percent"]),
    }),
  ),
  columns: z.array(
    z.object({
      key: z.string(),
      label: z.string(),
      format: z.enum(["text", "money", "number", "date"]),
    }),
  ),
  rows: z.array(reportRowSchema),
});

export type ReportQuery = z.infer<typeof reportQuerySchema>;
export type ReportResult = z.infer<typeof reportResultSchema>;
