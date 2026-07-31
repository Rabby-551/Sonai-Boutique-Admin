import "server-only";
import { env } from "@/lib/env";
import type { CatalogRepository } from "./repository";
import { FileCatalogRepository } from "./file-repository";
import { HttpCatalogRepository } from "./http-repository";
import { SupabaseCatalogRepository } from "./supabase-repository";

export function getCatalogRepository(): CatalogRepository {
  if (env.COMMERCE_SOURCE === "supabase")
    return new SupabaseCatalogRepository();
  return env.DATA_SOURCE === "api"
    ? new HttpCatalogRepository()
    : new FileCatalogRepository();
}
