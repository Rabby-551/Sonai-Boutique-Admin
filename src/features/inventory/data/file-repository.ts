import { randomUUID } from "node:crypto";
import { ShonaiFileStore } from "@/lib/mock-store/file-store";
import { OperationsError } from "@/lib/operations-error";
import type { Product } from "@/features/catalog/schemas/catalog";
import type { ShonaiStore } from "@/lib/mock-store/schema";
import type {
  InventoryListInput,
  InventoryRepository,
  MovementListInput,
  StockCommandInput,
  TransferCreateInput,
  CountCreateInput,
} from "./repository";
import type {
  InventoryRow,
  LocationId,
  StockBalance,
  StockMovement,
} from "../schemas/inventory";

const locationIds: LocationId[] = [
  "rupnagar",
  "mirpur-shopping-center",
  "loc-online",
];

export class FileInventoryRepository implements InventoryRepository {
  constructor(private readonly store = new ShonaiFileStore()) {}

  async listLocations() {
    return (await this.store.read()).locations;
  }

  async listInventory(input: InventoryListInput) {
    const store = await this.store.read();
    let items = this.rows(store);
    const query = input.query?.trim().toLowerCase();
    if (query)
      items = items.filter((item) =>
        `${item.productName} ${item.sku} ${item.barcode}`
          .toLowerCase()
          .includes(query),
      );
    if (input.status && input.status !== "all")
      items = items.filter((item) =>
        input.locationId && input.locationId !== "all"
          ? this.locationStatus(item, input.locationId) === input.status
          : item.status === input.status,
      );
    if (input.minValueMinor !== undefined)
      items = items.filter(
        (item) => item.valuationMinor >= input.minValueMinor!,
      );
    if (input.maxValueMinor !== undefined)
      items = items.filter(
        (item) => item.valuationMinor <= input.maxValueMinor!,
      );
    items.sort((a, b) =>
      input.sort === "available-asc"
        ? a.totalAvailable - b.totalAvailable
        : input.sort === "available-desc"
          ? b.totalAvailable - a.totalAvailable
          : input.sort === "value-desc"
            ? b.valuationMinor - a.valuationMinor
            : a.productName.localeCompare(b.productName),
    );
    return this.paginate(items, input.page, input.pageSize);
  }

  async getVariantInventory(variantId: string) {
    return (
      this.rows(await this.store.read()).find(
        (item) => item.variantId === variantId,
      ) ?? null
    );
  }

  async listMovements(input: MovementListInput) {
    const store = await this.store.read();
    const variants = this.variantLookup(store.products);
    const query = input.query?.trim().toLowerCase();
    const items = [...store.movements].filter((movement) => {
      const variant = variants.get(movement.variantId);
      return (
        (!query ||
          `${variant?.sku ?? ""} ${variant?.barcode ?? ""} ${movement.referenceId}`
            .toLowerCase()
            .includes(query)) &&
        (!input.variantId || movement.variantId === input.variantId) &&
        (!input.locationId ||
          input.locationId === "all" ||
          movement.locationId === input.locationId) &&
        (!input.type || input.type === "all" || movement.type === input.type) &&
        (!input.actor ||
          movement.actorId.toLowerCase().includes(input.actor.toLowerCase())) &&
        (!input.dateFrom ||
          movement.occurredAt.slice(0, 10) >= input.dateFrom) &&
        (!input.dateTo || movement.occurredAt.slice(0, 10) <= input.dateTo)
      );
    });
    items.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
    return this.paginate(items, input.page, input.pageSize);
  }

  async adjust(input: StockCommandInput) {
    return this.store.transaction((store) => {
      const duplicate = store.movements.find(
        (movement) => movement.commandId === input.idempotencyKey,
      );
      if (duplicate) return duplicate;
      const balance = this.balance(store, input.variantId, input.locationId);
      if (balance.version !== input.expectedVersion)
        throw new OperationsError(
          "CONFLICT",
          "Stock changed after this form was opened. Refresh and review it.",
        );
      const signed =
        input.kind === "damage"
          ? -Math.abs(input.quantity)
          : input.kind === "receipt" || input.kind === "return"
            ? Math.abs(input.quantity)
            : input.quantity;
      if (signed === 0)
        throw new OperationsError("VALIDATION", "Quantity cannot be zero.");
      if (balance.onHand + signed < balance.reserved)
        throw new OperationsError(
          "INSUFFICIENT_STOCK",
          "This change would reduce stock below the reserved quantity.",
        );
      balance.onHand += signed;
      balance.version += 1;
      const movement: StockMovement = {
        id: `mov-${randomUUID()}`,
        variantId: input.variantId,
        locationId: input.locationId,
        type: input.kind,
        onHandDelta: signed,
        reservedDelta: 0,
        reason: input.reason,
        referenceType: input.kind,
        referenceId: input.reference || "manual",
        actorId: input.actorId,
        commandId: input.idempotencyKey,
        occurredAt: new Date().toISOString(),
      };
      store.movements.push(movement);
      store.processedCommands.push(input.idempotencyKey);
      return movement;
    });
  }

  async setThreshold(
    variantId: string,
    locationId: LocationId,
    threshold: number | null,
    expectedVersion: number,
  ) {
    return this.store.transaction((store) => {
      const balance = this.balance(store, variantId, locationId);
      if (balance.version !== expectedVersion)
        throw new OperationsError(
          "CONFLICT",
          "Stock threshold changed. Refresh and review it.",
        );
      balance.thresholdOverride = threshold;
      balance.version += 1;
      return balance;
    });
  }

  async listTransfers() {
    return (await this.store.read()).transfers.toSorted((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt),
    );
  }
  async getTransfer(id: string) {
    return (
      (await this.store.read()).transfers.find((item) => item.id === id) ?? null
    );
  }
  async createTransfer(input: TransferCreateInput) {
    return this.store.transaction((store) => {
      if (input.sourceLocationId === input.destinationLocationId)
        throw new OperationsError(
          "VALIDATION",
          "Source and destination must be different.",
        );
      for (const line of input.lines) {
        if (
          !store.products.some((product) =>
            product.variants.some((variant) => variant.id === line.variantId),
          )
        )
          throw new OperationsError(
            "NOT_FOUND",
            "A transfer variant was not found.",
          );
      }
      const now = new Date().toISOString();
      const transfer = {
        id: `trf-${randomUUID()}`,
        ...input,
        lines: [...input.lines],
        status: "draft" as const,
        createdBy: input.actorId,
        createdAt: now,
        updatedAt: now,
        version: 1,
      };
      store.transfers.push(transfer);
      return transfer;
    });
  }

  async dispatchTransfer(
    id: string,
    expectedVersion: number,
    commandId: string,
    actorId: string,
  ) {
    return this.store.transaction((store) => {
      if (store.processedCommands.includes(commandId))
        return store.transfers.find((item) => item.id === id)!;
      const transfer = this.transfer(store, id, expectedVersion, "draft");
      for (const line of transfer.lines) {
        const balance = this.balance(
          store,
          line.variantId,
          transfer.sourceLocationId,
        );
        if (balance.onHand - balance.reserved < line.quantity)
          throw new OperationsError(
            "INSUFFICIENT_STOCK",
            "The source location no longer has enough available stock.",
          );
      }
      const now = new Date().toISOString();
      for (const line of transfer.lines) {
        const balance = this.balance(
          store,
          line.variantId,
          transfer.sourceLocationId,
        );
        balance.onHand -= line.quantity;
        balance.version += 1;
        store.movements.push(
          this.movement(
            line.variantId,
            transfer.sourceLocationId,
            "transfer_out",
            -line.quantity,
            0,
            `Transfer dispatched to ${transfer.destinationLocationId}.`,
            "transfer",
            transfer.id,
            actorId,
            `${commandId}-${line.variantId}`,
            now,
          ),
        );
      }
      transfer.status = "in_transit";
      transfer.version += 1;
      transfer.updatedAt = now;
      store.processedCommands.push(commandId);
      return transfer;
    });
  }

  async receiveTransfer(
    id: string,
    expectedVersion: number,
    commandId: string,
    actorId: string,
  ) {
    return this.store.transaction((store) => {
      if (store.processedCommands.includes(commandId))
        return store.transfers.find((item) => item.id === id)!;
      const transfer = this.transfer(store, id, expectedVersion, "in_transit");
      const now = new Date().toISOString();
      for (const line of transfer.lines) {
        const balance = this.balance(
          store,
          line.variantId,
          transfer.destinationLocationId,
        );
        balance.onHand += line.quantity;
        balance.version += 1;
        store.movements.push(
          this.movement(
            line.variantId,
            transfer.destinationLocationId,
            "transfer_in",
            line.quantity,
            0,
            `Transfer received from ${transfer.sourceLocationId}.`,
            "transfer",
            transfer.id,
            actorId,
            `${commandId}-${line.variantId}`,
            now,
          ),
        );
      }
      transfer.status = "received";
      transfer.version += 1;
      transfer.updatedAt = now;
      store.processedCommands.push(commandId);
      return transfer;
    });
  }

  async listCounts() {
    return (await this.store.read()).counts.toSorted((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt),
    );
  }
  async getCount(id: string) {
    return (
      (await this.store.read()).counts.find((item) => item.id === id) ?? null
    );
  }
  async createCount(input: CountCreateInput) {
    return this.store.transaction((store) => {
      const now = new Date().toISOString();
      const count = {
        id: `cnt-${randomUUID()}`,
        locationId: input.locationId,
        scope: input.scope,
        scheduledDate: input.scheduledDate,
        status: "scheduled" as const,
        lines: [],
        createdBy: input.actorId,
        createdAt: now,
        updatedAt: now,
        version: 1,
      };
      store.counts.push(count);
      return count;
    });
  }
  async startCount(id: string, expectedVersion: number) {
    return this.store.transaction((store) => {
      const count = this.count(store, id, expectedVersion, "scheduled");
      count.lines = store.balances
        .filter((balance) => balance.locationId === count.locationId)
        .map((balance) => ({
          variantId: balance.variantId,
          expected: balance.onHand,
          counted: null,
        }));
      count.status = "in_progress";
      count.version += 1;
      count.updatedAt = new Date().toISOString();
      return count;
    });
  }
  async recordCount(
    id: string,
    variantId: string,
    counted: number,
    expectedVersion: number,
  ) {
    return this.store.transaction((store) => {
      const count = this.count(store, id, expectedVersion, "in_progress");
      const line = count.lines.find((item) => item.variantId === variantId);
      if (!line)
        throw new OperationsError("NOT_FOUND", "Count line not found.");
      if (!Number.isInteger(counted) || counted < 0)
        throw new OperationsError(
          "VALIDATION",
          "Counted quantity must be a whole number.",
        );
      line.counted = counted;
      count.version += 1;
      count.updatedAt = new Date().toISOString();
      return count;
    });
  }
  async submitCount(id: string, expectedVersion: number) {
    return this.store.transaction((store) => {
      const count = this.count(store, id, expectedVersion, "in_progress");
      if (count.lines.some((line) => line.counted === null))
        throw new OperationsError(
          "VALIDATION",
          "Record every line before submitting the count.",
        );
      count.status = "pending_review";
      count.version += 1;
      count.updatedAt = new Date().toISOString();
      return count;
    });
  }
  async approveCount(
    id: string,
    expectedVersion: number,
    commandId: string,
    actorId: string,
  ) {
    return this.store.transaction((store) => {
      if (store.processedCommands.includes(commandId))
        return store.counts.find((item) => item.id === id)!;
      const count = this.count(store, id, expectedVersion, "pending_review");
      const now = new Date().toISOString();
      for (const line of count.lines) {
        const delta = (line.counted ?? line.expected) - line.expected;
        if (!delta) continue;
        const balance = this.balance(store, line.variantId, count.locationId);
        if (balance.onHand + delta < balance.reserved)
          throw new OperationsError(
            "INSUFFICIENT_STOCK",
            "A variance would reduce stock below its reserved quantity.",
          );
        balance.onHand += delta;
        balance.version += 1;
        store.movements.push(
          this.movement(
            line.variantId,
            count.locationId,
            "count_correction",
            delta,
            0,
            "Approved physical-count variance.",
            "stock_count",
            count.id,
            actorId,
            `${commandId}-${line.variantId}`,
            now,
          ),
        );
      }
      count.status = "approved";
      count.version += 1;
      count.updatedAt = now;
      store.processedCommands.push(commandId);
      return count;
    });
  }

  private rows(store: ShonaiStore): InventoryRow[] {
    return store.products.flatMap((product) =>
      product.variants.map((variant) => {
        const locations = Object.fromEntries(
          locationIds.map((locationId) => {
            const balance = store.balances.find(
              (item) =>
                item.variantId === variant.id && item.locationId === locationId,
            );
            return [
              locationId,
              {
                onHand: balance?.onHand ?? 0,
                reserved: balance?.reserved ?? 0,
                thresholdOverride: balance?.thresholdOverride ?? null,
              },
            ];
          }),
        ) as InventoryRow["locations"];
        const balanceVersions = Object.fromEntries(
          locationIds.map((locationId) => [
            locationId,
            store.balances.find(
              (item) =>
                item.variantId === variant.id && item.locationId === locationId,
            )?.version ?? 1,
          ]),
        ) as InventoryRow["balanceVersions"];
        const totalOnHand = locationIds.reduce(
          (sum, id) => sum + locations[id].onHand,
          0,
        );
        const totalReserved = locationIds.reduce(
          (sum, id) => sum + locations[id].reserved,
          0,
        );
        const totalAvailable = totalOnHand - totalReserved;
        return {
          variantId: variant.id,
          productId: product.id,
          productName: product.name,
          sku: variant.sku,
          barcode: variant.barcode,
          color: variant.color,
          size: variant.size,
          unitCostMinor: product.costMinor,
          threshold: product.lowStockThreshold,
          locations,
          balanceVersions,
          totalOnHand,
          totalReserved,
          totalAvailable,
          valuationMinor: totalOnHand * product.costMinor,
          status:
            totalAvailable === 0
              ? "out"
              : totalAvailable <= product.lowStockThreshold
                ? "low"
                : "healthy",
        };
      }),
    );
  }

  private locationStatus(row: InventoryRow, locationId: LocationId) {
    const available =
      row.locations[locationId].onHand - row.locations[locationId].reserved;
    const threshold =
      row.locations[locationId].thresholdOverride ?? row.threshold;
    return available === 0 ? "out" : available <= threshold ? "low" : "healthy";
  }
  private balance(
    store: ShonaiStore,
    variantId: string,
    locationId: LocationId,
  ): StockBalance {
    const balance = store.balances.find(
      (item) => item.variantId === variantId && item.locationId === locationId,
    );
    if (!balance)
      throw new OperationsError("NOT_FOUND", "Stock balance not found.");
    return balance;
  }
  private transfer(
    store: ShonaiStore,
    id: string,
    version: number,
    status: "draft" | "in_transit",
  ) {
    const transfer = store.transfers.find((item) => item.id === id);
    if (!transfer)
      throw new OperationsError("NOT_FOUND", "Transfer not found.");
    if (transfer.version !== version)
      throw new OperationsError(
        "CONFLICT",
        "Transfer changed. Refresh and review it.",
      );
    if (transfer.status !== status)
      throw new OperationsError(
        "INVALID_TRANSITION",
        `Transfer must be ${status.replace("_", " ")}.`,
      );
    return transfer;
  }
  private count(
    store: ShonaiStore,
    id: string,
    version: number,
    status: "scheduled" | "in_progress" | "pending_review",
  ) {
    const count = store.counts.find((item) => item.id === id);
    if (!count)
      throw new OperationsError("NOT_FOUND", "Stock count not found.");
    if (count.version !== version)
      throw new OperationsError(
        "CONFLICT",
        "Stock count changed. Refresh and review it.",
      );
    if (count.status !== status)
      throw new OperationsError(
        "INVALID_TRANSITION",
        `Stock count must be ${status.replace("_", " ")}.`,
      );
    return count;
  }
  private movement(
    variantId: string,
    locationId: LocationId,
    type: StockMovement["type"],
    onHandDelta: number,
    reservedDelta: number,
    reason: string,
    referenceType: string,
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
      reservedDelta,
      reason,
      referenceType,
      referenceId,
      actorId,
      commandId,
      occurredAt,
    };
  }
  private variantLookup(products: Product[]) {
    return new Map(
      products.flatMap((product) =>
        product.variants.map((variant) => [variant.id, variant] as const),
      ),
    );
  }
  private paginate<T>(items: T[], page = 1, pageSize = 20) {
    const size = Math.min(Math.max(pageSize, 1), 100);
    const totalPages = Math.max(1, Math.ceil(items.length / size));
    const current = Math.min(Math.max(page, 1), totalPages);
    return {
      items: items.slice((current - 1) * size, current * size),
      page: current,
      pageSize: size,
      totalItems: items.length,
      totalPages,
    };
  }
}
