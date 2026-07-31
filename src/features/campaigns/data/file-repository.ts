import { randomUUID } from "node:crypto";
import { appendAudit } from "@/features/administration/data/audit";
import { ShonaiFileStore } from "@/lib/mock-store/file-store";
import type { ShonaiStore } from "@/lib/mock-store/schema";
import { OperationsError } from "@/lib/operations-error";
import type { Campaign, CampaignMutationInput } from "../schemas/campaigns";
import type { CampaignRepository, CampaignSummary } from "./repository";

export class FileCampaignRepository implements CampaignRepository {
  constructor(private readonly store = new ShonaiFileStore()) {}
  async list(input: { query?: string; status?: string } = {}) {
    const store = await this.store.read();
    const query = input.query?.toLowerCase();
    return store.campaigns
      .filter(
        (item) =>
          !query || `${item.name} ${item.code}`.toLowerCase().includes(query),
      )
      .filter(
        (item) =>
          !input.status ||
          input.status === "all" ||
          item.status === input.status,
      )
      .map((item) => this.summary(store, item))
      .sort((a, b) => b.startsAt.localeCompare(a.startsAt));
  }
  async get(id: string) {
    const store = await this.store.read();
    return this.summary(store, this.byId(store, id));
  }
  async create(input: CampaignMutationInput, actorId: string) {
    return this.store.transaction((store) => {
      this.validate(store, input);
      store.campaignSequences += 1;
      const now = new Date().toISOString();
      const item: Campaign = {
        id: `cmp-${randomUUID()}`,
        code: `CMP-${String(store.campaignSequences).padStart(4, "0")}`,
        ...input,
        status: "draft",
        createdBy: actorId,
        createdAt: now,
        updatedAt: now,
        version: 1,
      };
      store.campaigns.push(item);
      appendAudit(store, {
        module: "campaigns",
        action: "created",
        entityType: "campaign",
        entityId: item.id,
        actorId,
        summary: `Created campaign ${item.code}.`,
      });
      return item;
    });
  }
  async update(
    id: string,
    input: CampaignMutationInput,
    expectedVersion: number,
    actorId: string,
  ) {
    return this.store.transaction((store) => {
      const item = this.version(store, id, expectedVersion);
      if (!["draft", "scheduled", "paused"].includes(item.status))
        throw new OperationsError(
          "INVALID_TRANSITION",
          "This campaign is no longer editable.",
        );
      this.validate(store, input);
      Object.assign(item, input, {
        version: item.version + 1,
        updatedAt: new Date().toISOString(),
      });
      appendAudit(store, {
        module: "campaigns",
        action: "updated",
        entityType: "campaign",
        entityId: id,
        actorId,
        summary: `Updated campaign ${item.code}.`,
      });
      return item;
    });
  }
  async transition(
    id: string,
    next: Campaign["status"],
    expectedVersion: number,
    actorId: string,
  ) {
    return this.store.transaction((store) => {
      const item = this.version(store, id, expectedVersion);
      const allowed: Record<Campaign["status"], Campaign["status"][]> = {
        draft: ["scheduled", "archived"],
        scheduled: ["active", "paused", "ended"],
        active: ["paused", "ended"],
        paused: ["active", "ended"],
        ended: ["archived"],
        archived: [],
      };
      if (!allowed[item.status].includes(next))
        throw new OperationsError(
          "INVALID_TRANSITION",
          `Campaign cannot move from ${item.status} to ${next}.`,
        );
      item.status = next;
      item.version += 1;
      item.updatedAt = new Date().toISOString();
      appendAudit(store, {
        module: "campaigns",
        action: next,
        entityType: "campaign",
        entityId: id,
        actorId,
        summary: `Campaign ${item.code} marked ${next}.`,
      });
      return item;
    });
  }
  private summary(store: ShonaiStore, item: Campaign): CampaignSummary {
    const orders = store.orders.filter(
      (order) => order.campaignId === item.id && order.status !== "cancelled",
    );
    const revenueMinor = orders.reduce(
      (sum, order) => sum + order.totalMinor - order.deliveryMinor,
      0,
    );
    const discountMinor = orders.reduce(
      (sum, order) => sum + order.discountMinor,
      0,
    );
    return {
      ...item,
      orderCount: orders.length,
      revenueMinor,
      discountMinor,
      roiPercent: item.estimatedCostMinor
        ? Math.round(
            ((revenueMinor - item.estimatedCostMinor) * 10_000) /
              item.estimatedCostMinor,
          ) / 100
        : 0,
    };
  }
  private byId(store: ShonaiStore, id: string) {
    const item = store.campaigns.find((entry) => entry.id === id);
    if (!item) throw new OperationsError("NOT_FOUND", "Campaign not found.");
    return item;
  }
  private version(store: ShonaiStore, id: string, version: number) {
    const item = this.byId(store, id);
    if (item.version !== version)
      throw new OperationsError(
        "CONFLICT",
        "Campaign changed. Refresh and review it.",
      );
    return item;
  }
  private validate(store: ShonaiStore, input: CampaignMutationInput) {
    if (input.endsAt <= input.startsAt)
      throw new OperationsError(
        "VALIDATION",
        "Campaign end must be after its start.",
      );
    if (input.scope !== "store" && !input.targetIds.length)
      throw new OperationsError(
        "VALIDATION",
        "Select at least one campaign target.",
      );
    const ids = new Set(
      store.products.flatMap((product) => [
        product.id,
        product.categoryId,
        ...product.variants.map((variant) => variant.id),
      ]),
    );
    if (input.targetIds.some((id) => !ids.has(id)))
      throw new OperationsError(
        "VALIDATION",
        "A campaign target does not exist.",
      );
  }
}
