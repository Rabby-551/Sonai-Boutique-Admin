import type { OrderListInput } from "../data/repository";
type SearchParams = Record<string, string | string[] | undefined>;
const one = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

/** Normalizes URL-backed order filters before repository use. */
export function orderParams(params: SearchParams): OrderListInput {
  return {
    query: one(params.query),
    source: (one(params.source) ?? "all") as OrderListInput["source"],
    locationId: (one(params.locationId) ??
      "all") as OrderListInput["locationId"],
    status: (one(params.status) ?? "all") as OrderListInput["status"],
    paymentStatus: (one(params.paymentStatus) ??
      "all") as OrderListInput["paymentStatus"],
    dateFrom: one(params.dateFrom),
    dateTo: one(params.dateTo),
    page: Math.max(1, Number(one(params.page)) || 1),
    pageSize: 15,
  };
}
