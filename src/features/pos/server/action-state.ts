export interface PosActionState {
  status: "idle" | "success" | "error";
  message: string;
  id?: string;
  customer?: { id: string; name: string; phone: string } | null;
}

export const initialPosActionState: PosActionState = {
  status: "idle",
  message: "",
};
