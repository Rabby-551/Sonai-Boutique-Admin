import "server-only";
import { env } from "@/lib/env";
import type { ComplaintRepository } from "./repository";
import { FileComplaintRepository } from "./file-repository";
import { HttpComplaintRepository } from "./http-repository";
export function getComplaintRepository(): ComplaintRepository {
  return env.DATA_SOURCE === "api"
    ? new HttpComplaintRepository()
    : new FileComplaintRepository();
}
