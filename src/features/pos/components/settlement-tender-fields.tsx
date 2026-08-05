"use client";

import type { PaymentProvider } from "../schemas/pos";

export type SettlementKind = "cash" | "card" | "mfs";

export function SettlementTenderFields({
  kind,
  onKind,
  providerId,
  onProvider,
  reference,
  onReference,
  providers,
}: {
  kind: SettlementKind;
  onKind: (value: SettlementKind) => void;
  providerId: string;
  onProvider: (value: string) => void;
  reference: string;
  onReference: (value: string) => void;
  providers: readonly PaymentProvider[];
}) {
  return (
    <div className="form-grid">
      <select
        className="select"
        onChange={(event) => {
          onKind(event.target.value as SettlementKind);
          onProvider("");
        }}
        value={kind}
      >
        <option value="cash">Cash</option>
        <option value="card">Card</option>
        <option value="mfs">MFS</option>
      </select>
      {kind !== "cash" && (
        <>
          <select
            className="select"
            onChange={(event) => onProvider(event.target.value)}
            value={providerId}
          >
            <option value="">Provider</option>
            {providers.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <input
            className="input"
            onChange={(event) => onReference(event.target.value)}
            placeholder="Refund/transaction reference"
            value={reference}
          />
        </>
      )}
    </div>
  );
}
