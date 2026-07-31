export interface ProcurementActionState {
  status: "idle" | "success" | "error";
  message: string;
  id?: string;
}
export const initialProcurementActionState: ProcurementActionState = {
  status: "idle",
  message: "",
};
