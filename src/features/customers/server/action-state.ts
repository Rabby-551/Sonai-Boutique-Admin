export interface CustomerActionState {
  status: "idle" | "success" | "error";
  message: string;
  id?: string;
}

export const initialCustomerActionState: CustomerActionState = {
  status: "idle",
  message: "",
};
