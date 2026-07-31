import { z } from "zod";

const metricSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  note: z.string().min(1),
  tone: z.enum(["positive", "neutral", "warning"]),
});

const forecastPointSchema = z.object({
  week: z.string().min(1),
  actual: z.number().int().nonnegative().nullable(),
  forecast: z.number().int().nonnegative(),
  lower: z.number().int().nonnegative(),
  upper: z.number().int().nonnegative(),
});

const reorderSuggestionSchema = z.object({
  id: z.string().min(1),
  sku: z.string().min(1),
  product: z.string().min(1),
  location: z.string().min(1),
  available: z.number().int().nonnegative(),
  incoming: z.number().int().nonnegative(),
  leadTimeDays: z.number().int().positive(),
  suggested: z.number().int().positive(),
  confidence: z.enum(["high", "medium", "low"]),
  status: z.enum(["review", "accepted", "deferred"]),
  explanation: z.string().min(1),
});

const supplierScorecardSchema = z.object({
  id: z.string().min(1),
  supplier: z.string().min(1),
  score: z.number().min(0).max(100),
  sampleSize: z.number().int().nonnegative(),
  onTimeRate: z.number().min(0).max(100),
  fillRate: z.number().min(0).max(100),
  rejectionRate: z.number().min(0).max(100),
  leadTimeDays: z.number().nonnegative(),
  status: z.enum(["strong", "watch", "insufficient_data"]),
});

const customerSegmentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  customers: z.number().int().nonnegative(),
  consentEligible: z.number().int().nonnegative(),
  refresh: z.string().min(1),
  status: z.enum(["active", "draft", "paused"]),
  rules: z.array(z.string().min(1)).min(1),
});

const rewardProgramSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(["redemption", "voucher", "birthday"]),
  status: z.enum(["active", "scheduled", "draft"]),
  eligibility: z.string().min(1),
  value: z.string().min(1),
  issued: z.number().int().nonnegative(),
  redeemed: z.number().int().nonnegative(),
  liabilityMinor: z.number().int().nonnegative(),
});

const privacyRequestSchema = z.object({
  id: z.string().min(1),
  customer: z.string().min(1),
  type: z.enum(["export", "merge", "anonymize"]),
  status: z.enum(["identity_check", "review", "legal_hold", "completed"]),
  requestedAt: z.string().datetime(),
  dueAt: z.string().datetime(),
  owner: z.string().min(1),
  detail: z.string().min(1),
});

const reconciliationItemSchema = z.object({
  id: z.string().min(1),
  providerReference: z.string().min(1),
  orderNumber: z.string().nullable(),
  providerMinor: z.number().int(),
  internalMinor: z.number().int().nullable(),
  differenceMinor: z.number().int(),
  status: z.enum([
    "matched",
    "amount_mismatch",
    "missing_internal",
    "duplicate",
  ]),
  reason: z.string().min(1),
});

const reconciliationRunSchema = z.object({
  id: z.string().min(1),
  provider: z.string().min(1),
  settlementDate: z.string().date(),
  status: z.enum(["completed", "review_required", "processing"]),
  received: z.number().int().nonnegative(),
  matched: z.number().int().nonnegative(),
  exceptions: z.number().int().nonnegative(),
  totalMinor: z.number().int().nonnegative(),
  items: z.array(reconciliationItemSchema),
});

const reportScheduleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  report: z.string().min(1),
  cadence: z.string().min(1),
  recipients: z.array(z.string().min(1)),
  format: z.enum(["XLSX", "PDF", "XLSX + PDF"]),
  nextRunAt: z.string().datetime(),
  lastStatus: z.enum(["delivered", "failed", "scheduled"]),
  scope: z.string().min(1),
});

const channelConnectionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(["storefront", "whatsapp", "messenger", "marketplace"]),
  status: z.enum(["healthy", "attention", "paused"]),
  mode: z.literal("fictional sandbox"),
  reviewQueue: z.number().int().nonnegative(),
  conflicts: z.number().int().nonnegative(),
  lastSyncAt: z.string().datetime(),
  detail: z.string().min(1),
});

const automationRuleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  trigger: z.string().min(1),
  condition: z.string().min(1),
  action: z.string().min(1),
  status: z.enum(["active", "draft", "paused"]),
  approval: z.enum(["approved", "review_required"]),
  runs: z.number().int().nonnegative(),
  failures: z.number().int().nonnegative(),
  lastRunAt: z.string().datetime().nullable(),
});

const slaPolicySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  appliesTo: z.string().min(1),
  acknowledgeMinutes: z.number().int().positive(),
  resolveHours: z.number().int().positive(),
  escalation: z.string().min(1),
  status: z.enum(["active", "draft"]),
  currentBreaches: z.number().int().nonnegative(),
});

const localizationAreaSchema = z.object({
  id: z.string().min(1),
  area: z.string().min(1),
  keys: z.number().int().positive(),
  translated: z.number().int().nonnegative(),
  reviewed: z.number().int().nonnegative(),
  status: z.enum(["ready", "in_review", "not_started"]),
  sampleEnglish: z.string().min(1),
  sampleBangla: z.string().min(1),
});

export const optimizationWorkspaceSchema = z.object({
  generatedAt: z.string().datetime(),
  dataWindow: z.string().min(1),
  metrics: z.array(metricSchema),
  forecast: z.array(forecastPointSchema),
  reorderSuggestions: z.array(reorderSuggestionSchema),
  supplierScorecards: z.array(supplierScorecardSchema),
  segments: z.array(customerSegmentSchema),
  rewards: z.array(rewardProgramSchema),
  privacyRequests: z.array(privacyRequestSchema),
  reconciliationRuns: z.array(reconciliationRunSchema),
  reportSchedules: z.array(reportScheduleSchema),
  channels: z.array(channelConnectionSchema),
  automationRules: z.array(automationRuleSchema),
  slaPolicies: z.array(slaPolicySchema),
  localizationAreas: z.array(localizationAreaSchema),
});

export type OptimizationWorkspace = z.infer<typeof optimizationWorkspaceSchema>;
export type OptimizationMetric = z.infer<typeof metricSchema>;
export type ForecastPoint = z.infer<typeof forecastPointSchema>;
export type ReorderSuggestion = z.infer<typeof reorderSuggestionSchema>;
export type SupplierScorecard = z.infer<typeof supplierScorecardSchema>;
export type CustomerSegment = z.infer<typeof customerSegmentSchema>;
export type RewardProgram = z.infer<typeof rewardProgramSchema>;
export type PrivacyRequest = z.infer<typeof privacyRequestSchema>;
export type ReconciliationRun = z.infer<typeof reconciliationRunSchema>;
export type ReportSchedule = z.infer<typeof reportScheduleSchema>;
export type ChannelConnection = z.infer<typeof channelConnectionSchema>;
export type AutomationRule = z.infer<typeof automationRuleSchema>;
export type SlaPolicy = z.infer<typeof slaPolicySchema>;
export type LocalizationArea = z.infer<typeof localizationAreaSchema>;
