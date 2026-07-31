import "server-only";

import { createSonaiSupabaseServerClient } from "@/lib/supabase/server";
import { OperationsError } from "@/lib/operations-error";
import { orderSchema, type Order, type OrderReturn } from "../schemas/orders";
import type {
  CreateOrderInput,
  OrderListInput,
  OrderRepository,
} from "./repository";
import type { LocationId } from "@/features/inventory/schemas/inventory";

type Row = Record<string, unknown>;
const rows = (value: unknown): Row[] =>
  Array.isArray(value) ? (value as Row[]) : [];
const numeric = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
const minor = (value: unknown) => Math.round(numeric(value) * 100);
const iso = (value: unknown) =>
  typeof value === "string" ? value : new Date(0).toISOString();

async function client() {
  const supabase = await createSonaiSupabaseServerClient();
  if (!supabase)
    throw new OperationsError(
      "STORE_INVALID",
      "Live commerce is not configured.",
    );
  return supabase;
}

function normalizePhone(value: unknown) {
  const phone = String(value ?? "").replace(/[\s-]/g, "");
  if (/^\+8801\d{9}$/.test(phone)) return phone;
  if (/^01\d{9}$/.test(phone)) return `+88${phone}`;
  return "+8801000000000";
}

function addressText(value: unknown) {
  if (typeof value === "string" && value.length >= 8) return value;
  if (value && typeof value === "object") {
    const parts = Object.values(value as Row).filter(
      (part): part is string =>
        typeof part === "string" && part.trim().length > 0,
    );
    if (parts.join(", ").length >= 8) return parts.join(", ");
  }
  return "Sonai store pickup / address pending";
}

function mapStatus(value: unknown): Order["status"] {
  const status = String(value);
  if (status === "confirmed" || status === "paid") return "confirmed";
  if (status === "processing") return "picking";
  if (["shipped", "delivered", "cancelled"].includes(status))
    return status as Order["status"];
  if (status === "refunded" || status === "payment_failed") return "cancelled";
  return "placed";
}

function mapPaymentStatus(value: unknown): Order["paymentStatus"] {
  const status = String(value);
  if (["paid", "failed", "refunded"].includes(status))
    return status as Order["paymentStatus"];
  return "pending";
}

function toOrder(row: Row): Order {
  const paymentRows = rows(row.payments);
  const shipment = rows(row.shipments)[0];
  const orderLines = rows(row.order_items);
  const createdAt = iso(row.created_at);
  const paymentMethod = ["bkash", "nagad", "cod"].includes(
    String(row.payment_method),
  )
    ? String(row.payment_method)
    : "cod";
  const paymentStatus = mapPaymentStatus(paymentRows[0]?.status);
  const orderNumber = String(row.order_number ?? "");

  return orderSchema.parse({
    id: String(row.id),
    customerId: row.customer_id ? String(row.customer_id) : `guest:${row.id}`,
    orderNumber,
    source: ["website", "whatsapp", "messenger", "phone", "branch"].includes(
      String(row.source),
    )
      ? row.source
      : "website",
    customer: {
      name: String(row.contact_name ?? "Guest customer"),
      phone: normalizePhone(row.contact_phone),
      email:
        typeof row.contact_email === "string" && row.contact_email.includes("@")
          ? row.contact_email
          : null,
    },
    deliveryAddress: addressText(row.shipping_address),
    fulfillmentLocationId: null,
    lines: orderLines.map((line) => ({
      variantId: String(line.variant_id),
      sku: String(line.sku),
      productName: String(line.name_en ?? "Sonai product"),
      variantLabel: String(line.variant_label ?? "Default"),
      quantity: numeric(line.quantity),
      unitPriceMinor: minor(line.unit_price),
      unitCostMinor: 0,
    })),
    campaignId: null,
    discountMinor: minor(row.discount),
    subtotalMinor: minor(row.subtotal),
    deliveryMinor: minor(row.delivery_fee),
    totalMinor: minor(row.total),
    paymentMethod,
    paymentStatus,
    status: mapStatus(row.status),
    notes: String(row.notes ?? ""),
    timeline: [
      {
        id: `created-${row.id}`,
        type: "order_created",
        label: "Order created",
        detail: `${String(row.source ?? "website")} order entered Sonai operations.`,
        actorId: "sonai-commerce",
        occurredAt: createdAt,
      },
    ],
    payments: paymentRows.map((payment) => ({
      id: String(payment.id),
      method: paymentMethod,
      amountMinor: minor(payment.amount),
      status: mapPaymentStatus(payment.status),
      providerReference: String(
        payment.provider_transaction_id ??
          payment.provider_payment_id ??
          payment.id,
      ),
      createdAt: iso(payment.created_at),
    })),
    shipment: shipment
      ? {
          id: String(shipment.id),
          courier: String(shipment.courier_name ?? "Courier pending"),
          trackingReference: String(shipment.tracking_number ?? "Pending"),
          status: [
            "in_transit",
            "out_for_delivery",
            "delivered",
            "failed",
            "returned",
          ].includes(String(shipment.status))
            ? shipment.status
            : "label_created",
          createdAt: iso(shipment.created_at),
        }
      : null,
    returns: [],
    createdAt,
    updatedAt: iso(row.updated_at),
    version: Math.max(numeric(row.version), 1),
  });
}

const select = `
  id, order_number, customer_id, source, contact_name, contact_phone, contact_email,
  shipping_address, fulfillment_location_id, subtotal, delivery_fee, discount, total,
  payment_method, status, notes, created_at, updated_at, version,
  order_items(id, variant_id, sku, name_en, variant_label, unit_price, quantity),
  payments(id, status, amount, provider_payment_id, provider_transaction_id, created_at),
  shipments(id, courier_name, tracking_number, status, created_at)
`;

export class SupabaseOrderRepository implements OrderRepository {
  async listOrders(input: OrderListInput) {
    const supabase = await client();
    let query = supabase.from("orders").select(select);
    if (input.source && input.source !== "all")
      query = query.eq("source", input.source);
    if (input.dateFrom) query = query.gte("created_at", input.dateFrom);
    if (input.dateTo) query = query.lte("created_at", input.dateTo);
    const { data, error } = await query.order("created_at", {
      ascending: false,
    });
    if (error) throw new OperationsError("STORE_INVALID", error.message);
    let items = rows(data).map(toOrder);
    if (input.query) {
      const needle = input.query.toLowerCase();
      items = items.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(needle) ||
          order.customer.name.toLowerCase().includes(needle) ||
          order.customer.phone.includes(needle),
      );
    }
    if (input.status && input.status !== "all")
      items = items.filter((order) => order.status === input.status);
    if (input.paymentStatus && input.paymentStatus !== "all")
      items = items.filter(
        (order) => order.paymentStatus === input.paymentStatus,
      );
    const page = Math.max(input.page ?? 1, 1);
    const pageSize = Math.max(input.pageSize ?? 20, 1);
    return {
      items: items.slice((page - 1) * pageSize, page * pageSize),
      page,
      pageSize,
      totalItems: items.length,
      totalPages: Math.max(Math.ceil(items.length / pageSize), 1),
    };
  }

  async getOrder(id: string) {
    const supabase = await client();
    const { data, error } = await supabase
      .from("orders")
      .select(select)
      .eq("id", id)
      .maybeSingle();
    if (error) throw new OperationsError("STORE_INVALID", error.message);
    return data ? toOrder(data as Row) : null;
  }

  async createOrder(input: CreateOrderInput) {
    if (!["cod", "bkash", "nagad"].includes(input.paymentMethod))
      throw new OperationsError(
        "VALIDATION",
        "Live manual orders support COD, bKash or Nagad payments.",
      );
    const supabase = await client();
    const { data: variants, error: variantError } = await supabase
      .from("product_variants")
      .select("id,price")
      .in(
        "id",
        input.lines.map((line) => line.variantId),
      );
    if (variantError)
      throw new OperationsError("STORE_INVALID", variantError.message);
    const prices = new Map(
      rows(variants).map((variant) => [
        String(variant.id),
        numeric(variant.price),
      ]),
    );
    const subtotal = input.lines.reduce(
      (sum, line) => sum + (prices.get(line.variantId) ?? 0) * line.quantity,
      0,
    );
    const { data, error } = await supabase.rpc("admin_create_order", {
      payload: {
        source: input.source,
        locale: "en",
        guest_token_hash: null,
        payment_method: input.paymentMethod,
        idempotency_key: input.idempotencyKey,
        contact_name: input.customerName,
        contact_phone: input.customerPhone,
        contact_email: input.customerEmail ?? "",
        shipping_address: {
          line: input.deliveryAddress ?? "Sonai store pickup",
        },
        delivery_zone_id: "dhaka",
        subtotal,
        delivery_fee: input.deliveryMinor / 100,
        discount: 0,
        total: subtotal + input.deliveryMinor / 100,
        notes: input.notes,
        lines: input.lines.map((line) => ({
          variant_id: line.variantId,
          quantity: line.quantity,
          unit_price: prices.get(line.variantId),
        })),
      },
    });
    if (error) throw new OperationsError("STORE_INVALID", error.message);
    const order = await this.getOrder(String(data));
    if (!order)
      throw new OperationsError("NOT_FOUND", "Created order was not found.");
    return order;
  }

  private async transition(
    id: string,
    transition: string,
    expectedVersion: number,
    note?: string,
  ) {
    const supabase = await client();
    const { error } = await supabase.rpc("admin_transition_order", {
      p_order_id: id,
      p_transition: transition,
      p_expected_version: expectedVersion,
      p_note: note ?? null,
    });
    if (error)
      throw new OperationsError(
        error.code === "40001" ? "CONFLICT" : "STORE_INVALID",
        error.message,
      );
    const order = await this.getOrder(id);
    if (!order) throw new OperationsError("NOT_FOUND", "Order not found.");
    return order;
  }

  async assignOrder(
    id: string,
    _locationId: LocationId,
    expectedVersion: number,
  ) {
    return this.transition(
      id,
      "note",
      expectedVersion,
      "Fulfilment assignment reviewed.",
    );
  }
  async recordPayment(
    id: string,
    outcome: "paid" | "failed",
    expectedVersion: number,
  ) {
    return this.transition(id, outcome, expectedVersion);
  }
  async confirmOrder(id: string, expectedVersion: number) {
    return this.transition(id, "confirmed", expectedVersion);
  }
  async transitionOrder(
    id: string,
    nextStatus: "picking" | "packed" | "shipped" | "delivered",
    expectedVersion: number,
  ) {
    return this.transition(id, nextStatus, expectedVersion);
  }
  async cancelOrder(id: string, reason: string, expectedVersion: number) {
    return this.transition(id, "cancelled", expectedVersion, reason);
  }
  async addNote(id: string, note: string, expectedVersion: number) {
    return this.transition(id, "note", expectedVersion, note);
  }
  async requestReturn(): Promise<OrderReturn> {
    throw new OperationsError(
      "INVALID_TRANSITION",
      "Live return intake is not enabled yet.",
    );
  }
  async decideReturn(): Promise<OrderReturn> {
    throw new OperationsError(
      "INVALID_TRANSITION",
      "Live return decisions are not enabled yet.",
    );
  }
  async receiveReturn(): Promise<Order> {
    throw new OperationsError(
      "INVALID_TRANSITION",
      "Live return receiving is not enabled yet.",
    );
  }
}
