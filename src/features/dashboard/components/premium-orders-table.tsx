"use client";

import { Eye, X } from "lucide-react";
import { useRef, useState } from "react";
import { formatMoney } from "@/lib/formatting";
import type { AdminLocale } from "@/lib/i18n/admin-locale";
import { dashboardCopy } from "../dashboard-copy";
import type { DashboardWorkspace } from "../schemas/dashboard-schema";

type Panel = DashboardWorkspace["orders"];
type Order = Extract<Panel, { status: "ready" }>["data"]["items"][number];
export type OrderColumn =
  "customer" | "channel" | "location" | "payment" | "updated";

export function PremiumOrdersTable({
  items,
  columns,
  locale,
}: {
  items: Order[];
  columns: Set<OrderColumn>;
  locale: AdminLocale;
}) {
  const copy = dashboardCopy(locale);
  const preview = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<Order | null>(null);
  return (
    <>
      <div className="table-scroll responsive-record-table">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              {columns.has("customer") && <th>{copy.customer}</th>}
              {columns.has("channel") && <th>{copy.channel}</th>}
              {columns.has("location") && <th>{copy.location}</th>}
              <th>{copy.total}</th>
              {columns.has("payment") && <th>Payment</th>}
              <th>{copy.status}</th>
              {columns.has("updated") && <th>{copy.updated}</th>}
              <th>{copy.view}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((order) => (
              <tr key={order.id}>
                <td data-label="Order">
                  <strong>{order.id}</strong>
                </td>
                {columns.has("customer") && (
                  <td data-label={copy.customer}>{order.customer}</td>
                )}
                {columns.has("channel") && (
                  <td data-label={copy.channel}>{order.channel}</td>
                )}
                {columns.has("location") && (
                  <td data-label={copy.location}>{order.location}</td>
                )}
                <td data-label={copy.total}>
                  {formatMoney(order.totalMinor, locale)}
                </td>
                {columns.has("payment") && (
                  <td data-label="Payment">{order.payment}</td>
                )}
                <td data-label={copy.status}>
                  <span className="badge">{order.status}</span>
                </td>
                {columns.has("updated") && (
                  <td data-label={copy.updated}>
                    {new Date(order.updatedAt).toLocaleString(
                      locale === "bn" ? "bn-BD" : "en-BD",
                      {
                        timeZone: "Asia/Dhaka",
                        dateStyle: "medium",
                        timeStyle: "short",
                      },
                    )}
                  </td>
                )}
                <td data-label={copy.view}>
                  <button
                    className="premium-icon-button"
                    aria-label={`${copy.view} ${order.id}`}
                    onClick={() => {
                      setSelected(order);
                      preview.current?.showModal();
                    }}
                    type="button"
                  >
                    <Eye size={17} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <dialog className="premium-order-preview" ref={preview}>
        <div className="premium-drawer-heading">
          <strong>{selected?.id}</strong>
          <button
            aria-label={copy.close}
            onClick={() => preview.current?.close()}
            type="button"
          >
            <X />
          </button>
        </div>
        {selected && (
          <dl>
            <div>
              <dt>{copy.customer}</dt>
              <dd>{selected.customer}</dd>
            </div>
            <div>
              <dt>{copy.channel}</dt>
              <dd>{selected.channel}</dd>
            </div>
            <div>
              <dt>{copy.location}</dt>
              <dd>{selected.location}</dd>
            </div>
            <div>
              <dt>{copy.total}</dt>
              <dd>{formatMoney(selected.totalMinor, locale)}</dd>
            </div>
            <div>
              <dt>{copy.status}</dt>
              <dd>{selected.status}</dd>
            </div>
          </dl>
        )}
        <a className="button" href={`/orders/${selected?.id ?? ""}`}>
          Open order
        </a>
      </dialog>
    </>
  );
}
