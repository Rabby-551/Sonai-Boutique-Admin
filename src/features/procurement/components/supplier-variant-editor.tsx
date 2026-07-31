"use client";
import { useState } from "react";
import type { Supplier } from "../schemas/procurement";
import type { VariantOption } from "./variant-options";
export function SupplierVariantEditor({
  options,
  initial = [],
}: {
  options: readonly VariantOption[];
  initial?: Supplier["variants"];
}) {
  const [rows, setRows] = useState(() =>
    initial.length
      ? initial.map((item) => ({ key: crypto.randomUUID(), ...item }))
      : [
          {
            key: crypto.randomUUID(),
            variantId: "",
            supplierSku: "",
            minimumQuantity: 1,
            lastUnitCostMinor: 0,
            leadTimeDays: 14,
          },
        ],
  );
  return (
    <div className="stack-sm">
      <div className="section-heading">
        <h3>Supplied variants</h3>
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
                minimumQuantity: 1,
                lastUnitCostMinor: 0,
                leadTimeDays: 14,
              },
            ])
          }
        >
          Add mapping
        </button>
      </div>
      {rows.map((row) => (
        <div className="variant-command-row procurement-line" key={row.key}>
          <select
            className="select"
            name="variantId"
            value={row.variantId}
            onChange={(event) =>
              setRows((current) =>
                current.map((item) =>
                  item.key === row.key
                    ? { ...item, variantId: event.target.value }
                    : item,
                ),
              )
            }
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
            name="minimumQuantity"
            type="number"
            min="1"
            value={row.minimumQuantity}
            aria-label="Minimum quantity"
            onChange={(event) =>
              setRows((current) =>
                current.map((item) =>
                  item.key === row.key
                    ? { ...item, minimumQuantity: Number(event.target.value) }
                    : item,
                ),
              )
            }
          />
          <input
            className="input"
            name="lastUnitCost"
            type="number"
            min="0"
            step="0.01"
            value={row.lastUnitCostMinor / 100}
            aria-label="Last unit cost"
            onChange={(event) =>
              setRows((current) =>
                current.map((item) =>
                  item.key === row.key
                    ? {
                        ...item,
                        lastUnitCostMinor: Math.round(
                          Number(event.target.value) * 100,
                        ),
                      }
                    : item,
                ),
              )
            }
          />
          <input
            className="input"
            name="variantLeadTime"
            type="number"
            min="0"
            value={row.leadTimeDays}
            aria-label="Lead time days"
            onChange={(event) =>
              setRows((current) =>
                current.map((item) =>
                  item.key === row.key
                    ? { ...item, leadTimeDays: Number(event.target.value) }
                    : item,
                ),
              )
            }
          />
          <button
            className="icon-button danger-icon"
            type="button"
            aria-label="Remove mapping"
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
