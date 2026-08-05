"use client";

import Image from "next/image";
import { formatMoney } from "@/lib/formatting";
import type { PosBootstrap } from "../data/repository";
import type { PosWorkspaceModel } from "./use-pos-workspace";

export function PosCatalogPane({
  catalog,
  model,
}: {
  catalog: PosBootstrap["catalog"];
  model: PosWorkspaceModel;
}) {
  const { add, filtered, query, setQuery } = model;
  return (
    <section className="pos-catalog-pane">
      <label className="pos-search">
        <span className="sr-only">Search products</span>
        <input
          autoFocus
          className="input"
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            const exact = catalog.find((item) =>
              [item.sku, item.barcode].some(
                (value) => value.toLowerCase() === query.trim().toLowerCase(),
              ),
            );
            if (exact) {
              add(exact);
              setQuery("");
            }
          }}
          placeholder="Scan barcode or search product, SKU, colour, size…"
          value={query}
        />
      </label>
      <div className="pos-product-grid">
        {filtered.map((item) => (
          <button
            className="pos-product"
            disabled={!item.available}
            key={item.variantId}
            onClick={() => add(item)}
            type="button"
          >
            <Image alt="" height={88} src={item.imageUrl} width={72} />
            <span>
              <strong>{item.productName}</strong>
              <small>
                {item.variantLabel} · {item.sku}
              </small>
              <span className="pos-product-foot">
                <b>{formatMoney(item.priceMinor)}</b>
                <em>{item.available} in stock</em>
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
