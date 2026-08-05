"use client";

import Link from "next/link";
import type { PosBootstrap } from "../data/repository";
import { PosCatalogPane } from "./pos-catalog-pane";
import { PosCheckoutPane } from "./pos-checkout-pane";
import { usePosWorkspace } from "./use-pos-workspace";

export function PosWorkspace({
  bootstrap,
  cashierName,
}: {
  bootstrap: PosBootstrap;
  cashierName: string;
}) {
  const model = usePosWorkspace(bootstrap);
  return (
    <div className="pos-workspace">
      <header className="pos-command-bar">
        <div>
          <span className="eyebrow">
            {model.location?.name} · {model.register?.code}
          </span>
          <h1>Point of sale</h1>
        </div>
        <div className="pos-command-meta">
          <span>{cashierName}</span>
          <span className="badge success">Shift open</span>
          <Link className="button secondary small" href="/pos/transactions">
            Returns
          </Link>
          <Link className="button secondary small" href="/pos/shifts">
            Close shift
          </Link>
        </div>
      </header>
      <main className="pos-selling-grid">
        <PosCatalogPane catalog={bootstrap.catalog} model={model} />
        <PosCheckoutPane bootstrap={bootstrap} model={model} />
      </main>
    </div>
  );
}
