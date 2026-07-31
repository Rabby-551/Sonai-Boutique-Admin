import "server-only";
import { env } from "@/lib/env";
import type { CampaignRepository } from "./repository";
import { FileCampaignRepository } from "./file-repository";
import { HttpCampaignRepository } from "./http-repository";
export function getCampaignRepository(): CampaignRepository {
  return env.DATA_SOURCE === "api"
    ? new HttpCampaignRepository()
    : new FileCampaignRepository();
}
