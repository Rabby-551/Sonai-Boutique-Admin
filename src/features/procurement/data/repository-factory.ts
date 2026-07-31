import "server-only";
import { env } from "@/lib/env";
import type { ProcurementRepository } from "./repository";
import { FileProcurementRepository } from "./file-repository";
import { HttpProcurementRepository } from "./http-repository";
export function getProcurementRepository(): ProcurementRepository {
  return env.DATA_SOURCE === "api"
    ? new HttpProcurementRepository()
    : new FileProcurementRepository();
}
