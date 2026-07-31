import type { InventoryListInput, MovementListInput } from "../data/repository";
import type { LocationId, StockMovementType } from "../schemas/inventory";

type SearchParams = Record<string, string | string[] | undefined>;
const value = (params: SearchParams, key: string) => {
  const current = params[key];
  return Array.isArray(current) ? current[0] : current;
};
const page = (params: SearchParams) =>
  Math.max(1, Number(value(params, "page")) || 1);

/** Converts URL state into a safe inventory query. Repository filtering remains authoritative. */
export function inventoryParams(params: SearchParams): InventoryListInput {
  const minValue = Number(value(params, "minValue"));
  const maxValue = Number(value(params, "maxValue"));
  return {
    query: value(params, "query"),
    locationId: (value(params, "locationId") ?? "all") as "all" | LocationId,
    status: (value(params, "status") ?? "all") as InventoryListInput["status"],
    sort: (value(params, "sort") ?? "name") as InventoryListInput["sort"],
    minValueMinor:
      Number.isFinite(minValue) && minValue >= 0
        ? Math.round(minValue * 100)
        : undefined,
    maxValueMinor:
      Number.isFinite(maxValue) && maxValue >= 0
        ? Math.round(maxValue * 100)
        : undefined,
    page: page(params),
    pageSize: 12,
  };
}

export function movementParams(params: SearchParams): MovementListInput {
  return {
    query: value(params, "query"),
    locationId: (value(params, "locationId") ?? "all") as "all" | LocationId,
    type: (value(params, "type") ?? "all") as "all" | StockMovementType,
    actor: value(params, "actor"),
    dateFrom: value(params, "dateFrom"),
    dateTo: value(params, "dateTo"),
    page: page(params),
    pageSize: 20,
  };
}
