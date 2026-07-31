import type { LocationId } from "@/features/inventory/schemas/inventory";
import type {
  PurchaseOrder,
  PurchaseOrderStatus,
  Supplier,
} from "../schemas/procurement";

export interface SupplierMutationInput {
  name: string;
  contactName: string;
  phone: string;
  email: string | null;
  address: string;
  paymentTerms: string;
  leadTimeDays: number;
  notes: string;
  variants: Supplier["variants"];
}
export interface PurchaseOrderMutationInput {
  supplierId: string;
  destinationLocationId: LocationId;
  expectedDeliveryDate: string;
  lines: readonly {
    variantId: string;
    supplierSku: string;
    orderedQuantity: number;
    unitCostMinor: number;
  }[];
  shippingMinor: number;
  otherMinor: number;
  note: string;
  actorId: string;
}
export interface PurchaseOrderListInput {
  query?: string;
  status?: "all" | PurchaseOrderStatus;
  supplierId?: string;
  locationId?: "all" | LocationId;
  page?: number;
  pageSize?: number;
}
export interface ProcurementPage<T> {
  items: readonly T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
export interface ReceiptInput {
  lines: readonly {
    variantId: string;
    acceptedQuantity: number;
    damagedQuantity: number;
    rejectedQuantity: number;
  }[];
  reference: string;
  note: string;
  expectedVersion: number;
  commandId: string;
  actorId: string;
}

/** Supplier and purchase-order contract, including atomic inventory receiving. */
export interface ProcurementRepository {
  listSuppliers(): Promise<readonly Supplier[]>;
  getSupplier(id: string): Promise<Supplier | null>;
  createSupplier(
    input: SupplierMutationInput,
    actorId: string,
  ): Promise<Supplier>;
  updateSupplier(
    id: string,
    input: SupplierMutationInput,
    expectedVersion: number,
    actorId: string,
  ): Promise<Supplier>;
  archiveSupplier(
    id: string,
    expectedVersion: number,
    actorId: string,
  ): Promise<Supplier>;
  listPurchaseOrders(
    input: PurchaseOrderListInput,
  ): Promise<ProcurementPage<PurchaseOrder>>;
  getPurchaseOrder(id: string): Promise<PurchaseOrder | null>;
  createPurchaseOrder(
    input: PurchaseOrderMutationInput,
  ): Promise<PurchaseOrder>;
  updatePurchaseOrder(
    id: string,
    input: PurchaseOrderMutationInput,
    expectedVersion: number,
  ): Promise<PurchaseOrder>;
  submitPurchaseOrder(
    id: string,
    expectedVersion: number,
    commandId: string,
    actorId: string,
  ): Promise<PurchaseOrder>;
  decidePurchaseOrder(
    id: string,
    decision: "approved" | "rejected",
    reason: string,
    expectedVersion: number,
    actorId: string,
  ): Promise<PurchaseOrder>;
  revisePurchaseOrder(
    id: string,
    expectedVersion: number,
    actorId: string,
  ): Promise<PurchaseOrder>;
  transitionPurchaseOrder(
    id: string,
    next: "supplier_confirmed" | "in_transit",
    reference: string,
    expectedVersion: number,
    actorId: string,
  ): Promise<PurchaseOrder>;
  receivePurchaseOrder(id: string, input: ReceiptInput): Promise<PurchaseOrder>;
  finishPurchaseOrder(
    id: string,
    action: "close" | "cancel",
    reason: string,
    expectedVersion: number,
    actorId: string,
  ): Promise<PurchaseOrder>;
}
