import { randomUUID } from "node:crypto";
import { ShonaiFileStore } from "@/lib/mock-store/file-store";
import type { ShonaiStore } from "@/lib/mock-store/schema";
import { OperationsError } from "@/lib/operations-error";
import { calculateCampaignDiscount } from "@/features/campaigns/utils/discount";
import type {
  LocationId,
  StockMovement,
} from "@/features/inventory/schemas/inventory";
import type { Order, OrderReturn, OrderStatus } from "../schemas/orders";
import type {
  CreateOrderInput,
  OrderListInput,
  OrderRepository,
} from "./repository";

export class FileOrderRepository implements OrderRepository {
  constructor(private readonly store = new ShonaiFileStore()) {}

  async listOrders(input: OrderListInput) {
    const store = await this.store.read();
    const query = input.query?.trim().toLowerCase();
    let items = store.orders.filter(
      (order) =>
        (!query ||
          `${order.orderNumber} ${order.customer.name} ${order.customer.phone}`
            .toLowerCase()
            .includes(query)) &&
        (!input.source ||
          input.source === "all" ||
          order.source === input.source) &&
        (!input.locationId ||
          input.locationId === "all" ||
          order.fulfillmentLocationId === input.locationId) &&
        (!input.status ||
          input.status === "all" ||
          order.status === input.status) &&
        (!input.paymentStatus ||
          input.paymentStatus === "all" ||
          order.paymentStatus === input.paymentStatus) &&
        (!input.dateFrom || order.createdAt.slice(0, 10) >= input.dateFrom) &&
        (!input.dateTo || order.createdAt.slice(0, 10) <= input.dateTo),
    );
    items = items.toSorted((a, b) => b.createdAt.localeCompare(a.createdAt));
    const pageSize = Math.min(Math.max(input.pageSize ?? 20, 1), 100);
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    const page = Math.min(Math.max(input.page ?? 1, 1), totalPages);
    return {
      items: items.slice((page - 1) * pageSize, page * pageSize),
      page,
      pageSize,
      totalItems: items.length,
      totalPages,
    };
  }

  async getOrder(id: string) {
    return (
      (await this.store.read()).orders.find((order) => order.id === id) ?? null
    );
  }

  async createOrder(input: CreateOrderInput) {
    return this.store.transaction((store) => {
      const duplicate = store.orders.find((order) =>
        order.timeline.some((event) => event.id === input.idempotencyKey),
      );
      if (duplicate) return duplicate;
      const lines = input.lines.map((line) => {
        const found = this.variant(store, line.variantId);
        if (found.product.status !== "active" || !found.variant.active)
          throw new OperationsError(
            "VALIDATION",
            "Every ordered SKU must be active.",
          );
        return {
          variantId: found.variant.id,
          sku: found.variant.sku,
          productName: found.product.name,
          variantLabel: `${found.variant.color} · ${found.variant.size}`,
          quantity: line.quantity,
          unitPriceMinor: found.variant.priceMinor ?? found.product.priceMinor,
          unitCostMinor: found.product.costMinor,
        };
      });
      const location = this.recommendLocation(
        store,
        lines,
        input.preferredLocationId,
        input.source,
      );
      const now = new Date().toISOString();
      const orderNumber = this.nextOrderNumber(store, now);
      let customer = store.customers.find(
        (item) => item.phone === input.customerPhone,
      );
      if (!customer) {
        customer = {
          id: `cus-${randomUUID()}`,
          name: input.customerName,
          phone: input.customerPhone,
          email: input.customerEmail,
          birthday: null,
          notes: "Created automatically from manual order capture.",
          status: "active",
          kind: "guest",
          loyaltyEnrolledAt: null,
          addresses: input.deliveryAddress
            ? [
                {
                  id: `addr-${randomUUID()}`,
                  label: "Delivery",
                  address: input.deliveryAddress,
                },
              ]
            : [],
          createdAt: now,
          updatedAt: now,
          version: 1,
        };
        store.customers.push(customer);
      }
      const subtotalMinor = lines.reduce(
        (sum, line) => sum + line.unitPriceMinor * line.quantity,
        0,
      );
      const campaign = calculateCampaignDiscount(store, lines, new Date(now));
      const discountMinor = campaign?.discountMinor ?? 0;
      const order: Order = {
        id: `ord-${randomUUID()}`,
        customerId: customer.id,
        orderNumber,
        source: input.source,
        customer: {
          name: input.customerName,
          phone: input.customerPhone,
          email: input.customerEmail,
        },
        deliveryAddress: input.deliveryAddress,
        fulfillmentLocationId: location,
        lines,
        campaignId: campaign?.campaign.id ?? null,
        discountMinor,
        subtotalMinor,
        deliveryMinor: input.deliveryMinor,
        totalMinor: subtotalMinor - discountMinor + input.deliveryMinor,
        paymentMethod: input.paymentMethod,
        paymentStatus: input.paymentMethod === "cash" ? "paid" : "pending",
        status: "placed",
        notes: input.notes,
        timeline: [
          {
            id: input.idempotencyKey,
            type: "order_placed",
            label: "Order created",
            detail: `Manual ${input.source} order recorded.`,
            actorId: input.actorId,
            occurredAt: now,
          },
        ],
        payments:
          input.paymentMethod === "cash"
            ? [
                {
                  id: `pay-${randomUUID()}`,
                  method: "cash",
                  amountMinor:
                    subtotalMinor - discountMinor + input.deliveryMinor,
                  status: "paid",
                  providerReference: `CASH-${orderNumber}`,
                  createdAt: now,
                },
              ]
            : [],
        shipment: null,
        returns: [],
        createdAt: now,
        updatedAt: now,
        version: 1,
      };
      store.orders.push(order);
      store.processedCommands.push(input.idempotencyKey);
      return order;
    });
  }

  async assignOrder(
    id: string,
    locationId: LocationId,
    expectedVersion: number,
    actorId: string,
  ) {
    return this.store.transaction((store) => {
      const order = this.order(store, id, expectedVersion);
      if (order.status !== "placed")
        throw new OperationsError(
          "INVALID_TRANSITION",
          "Only placed orders can be reassigned.",
        );
      if (!this.hasStock(store, order.lines, locationId))
        throw new OperationsError(
          "INSUFFICIENT_STOCK",
          "That location cannot fulfill every order line.",
        );
      order.fulfillmentLocationId = locationId;
      this.event(
        order,
        "order_assigned",
        "Fulfillment assigned",
        locationId,
        actorId,
      );
      this.bump(order);
      return order;
    });
  }

  async recordPayment(
    id: string,
    outcome: "paid" | "failed",
    expectedVersion: number,
    commandId: string,
    actorId: string,
  ) {
    return this.store.transaction((store) => {
      if (store.processedCommands.includes(commandId))
        return store.orders.find((item) => item.id === id)!;
      const order = this.order(store, id, expectedVersion);
      const existing = order.payments.find(
        (payment) => payment.id === commandId,
      );
      if (existing) return order;
      const now = new Date().toISOString();
      order.payments.push({
        id: commandId,
        method: order.paymentMethod,
        amountMinor: order.totalMinor,
        status: outcome,
        providerReference: `MOCK-${commandId.slice(-10)}`,
        createdAt: now,
      });
      order.paymentStatus = outcome;
      this.event(
        order,
        "payment",
        outcome === "paid" ? "Payment confirmed" : "Payment failed",
        "Mock provider response recorded.",
        actorId,
        now,
      );
      this.bump(order, now);
      store.processedCommands.push(commandId);
      return order;
    });
  }

  async confirmOrder(
    id: string,
    expectedVersion: number,
    commandId: string,
    actorId: string,
  ) {
    return this.store.transaction((store) => {
      if (store.processedCommands.includes(commandId))
        return store.orders.find((item) => item.id === id)!;
      const order = this.order(store, id, expectedVersion);
      if (order.status !== "placed")
        throw new OperationsError(
          "INVALID_TRANSITION",
          "Only placed orders can be confirmed.",
        );
      const locationId = order.fulfillmentLocationId;
      if (!locationId)
        throw new OperationsError(
          "VALIDATION",
          "Assign a fulfillment location first.",
        );
      if (!this.hasStock(store, order.lines, locationId))
        throw new OperationsError(
          "INSUFFICIENT_STOCK",
          "Assigned stock is no longer available.",
        );
      const now = new Date().toISOString();
      for (const line of order.lines) {
        const balance = this.balance(store, line.variantId, locationId);
        balance.reserved += line.quantity;
        balance.version += 1;
        store.movements.push(
          this.movement(
            line.variantId,
            locationId,
            "reservation",
            0,
            line.quantity,
            "Order stock reserved.",
            order.id,
            actorId,
            `${commandId}-${line.variantId}`,
            now,
          ),
        );
      }
      order.status = "confirmed";
      this.event(
        order,
        "confirmed",
        "Order confirmed",
        "Stock reserved and confirmation notification queued.",
        actorId,
        now,
      );
      this.bump(order, now);
      store.processedCommands.push(commandId);
      return order;
    });
  }

  async transitionOrder(
    id: string,
    nextStatus: "picking" | "packed" | "shipped" | "delivered",
    expectedVersion: number,
    commandId: string,
    actorId: string,
  ) {
    return this.store.transaction((store) => {
      if (store.processedCommands.includes(commandId))
        return store.orders.find((item) => item.id === id)!;
      const order = this.order(store, id, expectedVersion);
      const expected: Record<typeof nextStatus, OrderStatus> = {
        picking: "confirmed",
        packed: "picking",
        shipped: "packed",
        delivered: "shipped",
      };
      if (order.status !== expected[nextStatus])
        throw new OperationsError(
          "INVALID_TRANSITION",
          `Order must be ${expected[nextStatus]} first.`,
        );
      if (
        nextStatus === "shipped" &&
        order.paymentMethod !== "cod" &&
        order.paymentStatus !== "paid"
      )
        throw new OperationsError(
          "VALIDATION",
          "Non-COD orders must be paid before shipment.",
        );
      const now = new Date().toISOString();
      if (nextStatus === "shipped") {
        const locationId = order.fulfillmentLocationId!;
        for (const line of order.lines) {
          const balance = this.balance(store, line.variantId, locationId);
          if (
            balance.reserved < line.quantity ||
            balance.onHand < line.quantity
          )
            throw new OperationsError(
              "INSUFFICIENT_STOCK",
              "Reserved stock is incomplete.",
            );
          balance.onHand -= line.quantity;
          balance.reserved -= line.quantity;
          balance.version += 1;
          store.movements.push(
            this.movement(
              line.variantId,
              locationId,
              "sale",
              -line.quantity,
              -line.quantity,
              "Order shipped.",
              order.id,
              actorId,
              `${commandId}-${line.variantId}`,
              now,
            ),
          );
        }
        order.shipment = {
          id: `shp-${randomUUID()}`,
          courier: "Sonai Mock Courier",
          trackingReference: `SMC-${order.orderNumber.replaceAll("-", "")}`,
          status: "in_transit",
          createdAt: now,
        };
      }
      if (nextStatus === "delivered") {
        if (order.shipment) order.shipment.status = "delivered";
        if (order.paymentMethod === "cod") {
          order.paymentStatus = "paid";
          order.payments.push({
            id: `pay-${randomUUID()}`,
            method: "cod",
            amountMinor: order.totalMinor,
            status: "paid",
            providerReference: `COD-${order.orderNumber}`,
            createdAt: now,
          });
        }
        const customer = store.customers.find(
          (item) => item.id === order.customerId,
        );
        const alreadyEarned = store.loyaltyTransactions.some(
          (item) => item.orderId === order.id && item.type === "earn",
        );
        if (customer?.loyaltyEnrolledAt && !alreadyEarned) {
          const settings = store.loyaltySettings;
          const points =
            Math.floor(order.subtotalMinor / settings.spendPerPointMinor) *
            settings.pointsPerUnit;
          if (points > 0)
            store.loyaltyTransactions.push({
              id: `loy-${randomUUID()}`,
              customerId: customer.id,
              type: "earn",
              points,
              reason: `Points earned from ${order.orderNumber}.`,
              orderId: order.id,
              returnId: null,
              spendPerPointMinor: settings.spendPerPointMinor,
              pointsPerUnit: settings.pointsPerUnit,
              actorId,
              commandId: `${commandId}-loyalty`,
              occurredAt: now,
            });
        }
      }
      order.status = nextStatus;
      this.event(
        order,
        nextStatus,
        this.statusLabel(nextStatus),
        nextStatus === "shipped"
          ? "Courier label created and shipment notification queued."
          : "Fulfillment status updated.",
        actorId,
        now,
      );
      this.bump(order, now);
      store.processedCommands.push(commandId);
      return order;
    });
  }

  async cancelOrder(
    id: string,
    reason: string,
    expectedVersion: number,
    commandId: string,
    actorId: string,
  ) {
    return this.store.transaction((store) => {
      if (store.processedCommands.includes(commandId))
        return store.orders.find((item) => item.id === id)!;
      const order = this.order(store, id, expectedVersion);
      if (!["placed", "confirmed", "picking", "packed"].includes(order.status))
        throw new OperationsError(
          "INVALID_TRANSITION",
          "Shipped or delivered orders cannot be cancelled.",
        );
      const now = new Date().toISOString();
      if (order.status !== "placed") {
        const locationId = order.fulfillmentLocationId!;
        for (const line of order.lines) {
          const balance = this.balance(store, line.variantId, locationId);
          balance.reserved -= line.quantity;
          balance.version += 1;
          store.movements.push(
            this.movement(
              line.variantId,
              locationId,
              "reservation_release",
              0,
              -line.quantity,
              reason,
              order.id,
              actorId,
              `${commandId}-${line.variantId}`,
              now,
            ),
          );
        }
      }
      order.status = "cancelled";
      this.event(order, "cancelled", "Order cancelled", reason, actorId, now);
      this.bump(order, now);
      store.processedCommands.push(commandId);
      return order;
    });
  }

  async addNote(
    id: string,
    note: string,
    expectedVersion: number,
    actorId: string,
  ) {
    return this.store.transaction((store) => {
      const order = this.order(store, id, expectedVersion);
      this.event(order, "note", "Support note added", note, actorId);
      this.bump(order);
      return order;
    });
  }

  async requestReturn(
    id: string,
    lines: readonly { variantId: string; quantity: number }[],
    reason: string,
    expectedVersion: number,
    actorId: string,
  ) {
    return this.store.transaction((store) => {
      const order = this.order(store, id, expectedVersion);
      if (order.status !== "delivered")
        throw new OperationsError(
          "INVALID_TRANSITION",
          "Only delivered orders can be returned.",
        );
      for (const line of lines) {
        const ordered =
          order.lines.find((item) => item.variantId === line.variantId)
            ?.quantity ?? 0;
        const alreadyRequested = order.returns
          .filter((item) => item.status !== "rejected")
          .flatMap((item) => item.lines)
          .filter((item) => item.variantId === line.variantId)
          .reduce((sum, item) => sum + item.quantity, 0);
        if (line.quantity + alreadyRequested > ordered)
          throw new OperationsError(
            "VALIDATION",
            "Return quantity exceeds delivered quantity.",
          );
      }
      const now = new Date().toISOString();
      const refundMinor = lines.reduce((sum, line) => {
        const orderLine = order.lines.find(
          (item) => item.variantId === line.variantId,
        )!;
        return sum + orderLine.unitPriceMinor * line.quantity;
      }, 0);
      const result: OrderReturn = {
        id: `ret-${randomUUID()}`,
        status: "requested",
        lines: [...lines],
        reason,
        refundMinor,
        createdAt: now,
        updatedAt: now,
        version: 1,
      };
      order.returns.push(result);
      this.event(
        order,
        "return_requested",
        "Return requested",
        reason,
        actorId,
        now,
      );
      this.bump(order, now);
      return result;
    });
  }

  async decideReturn(
    orderId: string,
    returnId: string,
    decision: "approved" | "rejected",
    expectedVersion: number,
    actorId: string,
  ) {
    return this.store.transaction((store) => {
      const order = this.order(store, orderId, expectedVersion);
      const item = order.returns.find((entry) => entry.id === returnId);
      if (!item)
        throw new OperationsError("NOT_FOUND", "Return request not found.");
      if (item.status !== "requested")
        throw new OperationsError(
          "INVALID_TRANSITION",
          "Return request was already decided.",
        );
      item.status = decision;
      item.version += 1;
      item.updatedAt = new Date().toISOString();
      this.event(
        order,
        `return_${decision}`,
        `Return ${decision}`,
        item.reason,
        actorId,
        item.updatedAt,
      );
      this.bump(order, item.updatedAt);
      return item;
    });
  }

  async receiveReturn(
    orderId: string,
    returnId: string,
    expectedVersion: number,
    commandId: string,
    actorId: string,
  ) {
    return this.store.transaction((store) => {
      if (store.processedCommands.includes(commandId))
        return store.orders.find((item) => item.id === orderId)!;
      const order = this.order(store, orderId, expectedVersion);
      const item = order.returns.find((entry) => entry.id === returnId);
      if (!item)
        throw new OperationsError("NOT_FOUND", "Return request not found.");
      if (item.status !== "approved")
        throw new OperationsError(
          "INVALID_TRANSITION",
          "Approve the return before receiving it.",
        );
      const locationId = order.fulfillmentLocationId!;
      const now = new Date().toISOString();
      for (const line of item.lines) {
        const balance = this.balance(store, line.variantId, locationId);
        balance.onHand += line.quantity;
        balance.version += 1;
        store.movements.push(
          this.movement(
            line.variantId,
            locationId,
            "return",
            line.quantity,
            0,
            item.reason,
            order.id,
            actorId,
            `${commandId}-${line.variantId}`,
            now,
          ),
        );
      }
      item.status = "received";
      item.version += 1;
      item.updatedAt = now;
      const receivedRefunds = order.returns
        .filter((entry) => entry.status === "received")
        .reduce((sum, entry) => sum + entry.refundMinor, 0);
      order.paymentStatus =
        receivedRefunds >= order.subtotalMinor
          ? "refunded"
          : "partially_refunded";
      order.payments.push({
        id: `refund-${commandId}`,
        method: order.paymentMethod,
        amountMinor: item.refundMinor,
        status: order.paymentStatus,
        providerReference: `MOCK-REFUND-${item.id.slice(-8)}`,
        createdAt: now,
      });
      const earning = store.loyaltyTransactions.find(
        (entry) => entry.orderId === order.id && entry.type === "earn",
      );
      if (earning) {
        const alreadyReversed = Math.abs(
          store.loyaltyTransactions
            .filter(
              (entry) =>
                entry.orderId === order.id && entry.type === "reversal",
            )
            .reduce((sum, entry) => sum + entry.points, 0),
        );
        const calculated =
          Math.floor(item.refundMinor / earning.spendPerPointMinor!) *
          earning.pointsPerUnit!;
        const points = Math.min(
          calculated,
          Math.max(earning.points - alreadyReversed, 0),
        );
        if (points > 0)
          store.loyaltyTransactions.push({
            id: `loy-${randomUUID()}`,
            customerId: order.customerId,
            type: "reversal",
            points: -points,
            reason: `Points reversed for return ${item.id}.`,
            orderId: order.id,
            returnId: item.id,
            spendPerPointMinor: earning.spendPerPointMinor,
            pointsPerUnit: earning.pointsPerUnit,
            actorId,
            commandId: `${commandId}-loyalty`,
            occurredAt: now,
          });
      }
      this.event(
        order,
        "return_received",
        "Return received",
        "Stock restored and mock refund recorded.",
        actorId,
        now,
      );
      this.bump(order, now);
      store.processedCommands.push(commandId);
      return order;
    });
  }

  private order(store: ShonaiStore, id: string, version: number) {
    const order = store.orders.find((item) => item.id === id);
    if (!order) throw new OperationsError("NOT_FOUND", "Order not found.");
    if (order.version !== version)
      throw new OperationsError(
        "CONFLICT",
        "Order changed. Refresh and review it.",
      );
    return order;
  }
  private variant(store: ShonaiStore, variantId: string) {
    for (const product of store.products) {
      const variant = product.variants.find((item) => item.id === variantId);
      if (variant) return { product, variant };
    }
    throw new OperationsError("NOT_FOUND", "Product variant not found.");
  }
  private balance(
    store: ShonaiStore,
    variantId: string,
    locationId: LocationId,
  ) {
    const balance = store.balances.find(
      (item) => item.variantId === variantId && item.locationId === locationId,
    );
    if (!balance)
      throw new OperationsError("NOT_FOUND", "Stock balance not found.");
    return balance;
  }
  private hasStock(
    store: ShonaiStore,
    lines: Order["lines"],
    locationId: LocationId,
  ) {
    return lines.every((line) => {
      const balance = this.balance(store, line.variantId, locationId);
      return balance.onHand - balance.reserved >= line.quantity;
    });
  }
  private recommendLocation(
    store: ShonaiStore,
    lines: Order["lines"],
    preferred: LocationId | null,
    source: CreateOrderInput["source"],
  ): LocationId | null {
    const order: LocationId[] = preferred
      ? [preferred, "loc-online", "rupnagar", "mirpur-shopping-center"]
      : source === "branch"
        ? ["rupnagar", "mirpur-shopping-center", "loc-online"]
        : ["loc-online", "rupnagar", "mirpur-shopping-center"];
    return (
      [...new Set(order)].find((location) =>
        this.hasStock(store, lines, location),
      ) ?? null
    );
  }
  private nextOrderNumber(store: ShonaiStore, iso: string) {
    const date = iso.slice(2, 10).replaceAll("-", "");
    const sequence = (store.orderSequences[date] ?? 0) + 1;
    store.orderSequences[date] = sequence;
    return `SH-${date}-${String(sequence).padStart(4, "0")}`;
  }
  private movement(
    variantId: string,
    locationId: LocationId,
    type: StockMovement["type"],
    onHandDelta: number,
    reservedDelta: number,
    reason: string,
    orderId: string,
    actorId: string,
    commandId: string,
    occurredAt: string,
  ): StockMovement {
    return {
      id: `mov-${randomUUID()}`,
      variantId,
      locationId,
      type,
      onHandDelta,
      reservedDelta,
      reason,
      referenceType: "order",
      referenceId: orderId,
      actorId,
      commandId,
      occurredAt,
    };
  }
  private event(
    order: Order,
    type: string,
    label: string,
    detail: string,
    actorId: string,
    occurredAt = new Date().toISOString(),
  ) {
    order.timeline.push({
      id: `evt-${randomUUID()}`,
      type,
      label,
      detail,
      actorId,
      occurredAt,
    });
  }
  private bump(order: Order, now = new Date().toISOString()) {
    order.version += 1;
    order.updatedAt = now;
  }
  private statusLabel(status: string) {
    return `${status.charAt(0).toUpperCase()}${status.slice(1)}`;
  }
}
