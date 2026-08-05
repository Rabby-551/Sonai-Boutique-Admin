import type {
  PosBootstrap,
  PosCatalogItem,
  TenderInput,
} from "../data/repository";
import type { PosSale, PosSaleLine, PosTender } from "../schemas/pos";

export function catalogCampaignDiscount(
  item: PosCatalogItem,
  campaigns: PosBootstrap["campaigns"],
  quantity = 1,
) {
  return (
    campaigns
      .filter(
        (campaign) =>
          campaign.scope === "store" ||
          (campaign.scope === "variant" &&
            campaign.targetIds.includes(item.variantId)) ||
          (campaign.scope === "product" &&
            campaign.targetIds.includes(item.productId)) ||
          (campaign.scope === "category" &&
            campaign.targetIds.includes(item.categoryId)),
      )
      .map((campaign) =>
        Math.floor((item.priceMinor * quantity * campaign.percentageOff) / 100),
      )
      .sort((a, b) => b - a)[0] ?? 0
  );
}

export function allocateOriginalRefundTenders(
  sale: PosSale | undefined,
  amountMinor: number,
  fallback: TenderInput,
  reference: string,
) {
  if (!sale) return [fallback];
  let remaining = amountMinor;
  return sale.tenders.flatMap((entry, index): TenderInput[] => {
    const amount = Math.min(entry.amountMinor, remaining);
    remaining -= amount;
    if (amount <= 0) return [];
    return [
      {
        kind: entry.kind,
        amountMinor: amount,
        providerId: entry.providerId,
        reference:
          entry.kind === "cash"
            ? null
            : `${reference || "REFUND"}-${index + 1}`,
        receivedMinor: entry.kind === "cash" ? amount : null,
      },
    ];
  });
}

export function normalizeBangladeshPhone(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  if (/^01\d{9}$/.test(digits)) return `+88${digits}`;
  if (/^8801\d{9}$/.test(digits)) return `+${digits}`;
  return null;
}

/** Allocates an order-level discount deterministically and preserves the exact total. */
export function allocateDiscount(
  lines: readonly { quantity: number; unitPriceMinor: number }[],
  discountMinor: number,
) {
  const totals = lines.map((line) => line.quantity * line.unitPriceMinor);
  const subtotal = totals.reduce((sum, value) => sum + value, 0);
  const discount = Math.min(Math.max(discountMinor, 0), subtotal);
  if (!subtotal || !discount) return totals.map(() => 0);
  let allocated = 0;
  return totals.map((lineTotal, index) => {
    const value =
      index === totals.length - 1
        ? discount - allocated
        : Math.floor((discount * lineTotal) / subtotal);
    allocated += value;
    return value;
  });
}

export function refundableQuantity(
  line: PosSaleLine,
  returned: readonly {
    lines: readonly { variantId: string; quantity: number }[];
    status: string;
  }[],
) {
  const used = returned
    .filter((item) => item.status !== "rejected")
    .flatMap((item) => item.lines)
    .filter((item) => item.variantId === line.variantId)
    .reduce((sum, item) => sum + item.quantity, 0);
  return Math.max(line.quantity - used, 0);
}

export function tenderBalance(tenders: readonly PosTender[]) {
  return tenders.reduce(
    (total, tender) =>
      total +
      (tender.direction === "payment"
        ? tender.amountMinor
        : -tender.amountMinor),
    0,
  );
}

export function cashImpact(tenders: readonly PosTender[]) {
  return tenders
    .filter((tender) => tender.kind === "cash")
    .reduce(
      (total, tender) =>
        total +
        (tender.direction === "payment"
          ? tender.amountMinor
          : -tender.amountMinor),
      0,
    );
}

export function cartFingerprint(input: unknown) {
  return JSON.stringify(input);
}
