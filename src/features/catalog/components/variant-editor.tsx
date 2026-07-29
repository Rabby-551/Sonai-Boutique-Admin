"use client";
import { Plus, Trash2 } from "lucide-react";
import type { ProductVariant } from "../schemas/catalog";

export function VariantEditor({
  value,
  onChange,
}: {
  value: ProductVariant[];
  onChange: (value: ProductVariant[]) => void;
}) {
  const update = (
    index: number,
    field: keyof ProductVariant,
    fieldValue: string | number | boolean | null,
  ) =>
    onChange(
      value.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: fieldValue } : item,
      ),
    );
  const updateSku = (index: number, sku: string) =>
    onChange(
      value.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, sku, barcode: item.barcode || sku.replaceAll("-", "") }
          : item,
      ),
    );
  const add = () =>
    onChange([
      ...value,
      {
        id: `var-${crypto.randomUUID()}`,
        sku: "",
        color: "Default",
        size: "Free",
        priceMinor: null,
        stock: 0,
        barcode: "",
        active: true,
      },
    ]);
  return (
    <section className="form-section">
      <div className="section-title">
        <div>
          <h2>Variants</h2>
          <p className="metric-label">
            Each color and size combination needs a unique SKU and barcode.
          </p>
        </div>
        <button className="button secondary" onClick={add} type="button">
          <Plus size={16} />
          Add variant
        </button>
      </div>
      <div className="stack">
        {value.map((variant, index) => (
          <div className="variant-row" key={variant.id}>
            <div className="field compact">
              <label htmlFor={`sku-${index}`}>SKU</label>
              <input
                className="input"
                id={`sku-${index}`}
                required
                value={variant.sku}
                onChange={(event) => updateSku(index, event.target.value)}
              />
            </div>
            <div className="field compact">
              <label htmlFor={`color-${index}`}>Color</label>
              <input
                className="input"
                id={`color-${index}`}
                required
                value={variant.color}
                onChange={(event) => update(index, "color", event.target.value)}
              />
            </div>
            <div className="field compact">
              <label htmlFor={`size-${index}`}>Size</label>
              <input
                className="input"
                id={`size-${index}`}
                required
                value={variant.size}
                onChange={(event) => update(index, "size", event.target.value)}
              />
            </div>
            <div className="field compact">
              <label htmlFor={`stock-${index}`}>Stock</label>
              <input
                className="input"
                id={`stock-${index}`}
                min="0"
                required
                type="number"
                value={variant.stock}
                onChange={(event) =>
                  update(index, "stock", Number(event.target.value))
                }
              />
            </div>
            <div className="field compact">
              <label htmlFor={`variant-price-${index}`}>Price override</label>
              <input
                className="input"
                id={`variant-price-${index}`}
                min="0"
                placeholder="Base price"
                step="0.01"
                type="number"
                value={
                  variant.priceMinor === null ? "" : variant.priceMinor / 100
                }
                onChange={(event) =>
                  update(
                    index,
                    "priceMinor",
                    event.target.value
                      ? Math.round(Number(event.target.value) * 100)
                      : null,
                  )
                }
              />
            </div>
            <div className="field compact">
              <label htmlFor={`barcode-${index}`}>Barcode</label>
              <input
                className="input"
                id={`barcode-${index}`}
                required
                value={variant.barcode}
                onChange={(event) =>
                  update(index, "barcode", event.target.value)
                }
              />
            </div>
            <button
              aria-label={`Remove ${variant.sku || "variant"}`}
              className="icon-button danger-icon"
              disabled={value.length === 1}
              onClick={() =>
                onChange(value.filter((_, itemIndex) => itemIndex !== index))
              }
              type="button"
            >
              <Trash2 size={17} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
