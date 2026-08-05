import { env } from "@/lib/env";
import { OperationsClient } from "@/lib/http/operations-client";
import type {
  PaymentProvider,
  PosApproval,
  PosExchange,
  PosRegister,
  PosReturn,
  PosSale,
  RegisterShift,
} from "../schemas/pos";
import type {
  CompleteSaleInput,
  PosBootstrap,
  PosRepository,
} from "./repository";

const query = (input: Record<string, string | null | undefined>) =>
  `?${new URLSearchParams(
    Object.entries(input).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  )}`;

/** Future live API adapter. Presentation code uses the same contract as the v5 file store. */
export class HttpPosRepository implements PosRepository {
  private readonly client = new OperationsClient(env.API_BASE_URL);
  bootstrap(locationId: string | null, cashierId: string) {
    return this.client.request<PosBootstrap>(
      `/pos/bootstrap${query({ locationId, cashierId })}`,
    );
  }
  openShift(input: Parameters<PosRepository["openShift"]>[0]) {
    return this.post<RegisterShift>("/pos/shifts", input);
  }
  closeShift(input: Parameters<PosRepository["closeShift"]>[0]) {
    return this.post<RegisterShift>(
      `/pos/shifts/${input.shiftId}/close`,
      input,
    );
  }
  completeSale(input: CompleteSaleInput) {
    return this.post<PosSale>("/pos/sales", input);
  }
  listSales(search?: string, locationId?: string | null) {
    return this.client.request<readonly PosSale[]>(
      `/pos/sales${query({ search, locationId })}`,
    );
  }
  getSale(id: string) {
    return this.client.request<PosSale | null>(`/pos/sales/${id}`);
  }
  listReturns(locationId?: string | null) {
    return this.client.request<readonly PosReturn[]>(
      `/pos/returns${query({ locationId })}`,
    );
  }
  findCustomer(phone: string) {
    return this.client.request<
      Awaited<ReturnType<PosRepository["findCustomer"]>>
    >(`/pos/customers/lookup${query({ phone })}`);
  }
  createCustomer(name: string, phone: string, actorId: string) {
    return this.post<Awaited<ReturnType<PosRepository["createCustomer"]>>>(
      "/pos/customers",
      {
        name,
        phone,
        actorId,
      },
    );
  }
  requestApproval(input: Parameters<PosRepository["requestApproval"]>[0]) {
    return this.post<PosApproval>("/pos/approvals", input);
  }
  listApprovals() {
    return this.client.request<readonly PosApproval[]>("/pos/approvals");
  }
  decideApproval(
    id: string,
    decision: "approved" | "rejected",
    expectedVersion: number,
    actorId: string,
  ) {
    return this.post<PosApproval>(`/pos/approvals/${id}`, {
      decision,
      expectedVersion,
      actorId,
    });
  }
  requestReturn(input: Parameters<PosRepository["requestReturn"]>[0]) {
    return this.post<PosReturn>("/pos/returns", input);
  }
  completeReturn(input: Parameters<PosRepository["completeReturn"]>[0]) {
    return this.post<PosReturn>(
      `/pos/returns/${input.returnId}/complete`,
      input,
    );
  }
  completeExchange(input: Parameters<PosRepository["completeExchange"]>[0]) {
    return this.post<PosExchange>("/pos/exchanges", input);
  }
  listShifts(locationId?: string | null) {
    return this.client.request<readonly RegisterShift[]>(
      `/pos/shifts${query({ locationId })}`,
    );
  }
  listLocations() {
    return this.client.request<
      Awaited<ReturnType<PosRepository["listLocations"]>>
    >("/pos/stores");
  }
  listRegisters() {
    return this.client.request<readonly PosRegister[]>("/pos/registers");
  }
  saveLocation(input: Parameters<PosRepository["saveLocation"]>[0]) {
    return this.post<Awaited<ReturnType<PosRepository["saveLocation"]>>>(
      `/pos/stores/${input.id}`,
      input,
    );
  }
  saveRegister(input: Parameters<PosRepository["saveRegister"]>[0]) {
    return this.post<PosRegister>(
      input.id ? `/pos/registers/${input.id}` : "/pos/registers",
      input,
    );
  }
  listProviders() {
    return this.client.request<readonly PaymentProvider[]>(
      "/pos/payment-providers",
    );
  }
  saveProvider(input: Parameters<PosRepository["saveProvider"]>[0]) {
    return this.post<PaymentProvider>(
      input.id
        ? `/pos/payment-providers/${input.id}`
        : "/pos/payment-providers",
      input,
    );
  }
  private post<T>(path: string, body: unknown) {
    return this.client.request<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }
}
