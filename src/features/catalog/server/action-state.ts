export interface CatalogActionState {
  status: "idle" | "success" | "error";
  message: string;
  id?: string;
  fieldErrors?: Record<string, string[]>;
}

/** Serializable initial value shared by catalog forms without exporting data from a `use server` module. */
export const initialCatalogActionState: CatalogActionState = {
  status: "idle",
  message: "",
};
