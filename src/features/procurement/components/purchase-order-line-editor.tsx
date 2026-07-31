"use client";
import { useState } from "react";
import type { VariantOption } from "./variant-options";
export function PurchaseOrderLineEditor({
  options,
}: {
  options: readonly VariantOption[];
}) {
  const [rows, setRows] = useState([
    {
      key: crypto.randomUUID(),
      variantId: "",
      supplierSku: "",
      orderedQuantity: 1,
      unitCost: 0,
    },
  ]);
  return (
    <div className="stack-sm">
      <div className="section-heading">
        <h3>Order lines</h3>
        <button
          className="button secondary small"
          type="button"
          onClick={() =>
            setRows((current) => [
              ...current,
              {
                key: crypto.randomUUID(),
                variantId: "",
                supplierSku: "",
                orderedQuantity: 1,
                unitCost: 0,
              },
            ])
          }
        >
          Add line
        </button>
      </div>
      {rows.map((row) => (
        <div className="variant-command-row po-line" key={row.key}>
          <select
            className="select"
            name="variantId"
            required
            value={row.variantId}
            onChange={(event) => {
              const option = options.find(
                (item) => item.id === event.target.value,
              );
              setRows((current) =>
                current.map((item) =>
                  item.key === row.key
                    ? {
                        ...item,
                        variantId: event.target.value,
                        supplierSku: option?.sku ?? "",
                        unitCost: (option?.costMinor ?? 0) / 100,
                      }
                    : item,
                ),
              );
            }}
          >
            <option value="">Select SKU</option>
            {options.map((item) => (
              <option value={item.id} key={item.id}>
                {item.label} ({item.sku})
              </option>
            ))}
          </select>
          <input
            className="input"
            name="supplierSku"
            required
            value={row.supplierSku}
            placeholder="Supplier SKU"
            onChange={(event) =>
              setRows((current) =>
                current.map((item) =>
                  item.key === row.key
                    ? { ...item, supplierSku: event.target.value }
                    : item,
                ),
              )
            }
          />
          <input
            className="input"
            name="orderedQuantity"
            type="number"
            min="1"
            required
            value={row.orderedQuantity}
            aria-label="Ordered quantity"
            onChange={(event) =>
              setRows((current) =>
                current.map((item) =>
                  item.key === row.key
                    ? { ...item, orderedQuantity: Number(event.target.value) }
                    : item,
                ),
              )
            }
          />
          <input
            className="input"
            name="unitCost"
            type="number"
            min="0"
            step="0.01"
            required
            value={row.unitCost}
            aria-label="Unit cost"
            onChange={(event) =>
              setRows((current) =>
                current.map((item) =>
                  item.key === row.key
                    ? { ...item, unitCost: Number(event.target.value) }
                    : item,
                ),
              )
            }
          />
          <button
            className="icon-button danger-icon"
            type="button"
            aria-label="Remove line"
            onClick={() =>
              setRows((current) =>
                current.filter((item) => item.key !== row.key),
              )
            }
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
