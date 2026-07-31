import type { ReportQuery, ReportResult } from "../schemas/reports";
/** Source-backed reporting contract. Export transports use exactly the same result. */
export interface ReportRepository {
  run(query: ReportQuery): Promise<ReportResult>;
}
