import { z } from "zod";

export const previewGateSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  status: z.enum(["ready", "review", "blocked"]),
  evidence: z.string().min(1),
});

export const previewRouteSchema = z.object({
  route: z.string().startsWith("/"),
  label: z.string().min(1),
  purpose: z.string().min(1),
});

export const previewLimitationSchema = z.object({
  id: z.string().min(1),
  area: z.string().min(1),
  limitation: z.string().min(1),
  productionBoundary: z.string().min(1),
});

export const previewReleaseManifestSchema = z.object({
  releaseVersion: z.string().min(3),
  sourceRevision: z.string().min(1),
  builtAt: z.string().datetime().nullable(),
  previewMode: z.boolean(),
  accessPolicy: z.enum(["local", "restricted-host"]),
  dataSource: z.literal("mock"),
  storeSchemaVersion: z.number().int().positive(),
  packageFormatVersion: z.number().int().positive(),
  routeCount: z.number().int().positive(),
  artifactSha256: z.string().length(64).nullable(),
  roles: z.array(z.enum(["Owner", "Manager", "Cashier", "Support"])).length(4),
  gates: z.array(previewGateSchema).min(1),
  reviewRoutes: z.array(previewRouteSchema).min(1),
  limitations: z.array(previewLimitationSchema).min(1),
  handoffSteps: z.array(z.string().min(1)).min(3),
});

export type PreviewGate = z.infer<typeof previewGateSchema>;
export type PreviewRoute = z.infer<typeof previewRouteSchema>;
export type PreviewLimitation = z.infer<typeof previewLimitationSchema>;
export type PreviewReleaseManifest = z.infer<
  typeof previewReleaseManifestSchema
>;
