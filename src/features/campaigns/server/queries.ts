import "server-only";
import { requirePermission } from "@/lib/auth/session";
import { getCampaignRepository } from "../data/repository-factory";
export async function listCampaigns(input: {
  query?: string;
  status?: string;
}) {
  await requirePermission("campaigns.view");
  return getCampaignRepository().list(input);
}
export async function getCampaign(id: string) {
  await requirePermission("campaigns.view");
  return getCampaignRepository().get(id);
}
