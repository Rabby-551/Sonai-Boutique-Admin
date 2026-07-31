import { z } from "zod";

export const platformStatusSchema = z.enum([
  "ready",
  "sandbox",
  "attention",
  "blocked",
]);

export const platformServiceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.enum(["application", "data", "security", "operations"]),
  status: platformStatusSchema,
  mode: z.string().min(1),
  detail: z.string().min(1),
  latencyMs: z.number().int().nonnegative().nullable(),
  lastCheckedAt: z.string().datetime(),
});

export const providerIntegrationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(["identity", "payment", "courier", "messaging", "media"]),
  status: platformStatusSchema,
  environment: z.enum(["mock", "sandbox"]),
  successRate: z.number().min(0).max(100),
  eventsToday: z.number().int().nonnegative(),
  lastEventAt: z.string().datetime().nullable(),
  boundary: z.string().min(1),
});

export const migrationRehearsalSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  sourceVersion: z.string().min(1),
  target: z.string().min(1),
  status: z.enum(["passed", "warning", "scheduled"]),
  records: z.number().int().nonnegative(),
  reconciled: z.number().int().nonnegative(),
  warnings: z.number().int().nonnegative(),
  startedAt: z.string().datetime(),
  durationSeconds: z.number().int().nonnegative().nullable(),
  evidence: z.string().min(1),
});

export const releaseGateSchema = z.object({
  id: z.string().min(1),
  area: z.enum([
    "identity",
    "data",
    "providers",
    "security",
    "recovery",
    "people",
  ]),
  label: z.string().min(1),
  status: z.enum(["passed", "review", "blocked"]),
  owner: z.string().min(1),
  evidence: z.string().min(1),
});

export const platformOverviewSchema = z.object({
  generatedAt: z.string().datetime(),
  environment: z.literal("Fictional staging"),
  services: z.array(platformServiceSchema),
  integrations: z.array(providerIntegrationSchema),
  migrations: z.array(migrationRehearsalSchema),
  releaseGates: z.array(releaseGateSchema),
});

export type PlatformOverview = z.infer<typeof platformOverviewSchema>;
export type PlatformService = z.infer<typeof platformServiceSchema>;
export type ProviderIntegration = z.infer<typeof providerIntegrationSchema>;
export type MigrationRehearsal = z.infer<typeof migrationRehearsalSchema>;
export type ReleaseGate = z.infer<typeof releaseGateSchema>;
