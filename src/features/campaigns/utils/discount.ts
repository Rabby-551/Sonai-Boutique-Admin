import type { ShonaiStore } from "@/lib/mock-store/schema";

/** Selects one deterministic campaign; Phase 5 intentionally never stacks discounts. */
export function calculateCampaignDiscount(
  store: ShonaiStore,
  lines: { variantId: string; quantity: number; unitPriceMinor: number }[],
  at = new Date(),
) {
  const instant = at.toISOString();
  const eligible = store.campaigns
    .filter(
      (item) =>
        ["scheduled", "active"].includes(item.status) &&
        item.startsAt <= instant &&
        item.endsAt >= instant,
    )
    .map((campaign) => {
      const eligibleMinor = lines.reduce((sum, line) => {
        const product = store.products.find((item) =>
          item.variants.some((variant) => variant.id === line.variantId),
        );
        const matches =
          campaign.scope === "store" ||
          (campaign.scope === "variant" &&
            campaign.targetIds.includes(line.variantId)) ||
          (campaign.scope === "product" &&
            !!product &&
            campaign.targetIds.includes(product.id)) ||
          (campaign.scope === "category" &&
            !!product &&
            campaign.targetIds.includes(product.categoryId));
        return sum + (matches ? line.unitPriceMinor * line.quantity : 0);
      }, 0);
      return {
        campaign,
        discountMinor: Math.floor(
          (eligibleMinor * campaign.percentageOff) / 100,
        ),
      };
    })
    .filter((item) => item.discountMinor > 0)
    .sort(
      (a, b) =>
        b.discountMinor - a.discountMinor ||
        b.campaign.priority - a.campaign.priority ||
        a.campaign.id.localeCompare(b.campaign.id),
    );
  return eligible[0] ?? null;
}
