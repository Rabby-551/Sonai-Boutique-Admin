import {
  OperationsError,
  type OperationsErrorCode,
} from "@/lib/operations-error";

const codeByStatus: Partial<Record<number, OperationsErrorCode>> = {
  401: "FORBIDDEN",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  422: "VALIDATION",
};

/** Small server-only JSON client that keeps future API failures aligned with mock repository errors. */
export class OperationsClient {
  constructor(private readonly baseUrl: string) {}

  async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: { "content-type": "application/json", ...init?.headers },
      cache: "no-store",
    });
    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as {
        message?: string;
      };
      const code = codeByStatus[response.status] ?? "STORE_INVALID";
      throw new OperationsError(
        code,
        body.message ?? `Operations API failed with status ${response.status}.`,
      );
    }
    return response.json() as Promise<T>;
  }
}
