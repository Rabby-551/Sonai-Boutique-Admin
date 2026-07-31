import "server-only";
import { FileOrderRepository } from "./file-repository";
import type { OrderRepository } from "./repository";
import { HttpOrderRepository } from "./http-repository";
import { env } from "@/lib/env";
import { SupabaseOrderRepository } from "./supabase-repository";

export function getOrderRepository(): OrderRepository {
  if (env.COMMERCE_SOURCE === "supabase") return new SupabaseOrderRepository();
  return env.DATA_SOURCE === "api"
    ? new HttpOrderRepository()
    : new FileOrderRepository();
}
