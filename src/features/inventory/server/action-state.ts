export interface InventoryActionState {
  status: "idle" | "success" | "error";
  message: string;
  id?: string;
}
export const initialInventoryActionState: InventoryActionState = {
  status: "idle",
  message: "",
};
