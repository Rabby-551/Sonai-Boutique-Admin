"use client";
import type { PaymentProvider } from "../schemas/pos";
import type { TenderInput } from "../data/repository";
import { formatMoney } from "@/lib/formatting";

export interface TenderDraft {
  id: string;
  kind: TenderInput["kind"];
  providerId: string;
  reference: string;
  amount: string;
  received: string;
}

export function TenderEditor({
  providers,
  totalMinor,
  tenders,
  onChange,
}: {
  providers: readonly PaymentProvider[];
  totalMinor: number;
  tenders: TenderDraft[];
  onChange: (value: TenderDraft[]) => void;
}) {
  const applied = tenders.reduce(
    (sum, item) => sum + Math.round(Number(item.amount || 0) * 100),
    0,
  );
  const update = (id: string, patch: Partial<TenderDraft>) =>
    onChange(
      tenders.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  return (
    <section className="pos-section">
      <div className="pos-section-heading">
        <span className="eyebrow">Split payment</span>
        <strong>{formatMoney(totalMinor - applied)} due</strong>
      </div>
      <div className="pos-tender-list">
        {tenders.map((tender, index) => {
          const choices = providers.filter(
            (item) => item.category === tender.kind,
          );
          return (
            <div className="pos-tender-row" key={tender.id}>
              <select
                aria-label={`Tender ${index + 1} type`}
                className="select"
                onChange={(event) =>
                  update(tender.id, {
                    kind: event.target.value as TenderDraft["kind"],
                    providerId: "",
                    reference: "",
                  })
                }
                value={tender.kind}
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="mfs">MFS</option>
              </select>
              {tender.kind !== "cash" && (
                <select
                  aria-label="Provider"
                  className="select"
                  onChange={(event) =>
                    update(tender.id, { providerId: event.target.value })
                  }
                  value={tender.providerId}
                >
                  <option value="">Provider</option>
                  {choices.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              )}
              <input
                aria-label="Applied amount"
                className="input"
                min="0.01"
                onChange={(event) =>
                  update(tender.id, { amount: event.target.value })
                }
                placeholder="Amount"
                step="0.01"
                type="number"
                value={tender.amount}
              />
              {tender.kind === "cash" ? (
                <input
                  aria-label="Cash received"
                  className="input"
                  min="0"
                  onChange={(event) =>
                    update(tender.id, { received: event.target.value })
                  }
                  placeholder="Received"
                  step="0.01"
                  type="number"
                  value={tender.received}
                />
              ) : (
                <input
                  aria-label="Transaction reference"
                  className="input"
                  onChange={(event) =>
                    update(tender.id, { reference: event.target.value })
                  }
                  placeholder="Transaction reference"
                  value={tender.reference}
                />
              )}
              <button
                aria-label={`Remove tender ${index + 1}`}
                className="icon-button"
                disabled={tenders.length === 1}
                onClick={() =>
                  onChange(tenders.filter((item) => item.id !== tender.id))
                }
                type="button"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
      <button
        className="button secondary small"
        onClick={() =>
          onChange([
            ...tenders,
            {
              id: crypto.randomUUID(),
              kind: "cash",
              providerId: "",
              reference: "",
              amount: "",
              received: "",
            },
          ])
        }
        type="button"
      >
        Add payment channel
      </button>
    </section>
  );
}
