export class CatalogError extends Error {
  constructor(
    public readonly code:
      | "CONFLICT"
      | "DUPLICATE"
      | "NOT_FOUND"
      | "CATEGORY_IN_USE"
      | "VALIDATION"
      | "STORE_INVALID",
    message: string,
  ) {
    super(message);
  }
}
