import "server-only";
import { env } from "@/lib/env";
import type { WorkforceRepository } from "./repository";
import { FileWorkforceRepository } from "./file-repository";
import { HttpWorkforceRepository } from "./http-repository";
export function getWorkforceRepository(): WorkforceRepository {
  return env.DATA_SOURCE === "api"
    ? new HttpWorkforceRepository()
    : new FileWorkforceRepository();
}
