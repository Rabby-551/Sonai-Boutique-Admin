import { env } from "@/lib/env";
import { OperationsClient } from "@/lib/http/operations-client";
import type { ReportQuery, ReportResult } from "../schemas/reports";
import type { ReportRepository } from "./repository";
export class HttpReportRepository implements ReportRepository {
  private readonly client = new OperationsClient(`${env.API_BASE_URL}/reports`);
  run(query: ReportQuery) {
    return this.client.request<ReportResult>(
      `?${new URLSearchParams(Object.entries(query).filter(([, value]) => value != null) as [string, string][]).toString()}`,
    );
  }
}
