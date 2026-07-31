import type {
  InventoryLocation,
  InventoryRow,
  LocationId,
  StockCount,
  StockBalance,
  StockMovement,
  StockMovementType,
  StockTransfer,
} from "../schemas/inventory";

export interface InventoryListInput {
  query?: string;
  locationId?: "all" | LocationId;
  status?: "all" | "healthy" | "low" | "out";
  minValueMinor?: number;
  maxValueMinor?: number;
  sort?: "name" | "available-asc" | "available-desc" | "value-desc";
  page?: number;
  pageSize?: number;
}
export interface MovementListInput {
  query?: string;
  variantId?: string;
  locationId?: "all" | LocationId;
  type?: "all" | StockMovementType;
  actor?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}
export interface PageResult<T> {
  items: readonly T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
export interface StockCommandInput {
  variantId: string;
  locationId: LocationId;
  quantity: number;
  kind: "receipt" | "adjustment" | "damage" | "return";
  reason: string;
  reference: string;
  expectedVersion: number;
  idempotencyKey: string;
  actorId: string;
}
export interface TransferCreateInput {
  sourceLocationId: LocationId;
  destinationLocationId: LocationId;
  lines: readonly { variantId: string; quantity: number }[];
  note: string;
  actorId: string;
}
export interface CountCreateInput {
  locationId: LocationId;
  scope: string;
  scheduledDate: string;
  actorId: string;
}

/** Inventory contract used by pages, actions and order orchestration. */
export interface InventoryRepository {
  listLocations(): Promise<readonly InventoryLocation[]>;
  listInventory(input: InventoryListInput): Promise<PageResult<InventoryRow>>;
  getVariantInventory(variantId: string): Promise<InventoryRow | null>;
  listMovements(input: MovementListInput): Promise<PageResult<StockMovement>>;
  adjust(input: StockCommandInput): Promise<StockMovement>;
  setThreshold(
    variantId: string,
    locationId: LocationId,
    threshold: number | null,
    expectedVersion: number,
  ): Promise<StockBalance>;
  listTransfers(): Promise<readonly StockTransfer[]>;
  getTransfer(id: string): Promise<StockTransfer | null>;
  createTransfer(input: TransferCreateInput): Promise<StockTransfer>;
  dispatchTransfer(
    id: string,
    expectedVersion: number,
    commandId: string,
    actorId: string,
  ): Promise<StockTransfer>;
  receiveTransfer(
    id: string,
    expectedVersion: number,
    commandId: string,
    actorId: string,
  ): Promise<StockTransfer>;
  listCounts(): Promise<readonly StockCount[]>;
  getCount(id: string): Promise<StockCount | null>;
  createCount(input: CountCreateInput): Promise<StockCount>;
  startCount(id: string, expectedVersion: number): Promise<StockCount>;
  recordCount(
    id: string,
    variantId: string,
    counted: number,
    expectedVersion: number,
  ): Promise<StockCount>;
  submitCount(id: string, expectedVersion: number): Promise<StockCount>;
  approveCount(
    id: string,
    expectedVersion: number,
    commandId: string,
    actorId: string,
  ): Promise<StockCount>;
}
