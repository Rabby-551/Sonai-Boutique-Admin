import { z } from "zod";

const envSchema = z.object({
  DATA_SOURCE: z.enum(["mock", "api"]).default("mock"),
  API_BASE_URL: z.string().url().default("http://localhost:4000/api"),
  MOCK_ROLE: z
    .enum(["owner", "manager", "cashier", "support"])
    .default("owner"),
});

/** Validated server configuration. Never import this module into a Client Component. */
export const env = envSchema.parse(process.env);
