import "server-only";
import { env } from "@/lib/env";
import type { ReportRepository } from "./repository";
import { FileReportRepository } from "./file-repository";
import { HttpReportRepository } from "./http-repository";
export function getReportRepository(): ReportRepository {
  return env.DATA_SOURCE === "api"
    ? new HttpReportRepository()
    : new FileReportRepository();
}
