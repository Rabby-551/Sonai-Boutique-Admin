export interface WebsiteActionState {
  status: "idle" | "success" | "error";
  message: string;
}

export const initialWebsiteActionState: WebsiteActionState = {
  status: "idle",
  message: "",
};
