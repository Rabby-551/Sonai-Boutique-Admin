import { env } from "@/lib/env";
import { OperationsClient } from "@/lib/http/operations-client";
import type {
  InventoryRepository,
  InventoryListInput,
  MovementListInput,
  StockCommandInput,
  TransferCreateInput,
  CountCreateInput,
} from "./repository";
import type {
  InventoryLocation,
  InventoryRow,
  LocationId,
  StockBalance,
  StockCount,
  StockMovement,
  StockTransfer,
} from "../schemas/inventory";

const query = (input: object) =>
  `?${new URLSearchParams(
    Object.entries(input)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, String(value)]),
  )}`;

/** Future live adapter; it mirrors the file repository without leaking HTTP into components. */
export class HttpInventoryRepository implements InventoryRepository {
  private readonly client = new OperationsClient(env.API_BASE_URL);
  listLocations() {
    return this.client.request<InventoryLocation[]>("/inventory/locations");
  }
  listInventory(input: InventoryListInput) {
    return this.client.request<
      Awaited<ReturnType<InventoryRepository["listInventory"]>>
    >(`/inventory${query(input)}`);
  }
  getVariantInventory(id: string) {
    return this.client.request<InventoryRow | null>(`/inventory/${id}`);
  }
  listMovements(input: MovementListInput) {
    return this.client.request<
      Awaited<ReturnType<InventoryRepository["listMovements"]>>
    >(`/stock-movements${query(input)}`);
  }
  adjust(input: StockCommandInput) {
    return this.post<StockMovement>("/stock-movements", input);
  }
  setThreshold(
    variantId: string,
    locationId: LocationId,
    threshold: number | null,
    expectedVersion: number,
  ) {
    return this.post<StockBalance>(`/inventory/${variantId}/threshold`, {
      locationId,
      threshold,
      expectedVersion,
    });
  }
  listTransfers() {
    return this.client.request<StockTransfer[]>("/inventory/transfers");
  }
  getTransfer(id: string) {
    return this.client.request<StockTransfer | null>(
      `/inventory/transfers/${id}`,
    );
  }
  createTransfer(input: TransferCreateInput) {
    return this.post<StockTransfer>("/inventory/transfers", input);
  }
  dispatchTransfer(
    id: string,
    expectedVersion: number,
    commandId: string,
    actorId: string,
  ) {
    return this.post<StockTransfer>(`/inventory/transfers/${id}/dispatch`, {
      expectedVersion,
      commandId,
      actorId,
    });
  }
  receiveTransfer(
    id: string,
    expectedVersion: number,
    commandId: string,
    actorId: string,
  ) {
    return this.post<StockTransfer>(`/inventory/transfers/${id}/receive`, {
      expectedVersion,
      commandId,
      actorId,
    });
  }
  listCounts() {
    return this.client.request<StockCount[]>("/stock-counts");
  }
  getCount(id: string) {
    return this.client.request<StockCount | null>(`/stock-counts/${id}`);
  }
  createCount(input: CountCreateInput) {
    return this.post<StockCount>("/stock-counts", input);
  }
  startCount(id: string, expectedVersion: number) {
    return this.post<StockCount>(`/stock-counts/${id}/start`, {
      expectedVersion,
    });
  }
  recordCount(
    id: string,
    variantId: string,
    counted: number,
    expectedVersion: number,
  ) {
    return this.post<StockCount>(`/stock-counts/${id}/lines`, {
      variantId,
      counted,
      expectedVersion,
    });
  }
  submitCount(id: string, expectedVersion: number) {
    return this.post<StockCount>(`/stock-counts/${id}/submit`, {
      expectedVersion,
    });
  }
  approveCount(
    id: string,
    expectedVersion: number,
    commandId: string,
    actorId: string,
  ) {
    return this.post<StockCount>(`/stock-counts/${id}/approve`, {
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
