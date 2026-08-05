"use client";
import { useActionState, useMemo, useState } from "react";
import { formatMoney } from "@/lib/formatting";
import type { PosBootstrap, TenderInput } from "../data/repository";
import type {
  PaymentProvider,
  PosApproval,
  PosReturn,
  PosSale,
} from "../schemas/pos";
import {
  completePosExchangeAction,
  completePosReturnAction,
} from "../server/actions";
import { initialPosActionState } from "../server/action-state";
import {
  allocateOriginalRefundTenders,
  catalogCampaignDiscount,
} from "../utils/pricing";
import { SettlementTenderFields } from "./settlement-tender-fields";

function tender(
  kind: "cash" | "card" | "mfs",
  amountMinor: number,
  providerId: string,
  reference: string,
): TenderInput {
  return {
    kind,
    amountMinor,
    providerId: providerId || null,
    reference: reference || null,
    receivedMinor: kind === "cash" ? amountMinor : null,
  };
}

export function ReturnSettlement({
  item,
  approval,
  providers,
  catalog,
  campaigns,
  registerId,
  shiftId,
  sale,
}: {
  item: PosReturn;
  approval: PosApproval;
  providers: readonly PaymentProvider[];
  catalog: PosBootstrap["catalog"];
  campaigns: PosBootstrap["campaigns"];
  registerId: string;
  shiftId: string;
  sale?: PosSale;
}) {
  const [refundState, refundAction, refundPending] = useActionState(
    completePosReturnAction,
    initialPosActionState,
  );
  const [exchangeState, exchangeAction, exchangePending] = useActionState(
    completePosExchangeAction,
    initialPosActionState,
  );
  const [kind, setKind] = useState<"cash" | "card" | "mfs">("cash");
  const [providerId, setProviderId] = useState("");
  const [reference, setReference] = useState("");
  const [variantId, setVariantId] = useState(catalog[0]?.variantId ?? "");
  const replacement = useMemo(
    () => catalog.find((entry) => entry.variantId === variantId),
    [catalog, variantId],
  );
  const replacementDiscount = replacement
    ? catalogCampaignDiscount(replacement, campaigns)
    : 0;
  const net =
    (replacement?.priceMinor ?? 0) -
    replacementDiscount -
    item.totalRefundMinor;
  const providersForKind = providers.filter((entry) => entry.category === kind);
  const originalRefund = (amountMinor: number) =>
    allocateOriginalRefundTenders(
      sale,
      amountMinor,
      tender(kind, amountMinor, providerId, reference),
      reference,
    );
  const refundTenders = originalRefund(item.totalRefundMinor);
  const exchangeTenders =
    net === 0
      ? []
      : net < 0
        ? originalRefund(-net)
        : [tender(kind, net, providerId, reference)];
  return (
    <div className="pos-settlement-grid">
      <form action={refundAction} className="pos-settlement-card">
        <h4>Refund {formatMoney(item.totalRefundMinor)}</h4>
        <input name="returnId" type="hidden" value={item.id} />
        <input name="approvalId" type="hidden" value={approval.id} />
        <input name="version" type="hidden" value={item.version} />
        <input
          name="tenders"
          type="hidden"
          value={JSON.stringify(refundTenders)}
        />
        <SettlementTenderFields
          kind={kind}
          onKind={setKind}
          onProvider={setProviderId}
          onReference={setReference}
          providerId={providerId}
          providers={providersForKind}
          reference={reference}
        />
        <button className="button small" disabled={refundPending}>
          Complete refund
        </button>
        {refundState.message && <small>{refundState.message}</small>}
      </form>
      <form action={exchangeAction} className="pos-settlement-card">
        <h4>Exchange</h4>
        <select
          className="select"
          onChange={(event) => setVariantId(event.target.value)}
          value={variantId}
        >
          {catalog
            .filter((entry) => entry.available > 0)
            .map((entry) => (
              <option key={entry.variantId} value={entry.variantId}>
                {entry.productName} · {entry.variantLabel} ·{" "}
                {formatMoney(entry.priceMinor)}
              </option>
            ))}
        </select>
        <p className="muted">
          {net > 0
            ? `${formatMoney(net)} to collect`
            : net < 0
              ? `${formatMoney(-net)} to refund`
              : "Even exchange"}
        </p>
        <input
          name="payload"
          type="hidden"
          value={JSON.stringify({
            returnId: item.id,
            approvalId: approval.id,
            registerId,
            shiftId,
            replacementLines: [{ variantId, quantity: 1 }],
            tenders: exchangeTenders,
          })}
        />
        {net !== 0 && (
          <SettlementTenderFields
            kind={kind}
            onKind={setKind}
            onProvider={setProviderId}
            onReference={setReference}
            providerId={providerId}
            providers={providersForKind}
            reference={reference}
          />
        )}
        <button
          className="button small"
          disabled={exchangePending || !variantId}
        >
          Complete exchange
        </button>
        {exchangeState.message && <small>{exchangeState.message}</small>}
      </form>
    </div>
  );
}
