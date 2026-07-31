import type { LocationId } from "@/features/inventory/schemas/inventory";
import type {
  Order,
  OrderReturn,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "../schemas/orders";

export interface OrderListInput {
  query?: string;
  source?: "all" | Order["source"];
  locationId?: "all" | LocationId;
  status?: "all" | OrderStatus;
  paymentStatus?: "all" | PaymentStatus;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}
export interface OrderPage {
  items: readonly Order[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
export interface CreateOrderInput {
  source: "phone" | "branch" | "whatsapp" | "messenger";
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  deliveryAddress: string | null;
  preferredLocationId: LocationId | null;
  lines: readonly { variantId: string; quantity: number }[];
  deliveryMinor: number;
  paymentMethod: PaymentMethod;
  notes: string;
  actorId: string;
  idempotencyKey: string;
}

/** Order and fulfillment contract independent of mock or future HTTP infrastructure. */
export interface OrderRepository {
  listOrders(input: OrderListInput): Promise<OrderPage>;
  getOrder(id: string): Promise<Order | null>;
  createOrder(input: CreateOrderInput): Promise<Order>;
  assignOrder(
    id: string,
    locationId: LocationId,
    expectedVersion: number,
    actorId: string,
  ): Promise<Order>;
  recordPayment(
    id: string,
    outcome: "paid" | "failed",
    expectedVersion: number,
    commandId: string,
    actorId: string,
  ): Promise<Order>;
  confirmOrder(
    id: string,
    expectedVersion: number,
    commandId: string,
    actorId: string,
  ): Promise<Order>;
  transitionOrder(
    id: string,
    nextStatus: "picking" | "packed" | "shipped" | "delivered",
    expectedVersion: number,
    commandId: string,
    actorId: string,
  ): Promise<Order>;
  cancelOrder(
    id: string,
    reason: string,
    expectedVersion: number,
    commandId: string,
    actorId: string,
  ): Promise<Order>;
  addNote(
    id: string,
    note: string,
    expectedVersion: number,
    actorId: string,
  ): Promise<Order>;
  requestReturn(
    id: string,
    lines: readonly { variantId: string; quantity: number }[],
    reason: string,
    expectedVersion: number,
    actorId: string,
  ): Promise<OrderReturn>;
  decideReturn(
    orderId: string,
    returnId: string,
    decision: "approved" | "rejected",
    expectedVersion: number,
    actorId: string,
  ): Promise<OrderReturn>;
  receiveReturn(
    orderId: string,
    returnId: string,
    expectedVersion: number,
    commandId: string,
    actorId: string,
  ): Promise<Order>;
}
