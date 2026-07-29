import "server-only";
import { env } from "@/lib/env";
import type { CatalogRepository } from "./repository";
import { FileCatalogRepository } from "./file-repository";
import { HttpCatalogRepository } from "./http-repository";

export function getCatalogRepository(): CatalogRepository {
  return env.DATA_SOURCE === "api"
    ? new HttpCatalogRepository()
    : new FileCatalogRepository();
}
