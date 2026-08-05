import "server-only";
import { env } from "@/lib/env";
import type { PosRepository } from "./repository";
import { FilePosRepository } from "./file-repository";
import { HttpPosRepository } from "./http-repository";

export function getPosRepository(): PosRepository {
  return env.DATA_SOURCE === "api"
    ? new HttpPosRepository()
    : new FilePosRepository();
}
