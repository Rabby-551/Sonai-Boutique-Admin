import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { ShonaiFileStore } from "@/lib/mock-store/file-store";
import { createShonaiStore } from "@/lib/mock-store/fixtures";
import { FileCampaignRepository } from "../data/file-repository";
import { calculateCampaignDiscount } from "../utils/discount";
const directories: string[] = [];
afterEach(async () => {
  for (const directory of directories.splice(0))
    await rm(directory, { recursive: true, force: true });
});
describe("campaign repository", () => {
  it("enforces transitions and selects the largest non-stacking discount", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "shonai-campaign-"));
    directories.push(directory);
    const store = new ShonaiFileStore(directory);
    await store.write(createShonaiStore());
    const repo = new FileCampaignRepository(store);
    let campaign = await repo.create(
      {
        name: "Test Campaign",
        description: "Deterministic discount test.",
        scope: "store",
        targetIds: [],
        percentageOff: 20,
        startsAt: "2026-07-01T00:00:00.000Z",
        endsAt: "2026-09-01T00:00:00.000Z",
        priority: 1,
        budgetMinor: null,
        usageLimit: null,
        estimatedCostMinor: 0,
      },
      "usr-manager-01",
    );
    campaign = await repo.transition(
      campaign.id,
      "scheduled",
      campaign.version,
      "usr-manager-01",
    );
    campaign = await repo.transition(
      campaign.id,
      "active",
      campaign.version,
      "usr-manager-01",
    );
    const snapshot = await store.read();
    const product = snapshot.products[0];
    const variant = product.variants[0];
    const result = calculateCampaignDiscount(
      snapshot,
      [
        {
          variantId: variant.id,
          quantity: 1,
          unitPriceMinor: product.priceMinor,
        },
      ],
      new Date("2026-08-02T00:00:00.000Z"),
    );
    expect(result?.campaign.id).toBe(campaign.id);
    expect(result?.discountMinor).toBe(Math.floor(product.priceMinor * 0.2));
    await expect(
      repo.transition(
        campaign.id,
        "scheduled",
        campaign.version,
        "usr-manager-01",
      ),
    ).rejects.toThrow(/cannot move/);
  });
});
