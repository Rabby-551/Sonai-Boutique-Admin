import { env } from "@/lib/env";
import { OperationsClient } from "@/lib/http/operations-client";
import type { PurchaseOrder, Supplier } from "../schemas/procurement";
import type {
  ProcurementPage,
  ProcurementRepository,
  PurchaseOrderListInput,
  PurchaseOrderMutationInput,
  ReceiptInput,
  SupplierMutationInput,
} from "./repository";
const query = (input: object) =>
  `?${new URLSearchParams(
    Object.entries(input)
      .filter(([, value]) => value != null)
      .map(([key, value]) => [key, String(value)]),
  )}`;
export class HttpProcurementRepository implements ProcurementRepository {
  private readonly client = new OperationsClient(env.API_BASE_URL);
  listSuppliers() {
    return this.client.request<readonly Supplier[]>("/suppliers");
  }
  getSupplier(id: string) {
    return this.client.request<Supplier | null>(`/suppliers/${id}`);
  }
  createSupplier(input: SupplierMutationInput, actorId: string) {
    return this.post<Supplier>("/suppliers", { ...input, actorId });
  }
  updateSupplier(
    id: string,
    input: SupplierMutationInput,
    expectedVersion: number,
    actorId: string,
  ) {
    return this.post<Supplier>(`/suppliers/${id}`, {
      ...input,
      expectedVersion,
      actorId,
    });
  }
  archiveSupplier(id: string, expectedVersion: number, actorId: string) {
    return this.post<Supplier>(`/suppliers/${id}/archive`, {
      expectedVersion,
      actorId,
    });
  }
  listPurchaseOrders(input: PurchaseOrderListInput) {
    return this.client.request<ProcurementPage<PurchaseOrder>>(
      `/purchase-orders${query(input)}`,
    );
  }
  getPurchaseOrder(id: string) {
    return this.client.request<PurchaseOrder | null>(`/purchase-orders/${id}`);
  }
  createPurchaseOrder(input: PurchaseOrderMutationInput) {
    return this.post<PurchaseOrder>("/purchase-orders", input);
  }
  updatePurchaseOrder(
    id: string,
    input: PurchaseOrderMutationInput,
    expectedVersion: number,
  ) {
    return this.post<PurchaseOrder>(`/purchase-orders/${id}`, {
      ...input,
      expectedVersion,
    });
  }
  submitPurchaseOrder(
    id: string,
    expectedVersion: number,
    commandId: string,
    actorId: string,
  ) {
    return this.post<PurchaseOrder>(`/purchase-orders/${id}/submit`, {
      expectedVersion,
      commandId,
      actorId,
    });
  }
  decidePurchaseOrder(
    id: string,
    decision: "approved" | "rejected",
    reason: string,
    expectedVersion: number,
    actorId: string,
  ) {
    return this.post<PurchaseOrder>(`/purchase-orders/${id}/decision`, {
      decision,
      reason,
      expectedVersion,
      actorId,
    });
  }
  revisePurchaseOrder(id: string, expectedVersion: number, actorId: string) {
    return this.post<PurchaseOrder>(`/purchase-orders/${id}/revise`, {
      expectedVersion,
      actorId,
    });
  }
  transitionPurchaseOrder(
    id: string,
    next: "supplier_confirmed" | "in_transit",
    reference: string,
    expectedVersion: number,
    actorId: string,
  ) {
    return this.post<PurchaseOrder>(`/purchase-orders/${id}/transitions`, {
      next,
      reference,
      expectedVersion,
      actorId,
    });
  }
  receivePurchaseOrder(id: string, input: ReceiptInput) {
    return this.post<PurchaseOrder>(`/purchase-orders/${id}/receipts`, input);
  }
  finishPurchaseOrder(
    id: string,
    action: "close" | "cancel",
    reason: string,
    expectedVersion: number,
    actorId: string,
  ) {
    return this.post<PurchaseOrder>(`/purchase-orders/${id}/${action}`, {
      reason,
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
