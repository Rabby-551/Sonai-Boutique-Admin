export type WorkforceActionState = {
  status: "idle" | "success" | "error";
  message: string;
  id?: string;
};
export const initialWorkforceActionState: WorkforceActionState = {
  status: "idle",
  message: "",
};
