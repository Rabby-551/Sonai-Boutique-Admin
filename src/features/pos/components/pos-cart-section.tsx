"use client";

import { formatMoney } from "@/lib/formatting";
import type { PosWorkspaceModel } from "./use-pos-workspace";

export function PosCartSection({ model }: { model: PosWorkspaceModel }) {
  const { add, cart, setCart } = model;
  return (
    <section className="pos-section">
      <div className="pos-section-heading">
        <span className="eyebrow">Current sale</span>
        <strong>
          {cart.reduce((sum, line) => sum + line.quantity, 0)} items
        </strong>
      </div>
      <div className="pos-cart-lines">
        {cart.map((line) => (
          <div className="pos-cart-line" key={line.item.variantId}>
            <div>
              <strong>{line.item.productName}</strong>
              <small>
                {line.item.variantLabel} · {formatMoney(line.item.priceMinor)}
              </small>
            </div>
            <div className="quantity-stepper">
              <button
                aria-label={`Remove one ${line.item.productName}`}
                onClick={() =>
                  setCart((current) =>
                    current.flatMap((item) =>
                      item.item.variantId !== line.item.variantId
                        ? [item]
                        : item.quantity === 1
                          ? []
                          : [{ ...item, quantity: item.quantity - 1 }],
                    ),
                  )
                }
                type="button"
              >
                −
              </button>
              <span>{line.quantity}</span>
              <button
                aria-label={`Add one ${line.item.productName}`}
                disabled={line.quantity >= line.item.available}
                onClick={() => add(line.item)}
                type="button"
              >
                +
              </button>
            </div>
            <strong>{formatMoney(line.item.priceMinor * line.quantity)}</strong>
          </div>
        ))}
        {!cart.length && (
          <div className="empty-inline">Scan or choose a product to begin.</div>
        )}
      </div>
    </section>
  );
}
