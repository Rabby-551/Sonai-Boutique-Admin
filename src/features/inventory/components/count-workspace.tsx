"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  approveCountAction,
  recordCountAction,
  startCountAction,
  submitCountAction,
} from "../server/actions";
import type { InventoryRow, StockCount } from "../schemas/inventory";
import { ScannerInput } from "./scanner-input";

export function CountWorkspace({
  count,
  rows,
  canApprove,
}: {
  count: StockCount;
  rows: readonly InventoryRow[];
  canApprove: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const lookup = new Map(rows.map((row) => [row.variantId, row]));
  const execute = (task: () => Promise<{ status: string; message: string }>) =>
    startTransition(async () => {
      const result = await task();
      setMessage(result.message);
      if (result.status === "success") router.refresh();
    });
  return (
    <div className="stack">
      {message && (
        <div className="form-message" role="status">
          {message}
        </div>
      )}
      {count.status === "in_progress" && (
        <ScannerInput
          rows={rows.filter((row) =>
            count.lines.some((line) => line.variantId === row.variantId),
          )}
          onSelect={(row) => {
            if (pending) return;
            const line = count.lines.find(
              (item) => item.variantId === row.variantId,
            );
            if (line)
              execute(() =>
                recordCountAction(
                  count.id,
                  row.variantId,
                  (line.counted ?? 0) + 1,
                  count.version,
                ),
              );
          }}
        />
      )}
      <section className="card table-card">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product</th>
                <th>Expected</th>
                <th>Counted</th>
                <th>Variance</th>
                <th>Save</th>
              </tr>
            </thead>
            <tbody>
              {count.lines.map((line) => {
                const row = lookup.get(line.variantId);
                const inputId = `count-${line.variantId}`;
                return (
                  <tr key={line.variantId}>
                    <td>{row?.sku ?? line.variantId}</td>
                    <td>{row?.productName ?? "Unknown"}</td>
                    <td>{line.expected}</td>
                    <td>
                      <input
                        className="input quantity-input"
                        defaultValue={line.counted ?? ""}
                        disabled={count.status !== "in_progress"}
                        id={inputId}
                        min={0}
                        type="number"
                      />
                    </td>
                    <td>
                      {line.counted === null
                        ? "—"
                        : line.counted - line.expected}
                    </td>
                    <td>
                      <button
                        className="button secondary small"
                        disabled={pending || count.status !== "in_progress"}
                        onClick={() => {
                          const counted = Number(
                            (
                              document.getElementById(
                                inputId,
                              ) as HTMLInputElement
                            ).value,
                          );
                          execute(() =>
                            recordCountAction(
                              count.id,
                              line.variantId,
                              counted,
                              count.version,
                            ),
                          );
                        }}
                        type="button"
                      >
                        Save
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <div className="button-group">
        {count.status === "scheduled" && (
          <button
            className="button"
            disabled={pending}
            onClick={() =>
              execute(() => startCountAction(count.id, count.version))
            }
            type="button"
          >
            Start and snapshot
          </button>
        )}
        {count.status === "in_progress" && (
          <button
            className="button"
            disabled={pending}
            onClick={() =>
              execute(() => submitCountAction(count.id, count.version))
            }
            type="button"
          >
            Submit variance
          </button>
        )}
        {count.status === "pending_review" && canApprove && (
          <button
            className="button"
            disabled={pending}
            onClick={() =>
              execute(() => approveCountAction(count.id, count.version))
            }
            type="button"
          >
            Approve reconciliation
          </button>
        )}
      </div>
    </div>
  );
}
