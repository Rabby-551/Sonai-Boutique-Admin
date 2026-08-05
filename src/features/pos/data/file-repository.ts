import { randomUUID } from "node:crypto";
import { appendAudit } from "@/features/administration/data/audit";
import { calculateCampaignDiscount } from "@/features/campaigns/utils/discount";
import type { Customer } from "@/features/customers/schemas/customers";
import type { StockMovement } from "@/features/inventory/schemas/inventory";
import { ShonaiFileStore } from "@/lib/mock-store/file-store";
import type { ShonaiStore } from "@/lib/mock-store/schema";
import { OperationsError } from "@/lib/operations-error";
import type {
  PaymentProvider,
  PosApproval,
  PosExchange,
  PosReturn,
  PosSale,
  PosSaleLine,
  PosTender,
  RegisterShift,
} from "../schemas/pos";
import {
  allocateDiscount,
  cashImpact,
  normalizeBangladeshPhone,
  refundableQuantity,
} from "../utils/pricing";
import type {
  CompleteSaleInput,
  PosCatalogItem,
  PosRepository,
  TenderInput,
} from "./repository";

export class FilePosRepository implements PosRepository {
  constructor(private readonly store = new ShonaiFileStore()) {}

  async bootstrap(locationId: string | null, cashierId: string) {
    const store = await this.store.read();
    const locations = store.locations.filter(
      (item) => item.active && item.kind === "branch",
    );
    const selected =
      locations.find((item) => item.id === locationId)?.id ??
      locations[0]?.id ??
      null;
    return {
      locations,
      registers: store.posRegisters.filter(
        (item) => item.active && (!selected || item.locationId === selected),
      ),
      providers: store.paymentProviders
        .filter((item) => item.active)
        .toSorted(
          (a, b) =>
            a.category.localeCompare(b.category) || a.sortOrder - b.sortOrder,
        ),
      openShift:
        store.registerShifts.find(
          (item) => item.cashierId === cashierId && item.status === "open",
        ) ?? null,
      catalog: selected ? this.catalog(store, selected) : [],
      settings: store.posSettings,
      campaigns: store.campaigns
        .filter(
          (item) =>
            ["scheduled", "active"].includes(item.status) &&
            item.startsAt <= new Date().toISOString() &&
            item.endsAt >= new Date().toISOString(),
        )
        .map((item) => ({
          id: item.id,
          name: item.name,
          scope: item.scope,
          targetIds: item.targetIds,
          percentageOff: item.percentageOff,
          priority: item.priority,
        })),
    };
  }

  async openShift(input: {
    registerId: string;
    openingFloatMinor: number;
    cashierId: string;
    commandId: string;
  }) {
    return this.store.transaction((store) => {
      const duplicate = store.registerShifts.find(
        (item) => item.id === input.commandId,
      );
      if (duplicate) return duplicate;
      const register = store.posRegisters.find(
        (item) => item.id === input.registerId && item.active,
      );
      if (!register)
        throw new OperationsError("NOT_FOUND", "Active register not found.");
      if (
        store.registerShifts.some(
          (item) =>
            item.status === "open" &&
            (item.registerId === register.id ||
              item.cashierId === input.cashierId),
        )
      )
        throw new OperationsError(
          "CONFLICT",
          "The register or cashier already has an open shift.",
        );
      const shift: RegisterShift = {
        id: input.commandId,
        registerId: register.id,
        locationId: register.locationId,
        cashierId: input.cashierId,
        status: "open",
        openingFloatMinor: input.openingFloatMinor,
        countedCashMinor: null,
        expectedCashMinor: null,
        varianceMinor: null,
        openedAt: new Date().toISOString(),
        closedAt: null,
        closedBy: null,
        closeReason: null,
        version: 1,
      };
      store.registerShifts.push(shift);
      store.processedCommands.push(input.commandId);
      appendAudit(store, {
        module: "pos",
        action: "shift_opened",
        entityType: "register_shift",
        entityId: shift.id,
        actorId: input.cashierId,
        branchId: shift.locationId,
        summary: `Opened ${register.code} with a recorded cash float.`,
        metadata: { openingFloatMinor: shift.openingFloatMinor },
      });
      return shift;
    });
  }

  async closeShift(input: {
    shiftId: string;
    countedCashMinor: number;
    actorId: string;
    reason: string | null;
    expectedVersion: number;
    commandId: string;
  }) {
    return this.store.transaction((store) => {
      const shift = this.shift(store, input.shiftId, input.expectedVersion);
      if (shift.status !== "open")
        throw new OperationsError(
          "INVALID_TRANSITION",
          "Shift is already closed.",
        );
      const saleCash = store.posSales
        .filter((sale) => sale.shiftId === shift.id)
        .reduce((sum, sale) => sum + cashImpact(sale.tenders), 0);
      const refundCash = store.posReturns
        .filter(
          (item) => item.shiftId === shift.id && item.status === "completed",
        )
        .reduce((sum, item) => sum + cashImpact(item.refundTenders), 0);
      const expected = shift.openingFloatMinor + saleCash + refundCash;
      const now = new Date().toISOString();
      Object.assign(shift, {
        status: "closed" as const,
        countedCashMinor: input.countedCashMinor,
        expectedCashMinor: expected,
        varianceMinor: input.countedCashMinor - expected,
        closedAt: now,
        closedBy: input.actorId,
        closeReason: input.reason,
        version: shift.version + 1,
      });
      store.processedCommands.push(input.commandId);
      appendAudit(store, {
        module: "pos",
        action: "shift_closed",
        entityType: "register_shift",
        entityId: shift.id,
        actorId: input.actorId,
        branchId: shift.locationId,
        summary: "Closed POS shift and recorded the cash variance.",
        metadata: {
          expectedCashMinor: expected,
          countedCashMinor: input.countedCashMinor,
          varianceMinor: input.countedCashMinor - expected,
        },
      });
      return shift;
    });
  }

  async completeSale(input: CompleteSaleInput) {
    return this.store.transaction((store) =>
      this.completeSaleInStore(store, input),
    );
  }

  async listSales(query = "", locationId?: string | null) {
    const needle = query.trim().toLowerCase();
    return (await this.store.read()).posSales
      .filter((sale) => !locationId || sale.locationId === locationId)
      .filter(
        (sale) =>
          !needle ||
          `${sale.receiptNumber} ${sale.customer?.name ?? ""} ${sale.customer?.phone ?? ""} ${sale.lines.map((line) => `${line.sku} ${line.barcode}`).join(" ")}`
            .toLowerCase()
            .includes(needle),
      )
      .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getSale(id: string) {
    return (
      (await this.store.read()).posSales.find((item) => item.id === id) ?? null
    );
  }

  async listReturns(locationId?: string | null) {
    return (await this.store.read()).posReturns
      .filter((item) => !locationId || item.locationId === locationId)
      .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async findCustomer(phone: string) {
    const normalized = normalizeBangladeshPhone(phone);
    if (!normalized) return null;
    return (
      (await this.store.read()).customers.find(
        (item) => item.phone === normalized && item.status === "active",
      ) ?? null
    );
  }

  async createCustomer(name: string, phone: string, actorId: string) {
    return this.store.transaction((store) =>
      this.createCustomerInStore(store, name, phone, actorId),
    );
  }

  async requestApproval(input: {
    type: PosApproval["type"];
    entityId: string;
    fingerprint: string;
    reason: string;
    amountMinor: number;
    actorId: string;
  }) {
    return this.store.transaction((store) => {
      const now = new Date().toISOString();
      const approval: PosApproval = {
        id: `apr-${randomUUID()}`,
        type: input.type,
        entityId: input.entityId,
        fingerprint: input.fingerprint,
        reason: input.reason,
        amountMinor: input.amountMinor,
        requestedBy: input.actorId,
        status: "pending",
        decidedBy: null,
        decidedAt: null,
        version: 1,
        createdAt: now,
      };
      store.posApprovals.push(approval);
      appendAudit(store, {
        module: "pos",
        action: "approval_requested",
        entityType: "pos_approval",
        entityId: approval.id,
        actorId: input.actorId,
        summary: `Requested ${input.type.replaceAll("_", " ")} approval.`,
        metadata: { amountMinor: input.amountMinor },
      });
      return approval;
    });
  }

  async listApprovals() {
    return (await this.store.read()).posApprovals.toSorted((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  }

  async decideApproval(
    id: string,
    decision: "approved" | "rejected",
    expectedVersion: number,
    actorId: string,
  ) {
    return this.store.transaction((store) => {
      const approval = store.posApprovals.find((item) => item.id === id);
      if (!approval)
        throw new OperationsError("NOT_FOUND", "Approval request not found.");
      if (approval.version !== expectedVersion)
        throw new OperationsError("CONFLICT", "Approval request changed.");
      if (approval.status !== "pending")
        throw new OperationsError(
          "INVALID_TRANSITION",
          "Approval was already decided.",
        );
      approval.status = decision;
      approval.decidedBy = actorId;
      approval.decidedAt = new Date().toISOString();
      approval.version += 1;
      const pendingReturn = store.posReturns.find(
        (item) => item.id === approval.entityId && item.status === "pending",
      );
      if (pendingReturn) {
        pendingReturn.status = decision;
        pendingReturn.approvedBy = decision === "approved" ? actorId : null;
        pendingReturn.updatedAt = approval.decidedAt;
        pendingReturn.version += 1;
      }
      appendAudit(store, {
        module: "pos",
        action: `approval_${decision}`,
        entityType: "pos_approval",
        entityId: approval.id,
        actorId,
        summary: `${approval.type.replaceAll("_", " ")} ${decision}.`,
      });
      return approval;
    });
  }

  async requestReturn(input: {
    saleId: string | null;
    receiptNumber: string | null;
    locationId: string;
    shiftId: string;
    reason: string;
    noReceipt: boolean;
    lines: readonly {
      variantId: string;
      quantity: number;
      disposition: "restock" | "damaged";
      refundMinor: number;
    }[];
    actorId: string;
  }) {
    return this.store.transaction((store) => {
      const shift = this.shift(store, input.shiftId);
      if (shift.status !== "open" || shift.locationId !== input.locationId)
        throw new OperationsError(
          "VALIDATION",
          "Use an open shift at this store.",
        );
      const sale = input.saleId
        ? store.posSales.find((item) => item.id === input.saleId)
        : null;
      if (!sale && !input.noReceipt)
        throw new OperationsError(
          "RECEIPT_MISMATCH",
          "Original sale was not found.",
        );
      if (!sale && !store.posSettings.allowNoReceiptReturns)
        throw new OperationsError(
          "FORBIDDEN",
          "No-receipt returns are disabled.",
        );
      const existingReturns = sale
        ? store.posReturns.filter((item) => item.saleId === sale.id)
        : [];
      for (const line of input.lines) {
        const saleLine = sale?.lines.find(
          (item) => item.variantId === line.variantId,
        );
        if (
          saleLine &&
          line.quantity > refundableQuantity(saleLine, existingReturns)
        )
          throw new OperationsError(
            "VALIDATION",
            "Return quantity exceeds the refundable quantity.",
          );
        const product = this.variant(store, line.variantId);
        const currentPrice =
          product.variant.priceMinor ?? product.product.priceMinor;
        const cap = saleLine
          ? saleLine.refundableUnitMinor * line.quantity
          : currentPrice * line.quantity;
        if (line.refundMinor > cap)
          throw new OperationsError(
            "VALIDATION",
            "Return value exceeds the allowed value.",
          );
      }
      const now = new Date().toISOString();
      const result: PosReturn = {
        id: `ret-pos-${randomUUID()}`,
        saleId: sale?.id ?? null,
        receiptNumber: sale?.receiptNumber ?? input.receiptNumber,
        locationId: input.locationId,
        shiftId: input.shiftId,
        status: "pending",
        reason: input.reason,
        noReceipt: input.noReceipt,
        lines: [...input.lines],
        refundTenders: [],
        totalRefundMinor: input.lines.reduce(
          (sum, line) => sum + line.refundMinor,
          0,
        ),
        requestedBy: input.actorId,
        approvedBy: null,
        createdAt: now,
        updatedAt: now,
        version: 1,
      };
      store.posReturns.push(result);
      store.posApprovals.push({
        id: `apr-${randomUUID()}`,
        type: input.noReceipt ? "no_receipt_return" : "return",
        status: "pending",
        entityId: result.id,
        fingerprint: JSON.stringify(result.lines),
        reason: input.reason,
        amountMinor: result.totalRefundMinor,
        requestedBy: input.actorId,
        decidedBy: null,
        createdAt: now,
        decidedAt: null,
        version: 1,
      });
      appendAudit(store, {
        module: "pos",
        action: "return_requested",
        entityType: "pos_return",
        entityId: result.id,
        actorId: input.actorId,
        branchId: input.locationId,
        summary: input.noReceipt
          ? "Requested a manager-reviewed no-receipt return."
          : `Requested return for ${sale?.receiptNumber}.`,
        metadata: {
          amountMinor: result.totalRefundMinor,
          noReceipt: input.noReceipt,
        },
      });
      return result;
    });
  }

  async completeReturn(input: {
    returnId: string;
    approvalId: string;
    refundTenders: readonly TenderInput[];
    actorId: string;
    expectedVersion: number;
    commandId: string;
  }) {
    return this.store.transaction((store) => {
      const result = this.returnRecord(
        store,
        input.returnId,
        input.expectedVersion,
      );
      if (result.status !== "approved")
        throw new OperationsError(
          "INVALID_TRANSITION",
          "Return requires manager approval.",
        );
      this.approval(store, input.approvalId, result.id);
      const tenders = this.tenders(
        store,
        input.refundTenders,
        "refund",
        input.commandId,
      );
      if (
        tenders.reduce((sum, item) => sum + item.amountMinor, 0) !==
        result.totalRefundMinor
      )
        throw new OperationsError(
          "VALIDATION",
          "Refund tenders must equal the approved refund.",
        );
      this.validateRefundTenders(store, result, tenders);
      this.applyReturnStock(store, result, input.actorId, input.commandId);
      result.refundTenders = tenders;
      result.status = "completed";
      result.updatedAt = new Date().toISOString();
      result.version += 1;
      this.updateSaleRefundState(store, result);
      store.processedCommands.push(input.commandId);
      appendAudit(store, {
        module: "pos",
        action: "return_completed",
        entityType: "pos_return",
        entityId: result.id,
        actorId: input.actorId,
        branchId: result.locationId,
        summary: "Completed approved POS return and refund.",
        metadata: { amountMinor: result.totalRefundMinor },
      });
      return result;
    });
  }

  async completeExchange(input: {
    returnId: string;
    approvalId: string;
    registerId: string;
    shiftId: string;
    replacementLines: readonly { variantId: string; quantity: number }[];
    tenders: readonly TenderInput[];
    actorId: string;
    commandId: string;
  }) {
    return this.store.transaction((store) => {
      const duplicate = store.posExchanges.find(
        (item) => item.id === input.commandId,
      );
      if (duplicate) return duplicate;
      const returned = this.returnRecord(store, input.returnId);
      if (returned.status !== "approved")
        throw new OperationsError(
          "INVALID_TRANSITION",
          "Exchange requires manager approval.",
        );
      const approval = this.approval(store, input.approvalId, returned.id);
      const shift = this.shift(store, input.shiftId);
      const replacementItems = input.replacementLines.map((line) => {
        const found = this.variant(store, line.variantId);
        return {
          variantId: line.variantId,
          quantity: line.quantity,
          unitPriceMinor: found.variant.priceMinor ?? found.product.priceMinor,
        };
      });
      const replacementSubtotalMinor = replacementItems.reduce(
        (sum, line) => sum + line.unitPriceMinor * line.quantity,
        0,
      );
      const replacementCampaign = calculateCampaignDiscount(
        store,
        replacementItems,
      );
      const replacementMinor =
        replacementSubtotalMinor - (replacementCampaign?.discountMinor ?? 0);
      const net = replacementMinor - returned.totalRefundMinor;
      const tenderTotal = input.tenders.reduce(
        (sum, item) => sum + item.amountMinor,
        0,
      );
      if (tenderTotal !== Math.abs(net) || (net === 0 && input.tenders.length))
        throw new OperationsError(
          "VALIDATION",
          "Exchange settlement does not match the price difference.",
        );
      this.applyReturnStock(
        store,
        returned,
        input.actorId,
        `${input.commandId}-return`,
      );
      returned.refundTenders =
        net < 0
          ? this.tenders(
              store,
              input.tenders,
              "refund",
              `${input.commandId}-refund`,
            )
          : [];
      if (returned.refundTenders.length)
        this.validateRefundTenders(store, returned, returned.refundTenders);
      returned.status = "completed";
      returned.approvedBy = approval.decidedBy;
      returned.updatedAt = new Date().toISOString();
      returned.version += 1;
      const original = returned.saleId
        ? store.posSales.find((item) => item.id === returned.saleId)
        : null;
      const replacement = this.completeSaleInStore(
        store,
        {
          registerId: input.registerId,
          shiftId: input.shiftId,
          locationId: shift.locationId,
          customerId: original?.customerId ?? null,
          customerName: original?.customer?.name,
          customerPhone: original?.customer?.phone,
          lines: input.replacementLines,
          manualDiscountMinor: Math.min(
            returned.totalRefundMinor,
            replacementMinor,
          ),
          manualDiscountReason: `Exchange credit ${returned.id}`,
          approvalId: approval.id,
          tenders: net > 0 ? input.tenders : [],
          actorId: input.actorId,
          commandId: `${input.commandId}-sale`,
        },
        true,
      );
      const exchange: PosExchange = {
        id: input.commandId,
        returnId: returned.id,
        replacementSaleId: replacement.id,
        creditMinor: returned.totalRefundMinor,
        replacementMinor,
        netMinor: net,
        approvedBy: approval.decidedBy!,
        createdAt: new Date().toISOString(),
      };
      store.posExchanges.push(exchange);
      store.processedCommands.push(input.commandId);
      appendAudit(store, {
        module: "pos",
        action: "exchange_completed",
        entityType: "pos_exchange",
        entityId: exchange.id,
        actorId: input.actorId,
        branchId: shift.locationId,
        summary: "Completed an atomic POS exchange.",
        metadata: { netMinor: net },
      });
      return exchange;
    });
  }

  async listShifts(locationId?: string | null) {
    return (await this.store.read()).registerShifts
      .filter((item) => !locationId || item.locationId === locationId)
      .toSorted((a, b) => b.openedAt.localeCompare(a.openedAt));
  }

  async listLocations() {
    return (await this.store.read()).locations.filter(
      (item) => item.kind === "branch",
    );
  }

  async listRegisters() {
    return (await this.store.read()).posRegisters.toSorted((a, b) =>
      a.code.localeCompare(b.code),
    );
  }

  async saveLocation(input: {
    id: string;
    name: string;
    active: boolean;
    actorId: string;
  }) {
    return this.store.transaction((store) => {
      const existing = store.locations.find((item) => item.id === input.id);
      if (existing) {
        if (
          !input.active &&
          store.registerShifts.some(
            (item) => item.locationId === input.id && item.status === "open",
          )
        )
          throw new OperationsError(
            "CONFLICT",
            "Close every store register before deactivating it.",
          );
        existing.name = input.name;
        existing.active = input.active;
        return existing;
      }
      const created = {
        id: input.id,
        name: input.name,
        kind: "branch" as const,
        active: input.active,
      };
      store.locations.push(created);
      for (const product of store.products)
        for (const variant of product.variants)
          store.balances.push({
            variantId: variant.id,
            locationId: created.id,
            onHand: 0,
            reserved: 0,
            thresholdOverride: null,
            version: 1,
          });
      appendAudit(store, {
        module: "pos",
        action: "store_created",
        entityType: "inventory_location",
        entityId: created.id,
        actorId: input.actorId,
        branchId: created.id,
        summary: `Created physical store ${created.name}.`,
      });
      return created;
    });
  }

  async saveRegister(input: {
    id?: string;
    locationId: string;
    code: string;
    name: string;
    active: boolean;
    expectedVersion?: number;
    actorId: string;
  }) {
    return this.store.transaction((store) => {
      const location = store.locations.find(
        (item) => item.id === input.locationId && item.kind === "branch",
      );
      if (!location)
        throw new OperationsError("VALIDATION", "Choose a physical store.");
      const existing = input.id
        ? store.posRegisters.find((item) => item.id === input.id)
        : null;
      if (existing) {
        if (existing.version !== input.expectedVersion)
          throw new OperationsError(
            "CONFLICT",
            "Register changed. Refresh first.",
          );
        Object.assign(existing, input, { version: existing.version + 1 });
        return existing;
      }
      const created = {
        id: `reg-${randomUUID()}`,
        locationId: input.locationId,
        code: input.code,
        name: input.name,
        active: input.active,
        version: 1,
      };
      store.posRegisters.push(created);
      return created;
    });
  }

  async listProviders() {
    return (await this.store.read()).paymentProviders.toSorted(
      (a, b) =>
        a.category.localeCompare(b.category) || a.sortOrder - b.sortOrder,
    );
  }

  async saveProvider(input: {
    id?: string;
    category: PaymentProvider["category"];
    code: string;
    name: string;
    active: boolean;
    expectedVersion?: number;
    actorId: string;
  }) {
    return this.store.transaction((store) => {
      const existing = input.id
        ? store.paymentProviders.find((item) => item.id === input.id)
        : null;
      if (existing) {
        if (existing.version !== input.expectedVersion)
          throw new OperationsError(
            "CONFLICT",
            "Provider changed. Refresh first.",
          );
        Object.assign(existing, input, { version: existing.version + 1 });
        return existing;
      }
      const created: PaymentProvider = {
        id: `provider-${randomUUID()}`,
        category: input.category,
        code: input.code,
        name: input.name,
        active: input.active,
        sortOrder:
          Math.max(
            0,
            ...store.paymentProviders
              .filter((item) => item.category === input.category)
              .map((item) => item.sortOrder),
          ) + 1,
        version: 1,
      };
      store.paymentProviders.push(created);
      return created;
    });
  }

  private completeSaleInStore(
    store: ShonaiStore,
    input: CompleteSaleInput,
    exchange = false,
  ): PosSale {
    const duplicate = store.posSales.find((sale) =>
      sale.tenders.some((tender) => tender.id.startsWith(input.commandId)),
    );
    if (duplicate) return duplicate;
    const shift = this.shift(store, input.shiftId);
    if (
      shift.status !== "open" ||
      (!exchange && shift.cashierId !== input.actorId) ||
      shift.locationId !== input.locationId ||
      shift.registerId !== input.registerId
    )
      throw new OperationsError(
        "FORBIDDEN",
        "Sale must use the cashier's open register shift.",
      );
    const base = input.lines.map((line) => {
      const found = this.variant(store, line.variantId);
      if (!found.variant.active || found.product.status !== "active")
        throw new OperationsError(
          "VALIDATION",
          "Every sale item must be active.",
        );
      const balance = store.balances.find(
        (item) =>
          item.variantId === line.variantId &&
          item.locationId === input.locationId,
      );
      if (!balance || balance.onHand - balance.reserved < line.quantity)
        throw new OperationsError(
          "INSUFFICIENT_STOCK",
          `${found.variant.sku} is out of stock at this store.`,
        );
      return {
        found,
        balance,
        quantity: line.quantity,
        unitPriceMinor: found.variant.priceMinor ?? found.product.priceMinor,
      };
    });
    const campaign = calculateCampaignDiscount(
      store,
      base.map((item) => ({
        variantId: item.found.variant.id,
        quantity: item.quantity,
        unitPriceMinor: item.unitPriceMinor,
      })),
    );
    const campaignDiscountMinor = campaign?.discountMinor ?? 0;
    if (input.manualDiscountMinor > 0 && !exchange) {
      const approval = input.approvalId
        ? this.approval(store, input.approvalId, "cart")
        : null;
      const fingerprint = JSON.stringify({
        lines: input.lines,
        amountMinor: input.manualDiscountMinor,
      });
      if (
        !approval ||
        approval.amountMinor !== input.manualDiscountMinor ||
        approval.fingerprint !== fingerprint
      )
        throw new OperationsError(
          "FORBIDDEN",
          "Manual discount approval is missing or stale.",
        );
    }
    const subtotalMinor = base.reduce(
      (sum, item) => sum + item.unitPriceMinor * item.quantity,
      0,
    );
    const totalDiscount = Math.min(
      subtotalMinor,
      campaignDiscountMinor + input.manualDiscountMinor,
    );
    const allocated = allocateDiscount(
      base.map((item) => ({
        quantity: item.quantity,
        unitPriceMinor: item.unitPriceMinor,
      })),
      totalDiscount,
    );
    const lines: PosSaleLine[] = base.map((item, index) => {
      const lineTotal = item.unitPriceMinor * item.quantity - allocated[index]!;
      return {
        variantId: item.found.variant.id,
        sku: item.found.variant.sku,
        barcode: item.found.variant.barcode,
        productName: item.found.product.name,
        variantLabel: `${item.found.variant.color} · ${item.found.variant.size}`,
        quantity: item.quantity,
        unitPriceMinor: item.unitPriceMinor,
        discountMinor: allocated[index]!,
        lineTotalMinor: lineTotal,
        refundableUnitMinor: Math.floor(lineTotal / item.quantity),
        unitCostMinor: item.found.product.costMinor,
      };
    });
    const totalMinor = subtotalMinor - totalDiscount;
    const tenders = this.tenders(
      store,
      input.tenders,
      "payment",
      input.commandId,
    );
    if (
      !exchange &&
      tenders.reduce((sum, item) => sum + item.amountMinor, 0) !== totalMinor
    )
      throw new OperationsError(
        "VALIDATION",
        "Applied tenders must exactly equal the sale total.",
      );
    let customer = input.customerId
      ? store.customers.find(
          (item) => item.id === input.customerId && item.status === "active",
        )
      : null;
    if (!customer && input.customerName && input.customerPhone)
      customer = this.createCustomerInStore(
        store,
        input.customerName,
        input.customerPhone,
        input.actorId,
      );
    const now = new Date().toISOString();
    const receiptNumber = this.nextReceipt(store, now);
    const sale: PosSale = {
      id: `sale-${randomUUID()}`,
      receiptNumber,
      locationId: input.locationId,
      registerId: input.registerId,
      shiftId: input.shiftId,
      cashierId: input.actorId,
      customerId: customer?.id ?? null,
      customer: customer
        ? { name: customer.name, phone: customer.phone }
        : null,
      lines,
      subtotalMinor,
      campaignDiscountMinor,
      manualDiscountMinor: input.manualDiscountMinor,
      manualDiscountReason: input.manualDiscountReason,
      approvalId: input.approvalId,
      totalMinor,
      tenders,
      status: "completed",
      createdAt: now,
      updatedAt: now,
      version: 1,
    };
    for (const item of base) {
      item.balance.onHand -= item.quantity;
      item.balance.version += 1;
      store.movements.push(
        this.movement(
          item.found.variant.id,
          input.locationId,
          "sale",
          -item.quantity,
          `POS sale ${receiptNumber}.`,
          sale.id,
          input.actorId,
          `${input.commandId}-${item.found.variant.id}`,
          now,
        ),
      );
    }
    store.posSales.push(sale);
    store.processedCommands.push(input.commandId);
    if (customer?.loyaltyEnrolledAt) {
      const points =
        Math.floor(totalMinor / store.loyaltySettings.spendPerPointMinor) *
        store.loyaltySettings.pointsPerUnit;
      if (points > 0)
        store.loyaltyTransactions.push({
          id: `loy-${randomUUID()}`,
          customerId: customer.id,
          type: "earn",
          points,
          reason: `Points earned from ${receiptNumber}.`,
          orderId: sale.id,
          returnId: null,
          spendPerPointMinor: store.loyaltySettings.spendPerPointMinor,
          pointsPerUnit: store.loyaltySettings.pointsPerUnit,
          actorId: input.actorId,
          commandId: `${input.commandId}-loyalty`,
          occurredAt: now,
        });
    }
    appendAudit(store, {
      module: "pos",
      action: "sale_completed",
      entityType: "pos_sale",
      entityId: sale.id,
      actorId: input.actorId,
      branchId: input.locationId,
      summary: `Completed ${receiptNumber}.`,
      metadata: { totalMinor, tenderCount: tenders.length },
    });
    return sale;
  }

  private catalog(store: ShonaiStore, locationId: string): PosCatalogItem[] {
    return store.products
      .filter((product) => product.status === "active")
      .flatMap((product) =>
        product.variants
          .filter((variant) => variant.active)
          .map((variant) => {
            const balance = store.balances.find(
              (item) =>
                item.variantId === variant.id && item.locationId === locationId,
            );
            return {
              variantId: variant.id,
              productId: product.id,
              categoryId: product.categoryId,
              productName: product.name,
              variantLabel: `${variant.color} · ${variant.size}`,
              sku: variant.sku,
              barcode: variant.barcode,
              priceMinor: variant.priceMinor ?? product.priceMinor,
              unitCostMinor: product.costMinor,
              available: Math.max(
                (balance?.onHand ?? 0) - (balance?.reserved ?? 0),
                0,
              ),
              imageUrl:
                product.images[0]?.previewUrl ?? "/product-placeholder.svg",
            };
          }),
      )
      .toSorted((a, b) => a.productName.localeCompare(b.productName));
  }

  private tenders(
    store: ShonaiStore,
    inputs: readonly TenderInput[],
    direction: "payment" | "refund",
    commandId: string,
  ): PosTender[] {
    const now = new Date().toISOString();
    return inputs.map((input, index) => {
      const provider = input.providerId
        ? store.paymentProviders.find(
            (item) => item.id === input.providerId && item.active,
          )
        : null;
      if (
        input.kind !== "cash" &&
        (!provider || provider.category !== input.kind)
      )
        throw new OperationsError(
          "VALIDATION",
          "Choose an active bank or MFS provider.",
        );
      if (input.kind !== "cash" && !input.reference?.trim())
        throw new OperationsError(
          "VALIDATION",
          "Card and MFS payments require a reference.",
        );
      if (
        input.reference &&
        [
          ...store.posSales.flatMap((sale) => sale.tenders),
          ...store.posReturns.flatMap((item) => item.refundTenders),
        ].some(
          (item) =>
            item.providerId === input.providerId &&
            item.reference === input.reference,
        )
      )
        throw new OperationsError(
          "VALIDATION",
          "This provider reference was already recorded.",
        );
      const received =
        input.kind === "cash"
          ? (input.receivedMinor ?? input.amountMinor)
          : null;
      if (received !== null && received < input.amountMinor)
        throw new OperationsError(
          "VALIDATION",
          "Cash received cannot be less than cash applied.",
        );
      return {
        id: `${commandId}-${index}`,
        kind: input.kind,
        direction,
        providerId: provider?.id ?? null,
        reference: input.kind === "cash" ? null : input.reference!.trim(),
        amountMinor: input.amountMinor,
        receivedMinor: received,
        changeMinor: received === null ? 0 : received - input.amountMinor,
        recordedAt: now,
      };
    });
  }

  private createCustomerInStore(
    store: ShonaiStore,
    name: string,
    phone: string,
    actorId: string,
  ) {
    const normalized = normalizeBangladeshPhone(phone);
    if (!normalized)
      throw new OperationsError(
        "VALIDATION",
        "Use a valid Bangladesh phone number.",
      );
    const existing = store.customers.find((item) => item.phone === normalized);
    if (existing) return existing;
    const now = new Date().toISOString();
    const customer: Customer = {
      id: `cus-${randomUUID()}`,
      name: name.trim(),
      phone: normalized,
      email: null,
      birthday: null,
      notes: "Created from POS customer lookup.",
      status: "active",
      kind: "guest",
      loyaltyEnrolledAt: null,
      addresses: [],
      createdAt: now,
      updatedAt: now,
      version: 1,
    };
    store.customers.push(customer);
    appendAudit(store, {
      module: "customers",
      action: "created_from_pos",
      entityType: "customer",
      entityId: customer.id,
      actorId,
      summary: "Created a customer profile from POS phone lookup.",
    });
    return customer;
  }

  private applyReturnStock(
    store: ShonaiStore,
    result: PosReturn,
    actorId: string,
    commandId: string,
  ) {
    const now = new Date().toISOString();
    for (const line of result.lines) {
      const balance = store.balances.find(
        (item) =>
          item.variantId === line.variantId &&
          item.locationId === result.locationId,
      );
      if (!balance)
        throw new OperationsError(
          "NOT_FOUND",
          "Return inventory balance not found.",
        );
      if (line.disposition === "restock") {
        balance.onHand += line.quantity;
        balance.version += 1;
      }
      store.movements.push(
        this.movement(
          line.variantId,
          result.locationId,
          line.disposition === "restock" ? "return" : "damage",
          line.disposition === "restock" ? line.quantity : 0,
          `${result.reason} (${line.disposition}).`,
          result.id,
          actorId,
          `${commandId}-${line.variantId}`,
          now,
        ),
      );
    }
  }

  private updateSaleRefundState(store: ShonaiStore, result: PosReturn) {
    if (!result.saleId) return;
    const sale = store.posSales.find((item) => item.id === result.saleId);
    if (!sale) return;
    const refunded = store.posReturns
      .filter((item) => item.saleId === sale.id && item.status === "completed")
      .reduce((sum, item) => sum + item.totalRefundMinor, 0);
    sale.status =
      refunded >= sale.totalMinor ? "refunded" : "partially_refunded";
    sale.updatedAt = new Date().toISOString();
    sale.version += 1;
  }

  private validateRefundTenders(
    store: ShonaiStore,
    result: PosReturn,
    tenders: readonly PosTender[],
  ) {
    if (!result.saleId) return;
    const sale = store.posSales.find((item) => item.id === result.saleId);
    if (!sale)
      throw new OperationsError(
        "RECEIPT_MISMATCH",
        "Original POS sale was not found.",
      );
    const key = (item: PosTender) =>
      `${item.kind}:${item.providerId ?? "cash"}`;
    const original = new Map<string, number>();
    for (const tender of sale.tenders)
      original.set(
        key(tender),
        (original.get(key(tender)) ?? 0) + tender.amountMinor,
      );
    const refunded = new Map<string, number>();
    for (const returned of store.posReturns.filter(
      (item) =>
        item.id !== result.id &&
        item.saleId === sale.id &&
        item.status === "completed",
    ))
      for (const tender of returned.refundTenders)
        refunded.set(
          key(tender),
          (refunded.get(key(tender)) ?? 0) + tender.amountMinor,
        );
    for (const tender of tenders) {
      const tenderKey = key(tender);
      const available =
        (original.get(tenderKey) ?? 0) - (refunded.get(tenderKey) ?? 0);
      if (tender.amountMinor > available)
        throw new OperationsError(
          "VALIDATION",
          "Refund each amount to an original tender channel without exceeding its paid balance.",
        );
      refunded.set(
        tenderKey,
        (refunded.get(tenderKey) ?? 0) + tender.amountMinor,
      );
    }
  }

  private approval(store: ShonaiStore, id: string, entityId: string) {
    const approval = store.posApprovals.find(
      (item) => item.id === id && item.entityId === entityId,
    );
    if (!approval || approval.status !== "approved" || !approval.decidedBy)
      throw new OperationsError(
        "FORBIDDEN",
        "A valid manager approval is required.",
      );
    return approval;
  }

  private returnRecord(store: ShonaiStore, id: string, version?: number) {
    const result = store.posReturns.find((item) => item.id === id);
    if (!result)
      throw new OperationsError("NOT_FOUND", "POS return not found.");
    if (version !== undefined && result.version !== version)
      throw new OperationsError(
        "CONFLICT",
        "Return changed. Refresh and review it.",
      );
    return result;
  }

  private shift(store: ShonaiStore, id: string, version?: number) {
    const shift = store.registerShifts.find((item) => item.id === id);
    if (!shift)
      throw new OperationsError("NOT_FOUND", "Register shift not found.");
    if (version !== undefined && shift.version !== version)
      throw new OperationsError(
        "CONFLICT",
        "Shift changed. Refresh and review it.",
      );
    return shift;
  }

  private variant(store: ShonaiStore, id: string) {
    for (const product of store.products) {
      const variant = product.variants.find((item) => item.id === id);
      if (variant) return { product, variant };
    }
    throw new OperationsError("NOT_FOUND", "Product variant not found.");
  }

  private nextReceipt(store: ShonaiStore, now: string) {
    const key = now.slice(2, 10).replaceAll("-", "");
    const next = (store.posReceiptSequences[key] ?? 0) + 1;
    store.posReceiptSequences[key] = next;
    return `POS-${key}-${String(next).padStart(4, "0")}`;
  }

  private movement(
    variantId: string,
    locationId: string,
    type: StockMovement["type"],
    onHandDelta: number,
    reason: string,
    referenceId: string,
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
      reservedDelta: 0,
      reason,
      referenceType: "pos",
      referenceId,
      actorId,
      commandId,
      occurredAt,
    };
  }
}
