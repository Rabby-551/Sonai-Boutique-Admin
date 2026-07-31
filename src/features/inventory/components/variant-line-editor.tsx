"use client";
import { useState } from "react";
import type { InventoryRow } from "../schemas/inventory";

/** Reusable compact editor for commands containing one or more SKU quantities. */
export function VariantLineEditor({
  rows,
  legend,
}: {
  rows: readonly InventoryRow[];
  legend: string;
}) {
  const [lines, setLines] = useState([{ key: 0 }]);
  return (
    <fieldset>
      <legend>{legend}</legend>
      <div className="stack-sm">
        {lines.map((line, index) => (
          <div className="variant-command-row" key={line.key}>
            <div className="field compact">
              <label htmlFor={`variant-${line.key}`}>Variant {index + 1}</label>
              <select
                className="select"
                id={`variant-${line.key}`}
                name="variantId"
                required
              >
                {rows.map((row) => (
                  <option key={row.variantId} value={row.variantId}>
                    {row.sku} · {row.productName} ({row.totalAvailable}{" "}
                    available)
                  </option>
                ))}
              </select>
            </div>
            <div className="field compact">
              <label htmlFor={`quantity-${line.key}`}>Quantity</label>
              <input
                className="input"
                defaultValue={1}
                id={`quantity-${line.key}`}
                min={1}
                name="quantity"
                required
                type="number"
              />
            </div>
            <button
              aria-label={`Remove line ${index + 1}`}
              className="button secondary small"
              disabled={lines.length === 1}
              onClick={() =>
                setLines((current) =>
                  current.filter((item) => item.key !== line.key),
                )
              }
              type="button"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        className="button secondary small"
        onClick={() =>
          setLines((current) => [
            ...current,
            { key: Math.max(...current.map((item) => item.key)) + 1 },
          ])
        }
        type="button"
      >
        Add another SKU
      </button>
    </fieldset>
  );
}
