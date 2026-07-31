export type OperationsErrorCode =
  | "VALIDATION"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INSUFFICIENT_STOCK"
  | "INVALID_TRANSITION"
  | "DUPLICATE_COMMAND"
  | "DUPLICATE_CUSTOMER"
  | "RECEIPT_MISMATCH"
  | "STORE_INVALID";

export class OperationsError extends Error {
  constructor(
    public readonly code: OperationsErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "OperationsError";
  }
}
