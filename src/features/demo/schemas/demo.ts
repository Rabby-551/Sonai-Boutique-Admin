import { z } from "zod";

export const demoScenarioSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  module: z.string().min(1),
  route: z.string().startsWith("/"),
  role: z.enum(["owner", "manager", "cashier", "support"]),
  outcome: z.string().min(1),
  status: z.enum(["ready", "review"]),
  steps: z.array(z.string().min(1)).min(2),
});

export const demoRoleGuideSchema = z.object({
  role: z.enum(["owner", "manager", "cashier", "support"]),
  label: z.string().min(1),
  startRoute: z.string().startsWith("/"),
  scope: z.string().min(1),
  can: z.array(z.string().min(1)).min(1),
  cannot: z.array(z.string().min(1)).min(1),
});

export const demoCheckSchema = z.object({
  id: z.string().min(1),
  area: z.string().min(1),
  label: z.string().min(1),
  method: z.enum(["automated", "manual"]),
  status: z.enum(["passed", "review"]),
  evidence: z.string().min(1),
});

export const demoWorkspaceSchema = z.object({
  generatedAt: z.string().datetime(),
  environment: z.literal("Deterministic fictional data"),
  scenarios: z.array(demoScenarioSchema).min(1),
  roles: z.array(demoRoleGuideSchema).length(4),
  checks: z.array(demoCheckSchema).min(1),
});

export const routeReadinessSchema = z.object({
  id: z.string().min(1),
  group: z.string().min(1),
  routeCount: z.number().int().positive(),
  owner: z.string().min(1),
  status: z.enum(["passed", "review"]),
  evidence: z.array(z.string().min(1)).min(2),
});

export const freezeRecordSchema = z.object({
  id: z.string().min(1),
  area: z.string().min(1),
  decision: z.string().min(1),
  policy: z.enum(["frozen", "controlled", "external"]),
  changeRequires: z.string().min(1),
});

export const visualCheckpointSchema = z.object({
  id: z.string().min(1),
  route: z.string().startsWith("/"),
  viewport: z.enum(["desktop", "mobile"]),
  width: z.number().int().positive(),
  status: z.literal("passed"),
  baseline: z.string().endsWith(".png"),
});

export const knownLimitationSchema = z.object({
  id: z.string().min(1),
  area: z.string().min(1),
  limitation: z.string().min(1),
  impact: z.string().min(1),
  resolutionBoundary: z.string().min(1),
});

export const acceptanceCheckSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  owner: z.string().min(1),
  evidence: z.string().min(1),
});

export const acceptanceWorkspaceSchema = z.object({
  generatedAt: z.string().datetime(),
  releaseLabel: z.literal("Mock design candidate"),
  routeGroups: z.array(routeReadinessSchema).min(1),
  freezeRecords: z.array(freezeRecordSchema).min(1),
  visualCheckpoints: z.array(visualCheckpointSchema).length(4),
  limitations: z.array(knownLimitationSchema).min(1),
  signoffChecks: z.array(acceptanceCheckSchema).min(1),
});

export type DemoScenario = z.infer<typeof demoScenarioSchema>;
export type DemoRoleGuide = z.infer<typeof demoRoleGuideSchema>;
export type DemoCheck = z.infer<typeof demoCheckSchema>;
export type DemoWorkspace = z.infer<typeof demoWorkspaceSchema>;
export type RouteReadiness = z.infer<typeof routeReadinessSchema>;
export type FreezeRecord = z.infer<typeof freezeRecordSchema>;
export type VisualCheckpoint = z.infer<typeof visualCheckpointSchema>;
export type KnownLimitation = z.infer<typeof knownLimitationSchema>;
export type AcceptanceCheck = z.infer<typeof acceptanceCheckSchema>;
export type AcceptanceWorkspace = z.infer<typeof acceptanceWorkspaceSchema>;
