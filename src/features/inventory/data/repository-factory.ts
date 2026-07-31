import "server-only";
import { FileInventoryRepository } from "./file-repository";
import type { InventoryRepository } from "./repository";
import { HttpInventoryRepository } from "./http-repository";
import { env } from "@/lib/env";
import { SupabaseInventoryRepository } from "./supabase-repository";

export function getInventoryRepository(): InventoryRepository {
  if (env.COMMERCE_SOURCE === "supabase")
    return new SupabaseInventoryRepository();
  return env.DATA_SOURCE === "api"
    ? new HttpInventoryRepository()
    : new FileInventoryRepository();
}
