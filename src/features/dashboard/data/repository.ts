import type {
  DashboardQuery,
  DashboardWorkspace,
} from "../schemas/dashboard-schema";

export type OverviewGroup = Pick<DashboardWorkspace, "overview">;
export type SalesGroup = Pick<
  DashboardWorkspace,
  "revenue" | "targets" | "channels" | "geography"
>;
export type OperationsGroup = Pick<
  DashboardWorkspace,
  "alerts" | "fulfillment" | "inventory"
>;
export type GrowthGroup = Pick<
  DashboardWorkspace,
  "merchandise" | "customers" | "campaigns"
>;
export type ActivityGroup = Pick<DashboardWorkspace, "orders" | "activity">;

/** Independent groups keep a slow or unavailable source from blocking the workspace. */
export interface DashboardRepository {
  getOverview(input: DashboardQuery): Promise<OverviewGroup>;
  getSales(input: DashboardQuery): Promise<SalesGroup>;
  getOperations(input: DashboardQuery): Promise<OperationsGroup>;
  getGrowth(input: DashboardQuery): Promise<GrowthGroup>;
  getActivity(input: DashboardQuery): Promise<ActivityGroup>;
}
