export interface DemoActionState {
  status: "idle" | "success" | "error";
  message: string;
}

export const initialDemoActionState: DemoActionState = {
  status: "idle",
  message: "",
};
