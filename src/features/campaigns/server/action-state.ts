export type CampaignActionState = {
  status: "idle" | "success" | "error";
  message: string;
  id?: string;
};
export const initialCampaignActionState: CampaignActionState = {
  status: "idle",
  message: "",
};
