export interface ComplaintActionState {
  status: "idle" | "success" | "error";
  message: string;
  id?: string;
}
export const initialComplaintActionState: ComplaintActionState = {
  status: "idle",
  message: "",
};
