"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatDate, formatMoney } from "@/lib/formatting";
import type { PosBootstrap } from "../data/repository";
import type { PosApproval, PosReturn, PosSale } from "../schemas/pos";
import { NoReceiptReturn } from "./no-receipt-return";
import { ReturnRequestForm } from "./return-request-form";
import { ReturnSettlement } from "./return-settlement";

export function TransactionWorkspace({
  sales,
  returns,
  approvals,
  bootstrap,
  canApprove,
}: {
  sales: readonly PosSale[];
  returns: readonly PosReturn[];
  approvals: readonly PosApproval[];
  bootstrap: PosBootstrap;
  canApprove: boolean;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const needle = query.toLowerCase().trim();
    return sales.filter(
      (sale) =>
        !needle ||
        `${sale.receiptNumber} ${sale.customer?.name ?? ""} ${sale.customer?.phone ?? ""} ${sale.lines.map((line) => `${line.sku} ${line.barcode}`).join(" ")}`
          .toLowerCase()
          .includes(needle),
    );
  }, [query, sales]);
  const openShift = bootstrap.openShift;
  return (
    <div className="stack">
      <section className="card">
        <div className="pos-transaction-search">
          <input
            className="input"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Receipt, customer phone, SKU or barcode"
            value={query}
          />
          <span>{filtered.length} transactions</span>
        </div>
      </section>
      {!openShift && (
        <div className="form-message error">
          Open a register shift before receiving a return or exchange.{" "}
          <Link href="/pos">Open POS</Link>
        </div>
      )}
      <section className="pos-transaction-grid">
        {filtered.map((sale) => (
          <article className="card pos-transaction-card" key={sale.id}>
            <div className="pos-section-heading">
              <div>
                <span className="eyebrow">{sale.receiptNumber}</span>
                <h3>{sale.customer?.name ?? "Walk-in customer"}</h3>
              </div>
              <strong>{formatMoney(sale.totalMinor)}</strong>
            </div>
            <p className="muted">
              {formatDate(sale.createdAt)} · {sale.status.replaceAll("_", " ")}
            </p>
            <ul>
              {sale.lines.map((line) => (
                <li key={line.variantId}>
                  <span>
                    {line.productName} · {line.variantLabel}
                  </span>
                  <strong>
                    {line.quantity} × {formatMoney(line.refundableUnitMinor)}
                  </strong>
                </li>
              ))}
            </ul>
            {openShift && (
              <ReturnRequestForm sale={sale} shiftId={openShift.id} />
            )}
            <Link className="text-link" href={`/pos/receipts/${sale.id}`}>
              Open receipt
            </Link>
          </article>
        ))}
      </section>
      <NoReceiptReturn bootstrap={bootstrap} />
      <ReturnDesk
        approvals={approvals}
        bootstrap={bootstrap}
        canApprove={canApprove}
        openShift={openShift}
        returns={returns}
        sales={sales}
      />
    </div>
  );
}

function ReturnDesk({
  approvals,
  bootstrap,
  canApprove,
  openShift,
  returns,
  sales,
}: {
  approvals: readonly PosApproval[];
  bootstrap: PosBootstrap;
  canApprove: boolean;
  openShift: PosBootstrap["openShift"];
  returns: readonly PosReturn[];
  sales: readonly PosSale[];
}) {
  return (
    <section className="stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Return desk</span>
          <h2>Prepared returns and exchanges</h2>
        </div>
      </div>
      {returns.map((item) => {
        const approval = approvals.find((entry) => entry.entityId === item.id);
        const sale = sales.find((entry) => entry.id === item.saleId);
        return (
          <article className="card pos-return-card" key={item.id}>
            <div className="pos-section-heading">
              <div>
                <span className="eyebrow">
                  {item.noReceipt ? "No-receipt review" : item.receiptNumber}
                </span>
                <h3>{formatMoney(item.totalRefundMinor)}</h3>
                <p>{item.reason}</p>
              </div>
              <span
                className={`badge ${item.status === "approved" ? "success" : item.status === "rejected" ? "danger" : item.status === "completed" ? "neutral" : "warning"}`}
              >
                {item.status}
              </span>
            </div>
            {canApprove &&
              item.status === "approved" &&
              approval &&
              openShift && (
                <ReturnSettlement
                  approval={approval}
                  campaigns={bootstrap.campaigns}
                  catalog={bootstrap.catalog}
                  item={item}
                  providers={bootstrap.providers}
                  registerId={openShift.registerId}
                  sale={sale}
                  shiftId={openShift.id}
                />
              )}
          </article>
        );
      })}
      {!returns.length && (
        <div className="card empty-state">
          No POS returns have been prepared.
        </div>
      )}
    </section>
  );
}
