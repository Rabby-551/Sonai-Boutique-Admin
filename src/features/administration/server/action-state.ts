export type AdministrationActionState = {
  status: "idle" | "success" | "error";
  message: string;
  id?: string;
};
export const initialAdministrationActionState: AdministrationActionState = {
  status: "idle",
  message: "",
};
