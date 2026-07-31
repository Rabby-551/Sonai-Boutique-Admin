import { z } from "zod";

const envSchema = z
  .object({
    DATA_SOURCE: z.enum(["mock", "api"]).default("mock"),
    COMMERCE_SOURCE: z.enum(["mock", "supabase"]).default("mock"),
    API_BASE_URL: z.string().url().default("http://localhost:4000/api"),
    AUTH_SOURCE: z.enum(["mock", "supabase"]).default("mock"),
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
    STOREFRONT_URL: z.string().url().default("http://localhost:3000"),
    MOCK_ROLE: z
      .enum(["owner", "manager", "cashier", "support"])
      .default("owner"),
    MOCK_DATA_DIR: z.string().min(1).optional(),
    E2E_TESTING: z.enum(["true", "false"]).default("false"),
    DEMO_RESET_ENABLED: z.enum(["true", "false"]).default("false"),
    PREVIEW_MODE: z.enum(["true", "false"]).default("false"),
    PREVIEW_RELEASE_VERSION: z.string().min(3).default("local-development"),
    PREVIEW_ACCESS_POLICY: z
      .enum(["local", "restricted-host"])
      .default("local"),
    PREVIEW_SOURCE_REVISION: z
      .string()
      .regex(/^[a-zA-Z0-9._-]+$/)
      .default("uncommitted"),
    PREVIEW_BUILT_AT: z.string().datetime().optional(),
    PREVIEW_ARTIFACT_SHA256: z
      .string()
      .regex(/^[a-f0-9]{64}$/)
      .optional(),
  })
  .superRefine((value, context) => {
    if (value.PREVIEW_MODE !== "true") return;
    if (value.DATA_SOURCE !== "mock")
      context.addIssue({
        code: "custom",
        path: ["DATA_SOURCE"],
        message: "Preview mode requires the fictional mock data source.",
      });
    if (value.COMMERCE_SOURCE !== "mock")
      context.addIssue({
        code: "custom",
        path: ["COMMERCE_SOURCE"],
        message: "Preview mode requires the mock commerce source.",
      });
    if (value.AUTH_SOURCE !== "mock")
      context.addIssue({
        code: "custom",
        path: ["AUTH_SOURCE"],
        message: "Preview mode requires mock authentication.",
      });
    if (value.PREVIEW_RELEASE_VERSION === "local-development")
      context.addIssue({
        code: "custom",
        path: ["PREVIEW_RELEASE_VERSION"],
        message: "Preview mode requires an immutable release version.",
      });
    if (!value.PREVIEW_BUILT_AT)
      context.addIssue({
        code: "custom",
        path: ["PREVIEW_BUILT_AT"],
        message: "Preview mode requires an ISO build timestamp.",
      });
    if (!value.MOCK_DATA_DIR)
      context.addIssue({
        code: "custom",
        path: ["MOCK_DATA_DIR"],
        message: "Preview mode requires an isolated mock-data directory.",
      });
  });

const parsed = envSchema.parse(process.env);

if (
  (parsed.AUTH_SOURCE === "supabase" ||
    parsed.COMMERCE_SOURCE === "supabase") &&
  (!parsed.NEXT_PUBLIC_SUPABASE_URL ||
    !parsed.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
) {
  throw new Error(
    "Supabase authentication requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
  );
}

/** Validated server configuration. Never import this module into a Client Component. */
export const env = parsed;
