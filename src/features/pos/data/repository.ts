import type { Customer } from "@/features/customers/schemas/customers";
import type { InventoryLocation } from "@/features/inventory/schemas/inventory";
import type {
  PaymentProvider,
  PosApproval,
  PosExchange,
  PosRegister,
  PosReturn,
  PosSale,
  PosSettings,
  RegisterShift,
} from "../schemas/pos";

export interface PosCatalogItem {
  variantId: string;
  productId: string;
  categoryId: string;
  productName: string;
  variantLabel: string;
  sku: string;
  barcode: string;
  priceMinor: number;
  unitCostMinor: number;
  available: number;
  imageUrl: string;
}

export interface PosBootstrap {
  locations: readonly InventoryLocation[];
  registers: readonly PosRegister[];
  providers: readonly PaymentProvider[];
  openShift: RegisterShift | null;
  catalog: readonly PosCatalogItem[];
  settings: PosSettings;
  campaigns: readonly {
    id: string;
    name: string;
    scope: "store" | "category" | "product" | "variant";
    targetIds: readonly string[];
    percentageOff: number;
    priority: number;
  }[];
}

export interface TenderInput {
  kind: "cash" | "card" | "mfs";
  providerId?: string | null;
  reference?: string | null;
  amountMinor: number;
  receivedMinor?: number | null;
}

export interface CompleteSaleInput {
  registerId: string;
  shiftId: string;
  locationId: string;
  customerId: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  lines: readonly { variantId: string; quantity: number }[];
  manualDiscountMinor: number;
  manualDiscountReason: string | null;
  approvalId: string | null;
  tenders: readonly TenderInput[];
  actorId: string;
  commandId: string;
}

export interface PosRepository {
  bootstrap(
    locationId: string | null,
    cashierId: string,
  ): Promise<PosBootstrap>;
  openShift(input: {
    registerId: string;
    openingFloatMinor: number;
    cashierId: string;
    commandId: string;
  }): Promise<RegisterShift>;
  closeShift(input: {
    shiftId: string;
    countedCashMinor: number;
    actorId: string;
    reason: string | null;
    expectedVersion: number;
    commandId: string;
  }): Promise<RegisterShift>;
  completeSale(input: CompleteSaleInput): Promise<PosSale>;
  listSales(
    query?: string,
    locationId?: string | null,
  ): Promise<readonly PosSale[]>;
  getSale(id: string): Promise<PosSale | null>;
  listReturns(locationId?: string | null): Promise<readonly PosReturn[]>;
  findCustomer(phone: string): Promise<Customer | null>;
  createCustomer(
    name: string,
    phone: string,
    actorId: string,
  ): Promise<Customer>;
  requestApproval(input: {
    type: PosApproval["type"];
    entityId: string;
    fingerprint: string;
    reason: string;
    amountMinor: number;
    actorId: string;
  }): Promise<PosApproval>;
  listApprovals(): Promise<readonly PosApproval[]>;
  decideApproval(
    id: string,
    decision: "approved" | "rejected",
    expectedVersion: number,
    actorId: string,
  ): Promise<PosApproval>;
  requestReturn(input: {
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
  }): Promise<PosReturn>;
  completeReturn(input: {
    returnId: string;
    approvalId: string;
    refundTenders: readonly TenderInput[];
    actorId: string;
    expectedVersion: number;
    commandId: string;
  }): Promise<PosReturn>;
  completeExchange(input: {
    returnId: string;
    approvalId: string;
    registerId: string;
    shiftId: string;
    replacementLines: readonly { variantId: string; quantity: number }[];
    tenders: readonly TenderInput[];
    actorId: string;
    commandId: string;
  }): Promise<PosExchange>;
  listShifts(locationId?: string | null): Promise<readonly RegisterShift[]>;
  listLocations(): Promise<readonly InventoryLocation[]>;
  listRegisters(): Promise<readonly PosRegister[]>;
  saveLocation(input: {
    id: string;
    name: string;
    active: boolean;
    actorId: string;
  }): Promise<InventoryLocation>;
  saveRegister(input: {
    id?: string;
    locationId: string;
    code: string;
    name: string;
    active: boolean;
    expectedVersion?: number;
    actorId: string;
  }): Promise<PosRegister>;
  listProviders(): Promise<readonly PaymentProvider[]>;
  saveProvider(input: {
    id?: string;
    category: PaymentProvider["category"];
    code: string;
    name: string;
    active: boolean;
    expectedVersion?: number;
    actorId: string;
  }): Promise<PaymentProvider>;
}
