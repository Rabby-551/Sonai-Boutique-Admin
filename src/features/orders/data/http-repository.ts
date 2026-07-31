import { env } from "@/lib/env";
import { OperationsClient } from "@/lib/http/operations-client";
import type { LocationId } from "@/features/inventory/schemas/inventory";
import type { Order, OrderReturn } from "../schemas/orders";
import type {
  CreateOrderInput,
  OrderListInput,
  OrderPage,
  OrderRepository,
} from "./repository";

const query = (input: object) =>
  `?${new URLSearchParams(
    Object.entries(input)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, String(value)]),
  )}`;

/** Future order API adapter preserving the repository result and error contract. */
export class HttpOrderRepository implements OrderRepository {
  private readonly client = new OperationsClient(env.API_BASE_URL);
  listOrders(input: OrderListInput) {
    return this.client.request<OrderPage>(`/orders${query(input)}`);
  }
  getOrder(id: string) {
    return this.client.request<Order | null>(`/orders/${id}`);
  }
  createOrder(input: CreateOrderInput) {
    return this.post<Order>("/orders", input);
  }
  assignOrder(
    id: string,
    locationId: LocationId,
    expectedVersion: number,
    actorId: string,
  ) {
    return this.post<Order>(`/orders/${id}/assignment`, {
      locationId,
      expectedVersion,
      actorId,
    });
  }
  recordPayment(
    id: string,
    outcome: "paid" | "failed",
    expectedVersion: number,
    commandId: string,
    actorId: string,
  ) {
    return this.post<Order>(`/orders/${id}/payments`, {
      outcome,
      expectedVersion,
      commandId,
      actorId,
    });
  }
  confirmOrder(
    id: string,
    expectedVersion: number,
    commandId: string,
    actorId: string,
  ) {
    return this.post<Order>(`/orders/${id}/confirm`, {
      expectedVersion,
      commandId,
      actorId,
    });
  }
  transitionOrder(
    id: string,
    nextStatus: "picking" | "packed" | "shipped" | "delivered",
    expectedVersion: number,
    commandId: string,
    actorId: string,
  ) {
    return this.post<Order>(`/orders/${id}/transitions`, {
      nextStatus,
      expectedVersion,
      commandId,
      actorId,
    });
  }
  cancelOrder(
    id: string,
    reason: string,
    expectedVersion: number,
    commandId: string,
    actorId: string,
  ) {
    return this.post<Order>(`/orders/${id}/cancel`, {
      reason,
      expectedVersion,
      commandId,
      actorId,
    });
  }
  addNote(id: string, note: string, expectedVersion: number, actorId: string) {
    return this.post<Order>(`/orders/${id}/notes`, {
      note,
      expectedVersion,
      actorId,
    });
  }
  requestReturn(
    id: string,
    lines: readonly { variantId: string; quantity: number }[],
    reason: string,
    expectedVersion: number,
    actorId: string,
  ) {
    return this.post<OrderReturn>(`/orders/${id}/returns`, {
      lines,
      reason,
      expectedVersion,
      actorId,
    });
  }
  decideReturn(
    orderId: string,
    returnId: string,
    decision: "approved" | "rejected",
    expectedVersion: number,
    actorId: string,
  ) {
    return this.post<OrderReturn>(
      `/orders/${orderId}/returns/${returnId}/decision`,
      { decision, expectedVersion, actorId },
    );
  }
  receiveReturn(
    orderId: string,
    returnId: string,
    expectedVersion: number,
    commandId: string,
    actorId: string,
  ) {
    return this.post<Order>(`/orders/${orderId}/returns/${returnId}/receive`, {
      expectedVersion,
      commandId,
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
