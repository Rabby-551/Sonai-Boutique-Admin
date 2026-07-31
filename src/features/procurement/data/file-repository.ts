import { randomUUID } from "node:crypto";
import { ShonaiFileStore } from "@/lib/mock-store/file-store";
import type { ShonaiStore } from "@/lib/mock-store/schema";
import { OperationsError } from "@/lib/operations-error";
import type {
  StockBalance,
  StockMovement,
} from "@/features/inventory/schemas/inventory";
import type { PurchaseOrder, Supplier } from "../schemas/procurement";
import type {
  ProcurementRepository,
  PurchaseOrderListInput,
  PurchaseOrderMutationInput,
  ReceiptInput,
  SupplierMutationInput,
} from "./repository";

export class FileProcurementRepository implements ProcurementRepository {
  constructor(private readonly store = new ShonaiFileStore()) {}
  async listSuppliers() {
    return (await this.store.read()).suppliers.toSorted((a, b) =>
      a.name.localeCompare(b.name),
    );
  }
  async getSupplier(id: string) {
    return (
      (await this.store.read()).suppliers.find((item) => item.id === id) ?? null
    );
  }
  async createSupplier(input: SupplierMutationInput, actorId: string) {
    void actorId;
    return this.store.transaction((store) => {
      this.assertSupplierUnique(store, input.name, null);
      this.validateSupplierVariants(store, input);
      const now = new Date().toISOString();
      const next =
        Math.max(
          0,
          ...store.suppliers.map((item) => Number(item.code.slice(4))),
        ) + 1;
      const supplier: Supplier = {
        id: `sup-${randomUUID()}`,
        code: `SUP-${String(next).padStart(4, "0")}`,
        ...input,
        status: "active",
        createdAt: now,
        updatedAt: now,
        version: 1,
      };
      store.suppliers.push(supplier);
      return supplier;
    });
  }
  async updateSupplier(
    id: string,
    input: SupplierMutationInput,
    expectedVersion: number,
    actorId: string,
  ) {
    void actorId;
    return this.store.transaction((store) => {
      const item = this.supplier(store, id, expectedVersion);
      this.assertSupplierUnique(store, input.name, id);
      this.validateSupplierVariants(store, input);
      Object.assign(item, input, {
        version: item.version + 1,
        updatedAt: new Date().toISOString(),
      });
      return item;
    });
  }
  async archiveSupplier(id: string, expectedVersion: number, actorId: string) {
    void actorId;
    return this.store.transaction((store) => {
      const item = this.supplier(store, id, expectedVersion);
      if (
        store.purchaseOrders.some(
          (po) =>
            po.supplierId === id &&
            !["closed", "cancelled"].includes(po.status),
        )
      )
        throw new OperationsError(
          "VALIDATION",
          "Archive is blocked while open purchase orders reference this supplier.",
        );
      item.status = "archived";
      item.version += 1;
      item.updatedAt = new Date().toISOString();
      return item;
    });
  }
  async listPurchaseOrders(input: PurchaseOrderListInput) {
    const store = await this.store.read();
    const query = input.query?.toLowerCase().trim();
    let items = store.purchaseOrders.filter(
      (item) =>
        (!query ||
          `${item.orderNumber} ${item.supplierReference ?? ""}`
            .toLowerCase()
            .includes(query)) &&
        (!input.status ||
          input.status === "all" ||
          item.status === input.status) &&
        (!input.supplierId || item.supplierId === input.supplierId) &&
        (!input.locationId ||
          input.locationId === "all" ||
          item.destinationLocationId === input.locationId),
    );
    items = items.toSorted((a, b) => b.updatedAt.localeCompare(a.updatedAt));
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
  async getPurchaseOrder(id: string) {
    return (
      (await this.store.read()).purchaseOrders.find((item) => item.id === id) ??
      null
    );
  }
  async createPurchaseOrder(input: PurchaseOrderMutationInput) {
    return this.store.transaction((store) => {
      const supplier = store.suppliers.find(
        (item) => item.id === input.supplierId && item.status === "active",
      );
      if (!supplier)
        throw new OperationsError("VALIDATION", "Select an active supplier.");
      const lines = this.poLines(store, input);
      const now = new Date().toISOString();
      const date = now.slice(2, 10).replaceAll("-", "");
      const sequence = (store.purchaseOrderSequences[date] ?? 0) + 1;
      store.purchaseOrderSequences[date] = sequence;
      const subtotalMinor = lines.reduce(
        (sum, line) => sum + line.orderedQuantity * line.unitCostMinor,
        0,
      );
      const po: PurchaseOrder = {
        id: `po-${randomUUID()}`,
        orderNumber: `PO-${date}-${String(sequence).padStart(4, "0")}`,
        supplierId: input.supplierId,
        destinationLocationId: input.destinationLocationId,
        expectedDeliveryDate: input.expectedDeliveryDate,
        status: "draft",
        lines,
        shippingMinor: input.shippingMinor,
        otherMinor: input.otherMinor,
        subtotalMinor,
        totalMinor: subtotalMinor + input.shippingMinor + input.otherMinor,
        supplierReference: null,
        shipmentReference: null,
        note: input.note,
        receipts: [],
        timeline: [],
        createdBy: input.actorId,
        createdAt: now,
        updatedAt: now,
        version: 1,
      };
      this.event(
        po,
        "created",
        "Purchase order draft created.",
        input.actorId,
        now,
      );
      store.purchaseOrders.push(po);
      return po;
    });
  }
  async updatePurchaseOrder(
    id: string,
    input: PurchaseOrderMutationInput,
    expectedVersion: number,
  ) {
    return this.store.transaction((store) => {
      const po = this.po(store, id, expectedVersion);
      if (!["draft", "rejected"].includes(po.status))
        throw new OperationsError(
          "INVALID_TRANSITION",
          "Only draft or rejected purchase orders can be edited.",
        );
      const lines = this.poLines(store, input);
      const subtotalMinor = lines.reduce(
        (sum, line) => sum + line.orderedQuantity * line.unitCostMinor,
        0,
      );
      Object.assign(po, {
        supplierId: input.supplierId,
        destinationLocationId: input.destinationLocationId,
        expectedDeliveryDate: input.expectedDeliveryDate,
        lines,
        shippingMinor: input.shippingMinor,
        otherMinor: input.otherMinor,
        subtotalMinor,
        totalMinor: subtotalMinor + input.shippingMinor + input.otherMinor,
        note: input.note,
      });
      this.bump(po);
      return po;
    });
  }
  async submitPurchaseOrder(
    id: string,
    expectedVersion: number,
    commandId: string,
    actorId: string,
  ) {
    return this.store.transaction((store) => {
      if (store.processedCommands.includes(commandId))
        return this.poById(store, id);
      const po = this.po(store, id, expectedVersion);
      if (po.status !== "draft")
        throw new OperationsError(
          "INVALID_TRANSITION",
          "Only draft purchase orders can be submitted.",
        );
      po.status = "submitted";
      this.event(
        po,
        "submitted",
        "Purchase order submitted for approval.",
        actorId,
      );
      this.bump(po);
      store.processedCommands.push(commandId);
      return po;
    });
  }
  async decidePurchaseOrder(
    id: string,
    decision: "approved" | "rejected",
    reason: string,
    expectedVersion: number,
    actorId: string,
  ) {
    return this.store.transaction((store) => {
      const po = this.po(store, id, expectedVersion);
      if (po.status !== "submitted")
        throw new OperationsError(
          "INVALID_TRANSITION",
          "Only submitted purchase orders can be decided.",
        );
      if (decision === "rejected" && reason.length < 3)
        throw new OperationsError("VALIDATION", "Rejection requires a reason.");
      po.status = decision;
      this.event(po, decision, reason || "Purchase order approved.", actorId);
      this.bump(po);
      return po;
    });
  }
  async revisePurchaseOrder(
    id: string,
    expectedVersion: number,
    actorId: string,
  ) {
    return this.store.transaction((store) => {
      const po = this.po(store, id, expectedVersion);
      if (po.status !== "rejected")
        throw new OperationsError(
          "INVALID_TRANSITION",
          "Only rejected purchase orders can return to draft.",
        );
      po.status = "draft";
      this.event(
        po,
        "revised",
        "Rejected purchase order returned to draft.",
        actorId,
      );
      this.bump(po);
      return po;
    });
  }
  async transitionPurchaseOrder(
    id: string,
    next: "supplier_confirmed" | "in_transit",
    reference: string,
    expectedVersion: number,
    actorId: string,
  ) {
    return this.store.transaction((store) => {
      const po = this.po(store, id, expectedVersion);
      const expected =
        next === "supplier_confirmed" ? "approved" : "supplier_confirmed";
      if (po.status !== expected)
        throw new OperationsError(
          "INVALID_TRANSITION",
          `Purchase order must be ${expected} first.`,
        );
      if (reference.length < 2)
        throw new OperationsError(
          "VALIDATION",
          "A sanitized supplier or shipment reference is required.",
        );
      po.status = next;
      if (next === "supplier_confirmed") po.supplierReference = reference;
      else po.shipmentReference = reference;
      this.event(po, next, reference, actorId);
      this.bump(po);
      return po;
    });
  }
  async receivePurchaseOrder(id: string, input: ReceiptInput) {
    return this.store.transaction((store) => {
      const duplicate = store.purchaseOrders.find((po) =>
        po.receipts.some((receipt) => receipt.commandId === input.commandId),
      );
      if (duplicate) return duplicate;
      const po = this.po(store, id, input.expectedVersion);
      if (
        !["supplier_confirmed", "in_transit", "partially_received"].includes(
          po.status,
        )
      )
        throw new OperationsError(
          "INVALID_TRANSITION",
          "This purchase order is not ready for receiving.",
        );
      const receiptLines = input.lines.filter(
        (line) =>
          line.acceptedQuantity + line.damagedQuantity + line.rejectedQuantity >
          0,
      );
      if (!receiptLines.length)
        throw new OperationsError(
          "VALIDATION",
          "Record at least one received quantity.",
        );
      for (const receipt of receiptLines) {
        const line = po.lines.find(
          (item) => item.variantId === receipt.variantId,
        );
        if (!line)
          throw new OperationsError(
            "RECEIPT_MISMATCH",
            "Receipt contains a SKU outside this purchase order.",
          );
        const recorded =
          line.acceptedQuantity + line.damagedQuantity + line.rejectedQuantity;
        const incoming =
          receipt.acceptedQuantity +
          receipt.damagedQuantity +
          receipt.rejectedQuantity;
        if (recorded + incoming > line.orderedQuantity)
          throw new OperationsError(
            "RECEIPT_MISMATCH",
            `Receipt exceeds ordered quantity for ${line.sku}.`,
          );
        line.acceptedQuantity += receipt.acceptedQuantity;
        line.damagedQuantity += receipt.damagedQuantity;
        line.rejectedQuantity += receipt.rejectedQuantity;
        if (receipt.acceptedQuantity > 0)
          this.receiveStock(
            store,
            po,
            line.variantId,
            receipt.acceptedQuantity,
            input,
          );
      }
      const now = new Date().toISOString();
      po.receipts.push({
        id: `pr-${randomUUID()}`,
        purchaseOrderId: po.id,
        lines: receiptLines,
        reference: input.reference,
        note: input.note,
        actorId: input.actorId,
        commandId: input.commandId,
        receivedAt: now,
      });
      const complete = po.lines.every(
        (line) =>
          line.acceptedQuantity +
            line.damagedQuantity +
            line.rejectedQuantity ===
          line.orderedQuantity,
      );
      po.status = complete ? "received" : "partially_received";
      this.event(
        po,
        "receipt",
        `${input.reference}: ${complete ? "fully" : "partially"} received.`,
        input.actorId,
        now,
      );
      this.bump(po, now);
      store.processedCommands.push(input.commandId);
      return po;
    });
  }
  async finishPurchaseOrder(
    id: string,
    action: "close" | "cancel",
    reason: string,
    expectedVersion: number,
    actorId: string,
  ) {
    return this.store.transaction((store) => {
      const po = this.po(store, id, expectedVersion);
      if (reason.length < 3)
        throw new OperationsError("VALIDATION", "A reason is required.");
      if (action === "cancel") {
        if (
          !["draft", "submitted", "approved"].includes(po.status) ||
          po.receipts.length
        )
          throw new OperationsError(
            "INVALID_TRANSITION",
            "Cancellation is blocked after supplier confirmation or receiving.",
          );
        po.status = "cancelled";
      } else {
        if (
          !["received", "partially_received"].includes(po.status) ||
          !po.receipts.length
        )
          throw new OperationsError(
            "INVALID_TRANSITION",
            "Only received purchase orders can be closed.",
          );
        po.status = "closed";
      }
      this.event(po, action, reason, actorId);
      this.bump(po);
      return po;
    });
  }
  private receiveStock(
    store: ShonaiStore,
    po: PurchaseOrder,
    variantId: string,
    quantity: number,
    input: ReceiptInput,
  ) {
    let balance = store.balances.find(
      (item) =>
        item.variantId === variantId &&
        item.locationId === po.destinationLocationId,
    );
    if (!balance) {
      balance = {
        variantId,
        locationId: po.destinationLocationId,
        onHand: 0,
        reserved: 0,
        thresholdOverride: null,
        version: 1,
      } satisfies StockBalance;
      store.balances.push(balance);
    }
    balance.onHand += quantity;
    balance.version += 1;
    const movement: StockMovement = {
      id: `mov-${randomUUID()}`,
      variantId,
      locationId: po.destinationLocationId,
      type: "purchase_receipt",
      onHandDelta: quantity,
      reservedDelta: 0,
      reason: `Accepted against ${po.orderNumber}.`,
      referenceType: "purchase_order",
      referenceId: po.id,
      actorId: input.actorId,
      commandId: `${input.commandId}-${variantId}`,
      occurredAt: new Date().toISOString(),
    };
    store.movements.push(movement);
  }
  private poLines(
    store: ShonaiStore,
    input: PurchaseOrderMutationInput,
  ): PurchaseOrder["lines"] {
    const seen = new Set<string>();
    return input.lines.map((line) => {
      if (seen.has(line.variantId))
        throw new OperationsError(
          "VALIDATION",
          "Each SKU can appear only once.",
        );
      seen.add(line.variantId);
      for (const product of store.products) {
        const variant = product.variants.find(
          (item) => item.id === line.variantId,
        );
        if (variant)
          return {
            variantId: variant.id,
            sku: variant.sku,
            productName: product.name,
            supplierSku: line.supplierSku,
            orderedQuantity: line.orderedQuantity,
            unitCostMinor: line.unitCostMinor,
            acceptedQuantity: 0,
            damagedQuantity: 0,
            rejectedQuantity: 0,
          };
      }
      throw new OperationsError("NOT_FOUND", "Product variant not found.");
    });
  }
  private validateSupplierVariants(
    store: ShonaiStore,
    input: SupplierMutationInput,
  ) {
    const seen = new Set<string>();
    for (const item of input.variants) {
      if (seen.has(item.variantId))
        throw new OperationsError(
          "VALIDATION",
          "A supplier SKU mapping cannot be duplicated.",
        );
      seen.add(item.variantId);
      if (
        !store.products.some((product) =>
          product.variants.some((variant) => variant.id === item.variantId),
        )
      )
        throw new OperationsError(
          "NOT_FOUND",
          "Mapped product variant not found.",
        );
    }
  }
  private assertSupplierUnique(
    store: ShonaiStore,
    name: string,
    except: string | null,
  ) {
    if (
      store.suppliers.some(
        (item) =>
          item.id !== except && item.name.toLowerCase() === name.toLowerCase(),
      )
    )
      throw new OperationsError(
        "VALIDATION",
        "A supplier already uses this name.",
      );
  }
  private supplier(store: ShonaiStore, id: string, version: number) {
    const item = store.suppliers.find((entry) => entry.id === id);
    if (!item) throw new OperationsError("NOT_FOUND", "Supplier not found.");
    if (item.version !== version)
      throw new OperationsError(
        "CONFLICT",
        "Supplier changed. Refresh and review it.",
      );
    return item;
  }
  private po(store: ShonaiStore, id: string, version: number) {
    const item = this.poById(store, id);
    if (item.version !== version)
      throw new OperationsError(
        "CONFLICT",
        "Purchase order changed. Refresh and review it.",
      );
    return item;
  }
  private poById(store: ShonaiStore, id: string) {
    const item = store.purchaseOrders.find((entry) => entry.id === id);
    if (!item)
      throw new OperationsError("NOT_FOUND", "Purchase order not found.");
    return item;
  }
  private event(
    po: PurchaseOrder,
    type: string,
    detail: string,
    actorId: string,
    occurredAt = new Date().toISOString(),
  ) {
    po.timeline.push({
      id: `evt-${randomUUID()}`,
      type,
      detail,
      actorId,
      occurredAt,
    });
  }
  private bump(po: PurchaseOrder, now = new Date().toISOString()) {
    po.version += 1;
    po.updatedAt = now;
  }
}
