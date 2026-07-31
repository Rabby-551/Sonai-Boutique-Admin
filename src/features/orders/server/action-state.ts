export interface OrderActionState {
  status: "idle" | "success" | "error";
  message: string;
  id?: string;
}
export const initialOrderActionState: OrderActionState = {
  status: "idle",
  message: "",
};
