import type { Campaign, CampaignMutationInput } from "../schemas/campaigns";
export interface CampaignSummary extends Campaign {
  orderCount: number;
  revenueMinor: number;
  discountMinor: number;
  roiPercent: number;
}
/** Campaign contract with deterministic scheduling and non-stacking attribution. */
export interface CampaignRepository {
  list(input?: { query?: string; status?: string }): Promise<CampaignSummary[]>;
  get(id: string): Promise<CampaignSummary>;
  create(input: CampaignMutationInput, actorId: string): Promise<Campaign>;
  update(
    id: string,
    input: CampaignMutationInput,
    expectedVersion: number,
    actorId: string,
  ): Promise<Campaign>;
  transition(
    id: string,
    next: Campaign["status"],
    expectedVersion: number,
    actorId: string,
  ): Promise<Campaign>;
}
