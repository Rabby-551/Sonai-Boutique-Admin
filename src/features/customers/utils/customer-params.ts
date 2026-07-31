import type { CustomerListInput } from "../data/repository";

export function customerParams(
  raw: Record<string, string | string[] | undefined>,
): CustomerListInput {
  const one = (key: string) =>
    Array.isArray(raw[key]) ? raw[key]?.[0] : raw[key];
  const status = one("status");
  const loyalty = one("loyalty");
  return {
    query: one("query") || undefined,
    status: status === "active" || status === "archived" ? status : "all",
    loyalty: loyalty === "enrolled" || loyalty === "guest" ? loyalty : "all",
    page: Math.max(Number(one("page")) || 1, 1),
    pageSize: 20,
  };
}
