import { env } from "@/lib/env";
import { OperationsClient } from "@/lib/http/operations-client";
import type { Campaign, CampaignMutationInput } from "../schemas/campaigns";
import type { CampaignRepository, CampaignSummary } from "./repository";
export class HttpCampaignRepository implements CampaignRepository {
  private readonly client = new OperationsClient(
    `${env.API_BASE_URL}/campaigns`,
  );
  list(input: { query?: string; status?: string } = {}) {
    return this.client.request<CampaignSummary[]>(
      `?${new URLSearchParams(input).toString()}`,
    );
  }
  get(id: string) {
    return this.client.request<CampaignSummary>(`/${id}`);
  }
  create(input: CampaignMutationInput, actorId: string) {
    return this.post<Campaign>("", { input, actorId });
  }
  update(
    id: string,
    input: CampaignMutationInput,
    expectedVersion: number,
    actorId: string,
  ) {
    return this.post<Campaign>(`/${id}`, { input, expectedVersion, actorId });
  }
  transition(
    id: string,
    next: Campaign["status"],
    expectedVersion: number,
    actorId: string,
  ) {
    return this.post<Campaign>(`/${id}/${next}`, { expectedVersion, actorId });
  }
  private post<T>(path: string, body: unknown) {
    return this.client.request<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }
}
