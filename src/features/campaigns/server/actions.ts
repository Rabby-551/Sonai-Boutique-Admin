"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/session";
import { OperationsError } from "@/lib/operations-error";
import { campaignMutationSchema, campaignSchema } from "../schemas/campaigns";
import { getCampaignRepository } from "../data/repository-factory";
import type { CampaignActionState } from "./action-state";
const value = (form: FormData, key: string) =>
  String(form.get(key) ?? "").trim();
const input = (form: FormData) =>
  campaignMutationSchema.parse({
    name: value(form, "name"),
    description: value(form, "description"),
    scope: value(form, "scope"),
    targetIds: form
      .getAll("targetIds")
      .flatMap((item) => String(item).split(","))
      .map((item) => item.trim())
      .filter(Boolean),
    percentageOff: Number(value(form, "percentageOff")),
    startsAt: new Date(value(form, "startsAt")).toISOString(),
    endsAt: new Date(value(form, "endsAt")).toISOString(),
    priority: Number(value(form, "priority") || 0),
    budgetMinor: value(form, "budget")
      ? Math.round(Number(value(form, "budget")) * 100)
      : null,
    usageLimit: value(form, "usageLimit")
      ? Number(value(form, "usageLimit"))
      : null,
    estimatedCostMinor: Math.round(
      Number(value(form, "estimatedCost") || 0) * 100,
    ),
  });
const failure = (error: unknown): CampaignActionState => ({
  status: "error",
  message:
    error instanceof OperationsError
      ? error.message
      : error instanceof z.ZodError
        ? (error.issues[0]?.message ?? "Check the campaign.")
        : "The campaign could not be updated.",
});
const refresh = (id?: string) => {
  revalidatePath("/campaigns");
  revalidatePath("/reports");
  revalidatePath("/orders/new");
  if (id) revalidatePath(`/campaigns/${id}`);
};
export async function createCampaignAction(
  _previous: CampaignActionState,
  form: FormData,
): Promise<CampaignActionState> {
  try {
    const user = await requirePermission("campaigns.manage");
    const item = await getCampaignRepository().create(input(form), user.id);
    refresh(item.id);
    return {
      status: "success",
      message: "Campaign draft created.",
      id: item.id,
    };
  } catch (error) {
    return failure(error);
  }
}
export async function updateCampaignAction(
  id: string,
  _previous: CampaignActionState,
  form: FormData,
): Promise<CampaignActionState> {
  try {
    const user = await requirePermission("campaigns.manage");
    const item = await getCampaignRepository().update(
      id,
      input(form),
      Number(value(form, "expectedVersion")),
      user.id,
    );
    refresh(id);
    return { status: "success", message: "Campaign updated.", id: item.id };
  } catch (error) {
    return failure(error);
  }
}
export async function transitionCampaignAction(
  id: string,
  next: string,
  version: number,
): Promise<CampaignActionState> {
  try {
    const user = await requirePermission("campaigns.manage");
    await getCampaignRepository().transition(
      id,
      campaignSchema.shape.status.parse(next),
      version,
      user.id,
    );
    refresh(id);
    return { status: "success", message: `Campaign marked ${next}.`, id };
  } catch (error) {
    return failure(error);
  }
}
