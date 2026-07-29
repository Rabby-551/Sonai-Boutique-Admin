import type {
  DashboardQuery,
  DashboardSummary,
} from "../schemas/dashboard-schema";
/** Dashboard contract kept separate because summary aggregation differs from record modules. */
export interface DashboardRepository {
  getSummary(input: DashboardQuery): Promise<DashboardSummary>;
}
