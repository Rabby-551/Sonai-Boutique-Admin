import "server-only";
import { env } from "@/lib/env";
import type { AdministrationRepository } from "./repository";
import { FileAdministrationRepository } from "./file-repository";
import { HttpAdministrationRepository } from "./http-repository";

export function getAdministrationRepository(): AdministrationRepository {
  return env.DATA_SOURCE === "api"
    ? new HttpAdministrationRepository()
    : new FileAdministrationRepository();
}
