import { z } from "zod";

export const campaignSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(2).max(40),
  name: z.string().min(2).max(140),
  description: z.string().max(1_000),
  status: z.enum([
    "draft",
    "scheduled",
    "active",
    "paused",
    "ended",
    "archived",
  ]),
  scope: z.enum(["store", "category", "product", "variant"]),
  targetIds: z.array(z.string().min(1)),
  percentageOff: z.number().int().min(1).max(40),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  priority: z.number().int().min(0).max(100),
  budgetMinor: z.number().int().nonnegative().nullable(),
  usageLimit: z.number().int().positive().nullable(),
  estimatedCostMinor: z.number().int().nonnegative(),
  createdBy: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  version: z.number().int().positive(),
});

export const campaignMutationSchema = campaignSchema.pick({
  name: true,
  description: true,
  scope: true,
  targetIds: true,
  percentageOff: true,
  startsAt: true,
  endsAt: true,
  priority: true,
  budgetMinor: true,
  usageLimit: true,
  estimatedCostMinor: true,
});

export type Campaign = z.infer<typeof campaignSchema>;
export type CampaignMutationInput = z.infer<typeof campaignMutationSchema>;
