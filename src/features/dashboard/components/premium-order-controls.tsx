"use client";

import type { ReadonlyURLSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import type { AdminLocale } from "@/lib/i18n/admin-locale";
import { dashboardCopy } from "../dashboard-copy";
import type { DashboardWorkspace } from "../schemas/dashboard-schema";
import type { OrderColumn } from "./premium-orders-table";

type OrdersData = Extract<
  DashboardWorkspace["orders"],
  { status: "ready" }
>["data"];

export function PremiumOrderControls({
  data,
  locale,
  columns,
  searchParams,
  onNavigate,
  onToggleColumn,
}: {
  data: OrdersData;
  locale: AdminLocale;
  columns: Set<OrderColumn>;
  searchParams: ReadonlyURLSearchParams;
  onNavigate: (changes: Record<string, string>) => void;
  onToggleColumn: (column: OrderColumn) => void;
}) {
  const copy = dashboardCopy(locale);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    onNavigate({
      orderSearch: String(values.get("orderSearch") ?? ""),
      orderStatus: String(values.get("orderStatus") ?? "all"),
      orderSort: String(values.get("orderSort") ?? "updated-desc"),
      orderPageSize: String(values.get("orderPageSize") ?? "5"),
      orderPage: "1",
    });
  };
  return (
    <form className="premium-order-controls" onSubmit={submit}>
      <label>
        <span className="sr-only">{copy.searchOrders}</span>
        <input
          defaultValue={searchParams.get("orderSearch") ?? ""}
          name="orderSearch"
          placeholder={copy.searchOrders}
        />
      </label>
      <label>
        <span className="sr-only">{copy.status}</span>
        <select
          defaultValue={searchParams.get("orderStatus") ?? "all"}
          name="orderStatus"
        >
          <option value="all">{copy.all}</option>
          {[
            "confirmed",
            "packed",
            "shipped",
            "delivered",
            "returned",
            "cancelled",
          ].map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="sr-only">{copy.sort}</span>
        <select
          defaultValue={searchParams.get("orderSort") ?? "updated-desc"}
          name="orderSort"
        >
          <option value="updated-desc">Newest</option>
          <option value="updated-asc">Oldest</option>
          <option value="total-desc">Total ↓</option>
          <option value="total-asc">Total ↑</option>
        </select>
      </label>
      <label>
        <span className="sr-only">{copy.pageSize}</span>
        <select defaultValue={String(data.pageSize)} name="orderPageSize">
          {[5, 10, 25].map((size) => (
            <option key={size}>{size}</option>
          ))}
        </select>
      </label>
      <button className="button" type="submit">
        {copy.apply}
      </button>
      <details className="premium-column-menu">
        <summary>Columns</summary>
        {(
          ["customer", "channel", "location", "payment", "updated"] as const
        ).map((column) => (
          <label key={column}>
            <input
              checked={columns.has(column)}
              onChange={() => onToggleColumn(column)}
              type="checkbox"
            />
            {column}
          </label>
        ))}
      </details>
    </form>
  );
}
