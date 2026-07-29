import "server-only";
import { env } from "@/lib/env";
import { HttpModuleRepository } from "./http-repository";
import { MockModuleRepository } from "./mock-repository";
import type { ModuleRepository } from "./repository";

/** Chooses the data adapter without leaking infrastructure decisions into pages. */
export function getModuleRepository(): ModuleRepository {
  return env.DATA_SOURCE === "api"
    ? new HttpModuleRepository()
    : new MockModuleRepository();
}
