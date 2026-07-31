import { env } from "@/lib/env";
import { OperationsClient } from "@/lib/http/operations-client";
import type {
  Customer,
  LoyaltySettings,
  LoyaltyTransaction,
} from "../schemas/customers";
import type {
  CustomerDetail,
  CustomerListInput,
  CustomerMutationInput,
  CustomerPage,
  CustomerRepository,
} from "./repository";

const query = (input: object) =>
  `?${new URLSearchParams(
    Object.entries(input)
      .filter(([, value]) => value != null)
      .map(([key, value]) => [key, String(value)]),
  )}`;

/** API-TODO: align these endpoints with the selected backend without changing UI contracts. */
export class HttpCustomerRepository implements CustomerRepository {
  private readonly client = new OperationsClient(env.API_BASE_URL);
  list(input: CustomerListInput) {
    return this.client.request<CustomerPage>(`/customers${query(input)}`);
  }
  get(id: string) {
    return this.client.request<CustomerDetail | null>(`/customers/${id}`);
  }
  create(input: CustomerMutationInput, actorId: string) {
    return this.post<Customer>("/customers", { ...input, actorId });
  }
  update(
    id: string,
    input: CustomerMutationInput,
    expectedVersion: number,
    actorId: string,
  ) {
    return this.post<Customer>(`/customers/${id}`, {
      ...input,
      expectedVersion,
      actorId,
    });
  }
  archive(id: string, expectedVersion: number, actorId: string) {
    return this.post<Customer>(`/customers/${id}/archive`, {
      expectedVersion,
      actorId,
    });
  }
  adjustLoyalty(
    id: string,
    points: number,
    reason: string,
    commandId: string,
    actorId: string,
  ) {
    return this.post<LoyaltyTransaction>(`/customers/${id}/loyalty`, {
      points,
      reason,
      commandId,
      actorId,
    });
  }
  getLoyaltySettings() {
    return this.client.request<LoyaltySettings>("/loyalty-settings");
  }
  updateLoyaltySettings(
    spendPerPointMinor: number,
    pointsPerUnit: number,
    expectedVersion: number,
    actorId: string,
  ) {
    return this.post<LoyaltySettings>("/loyalty-settings", {
      spendPerPointMinor,
      pointsPerUnit,
      expectedVersion,
      actorId,
    });
  }
  private post<T>(path: string, body: unknown) {
    return this.client.request<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }
}
