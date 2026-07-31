import "server-only";

import { createSonaiSupabaseServerClient } from "@/lib/supabase/server";
import { OperationsError } from "@/lib/operations-error";
import {
  stockBalanceSchema,
  stockMovementSchema,
  type InventoryLocation,
  type InventoryRow,
  type StockCount,
  type StockTransfer,
} from "../schemas/inventory";
import type {
  CountCreateInput,
  InventoryListInput,
  InventoryRepository,
  MovementListInput,
  StockCommandInput,
  TransferCreateInput,
} from "./repository";

type Row = Record<string, unknown>;
const rows = (value: unknown): Row[] =>
  Array.isArray(value) ? (value as Row[]) : [];
const row = (value: unknown): Row =>
  value && typeof value === "object" ? (value as Row) : {};
const numeric = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const locations: readonly InventoryLocation[] = [
  { id: "rupnagar", name: "Rupnagar", kind: "branch", active: true },
  {
    id: "mirpur-shopping-center",
    name: "Mirpur 2",
    kind: "branch",
    active: true,
  },
  { id: "loc-online", name: "Online", kind: "online", active: true },
];

async function client() {
  const supabase = await createSonaiSupabaseServerClient();
  if (!supabase)
    throw new OperationsError(
      "STORE_INVALID",
      "Live commerce is not configured.",
    );
  return supabase;
}

function productName(productValue: unknown) {
  const product = row(productValue);
  const translations = rows(product.product_translations);
  return String(
    translations.find((item) => item.locale === "en")?.name ??
      translations[0]?.name ??
      "Sonai product",
  );
}

function toInventoryRow(variant: Row): InventoryRow {
  const inventoryValue = Array.isArray(variant.inventory)
    ? variant.inventory[0]
    : variant.inventory;
  const inventory = row(inventoryValue);
  const product = row(variant.products);
  const onHand = numeric(inventory.quantity_on_hand);
  const reserved = numeric(inventory.quantity_reserved);
  const threshold = numeric(inventory.low_stock_threshold);
  const available = Math.max(onHand - reserved, 0);
  const unitCostMinor = Math.round(numeric(product.cost) * 100);
  return {
    variantId: String(variant.id),
    productId: String(variant.product_id),
    productName: productName(product),
    sku: String(variant.sku),
    barcode: String(variant.barcode ?? variant.sku),
    color: String(variant.colour_en ?? "Default"),
    size: String(variant.size ?? "Free"),
    unitCostMinor,
    threshold,
    locations: {
      rupnagar: { onHand: 0, reserved: 0, thresholdOverride: null },
      "mirpur-shopping-center": {
        onHand: 0,
        reserved: 0,
        thresholdOverride: null,
      },
      "loc-online": { onHand, reserved, thresholdOverride: threshold },
    },
    balanceVersions: {
      rupnagar: 1,
      "mirpur-shopping-center": 1,
      "loc-online": Math.max(numeric(inventory.version), 1),
    },
    totalOnHand: onHand,
    totalReserved: reserved,
    totalAvailable: available,
    valuationMinor: onHand * unitCostMinor,
    status:
      available === 0 ? "out" : available <= threshold ? "low" : "healthy",
  };
}

const inventorySelect = `
  id, product_id, sku, colour_en, size, price, barcode,
  products(cost, product_translations(locale, name)),
  inventory(quantity_on_hand, quantity_reserved, low_stock_threshold, version)
`;

function unsupported(message: string): never {
  throw new OperationsError("INVALID_TRANSITION", message);
}

export class SupabaseInventoryRepository implements InventoryRepository {
  async listLocations() {
    return locations;
  }

  async listInventory(input: InventoryListInput) {
    const supabase = await client();
    const { data, error } = await supabase
      .from("product_variants")
      .select(inventorySelect)
      .eq("active", true);
    if (error) throw new OperationsError("STORE_INVALID", error.message);
    let items = rows(data).map(toInventoryRow);
    if (input.query) {
      const needle = input.query.toLowerCase();
      items = items.filter(
        (item) =>
          item.productName.toLowerCase().includes(needle) ||
          item.sku.toLowerCase().includes(needle) ||
          item.barcode.toLowerCase().includes(needle),
      );
    }
    if (input.status && input.status !== "all")
      items = items.filter((item) => item.status === input.status);
    if (input.locationId && !["all", "loc-online"].includes(input.locationId))
      items = items.map((item) => ({
        ...item,
        totalOnHand: 0,
        totalReserved: 0,
        totalAvailable: 0,
        valuationMinor: 0,
        status: "out" as const,
      }));
    if (input.minValueMinor !== undefined)
      items = items.filter(
        (item) => item.valuationMinor >= input.minValueMinor!,
      );
    if (input.maxValueMinor !== undefined)
      items = items.filter(
        (item) => item.valuationMinor <= input.maxValueMinor!,
      );
    items.sort((a, b) => {
      if (input.sort === "available-asc")
        return a.totalAvailable - b.totalAvailable;
      if (input.sort === "available-desc")
        return b.totalAvailable - a.totalAvailable;
      if (input.sort === "value-desc")
        return b.valuationMinor - a.valuationMinor;
      return a.productName.localeCompare(b.productName);
    });
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

  async getVariantInventory(variantId: string) {
    const supabase = await client();
    const { data, error } = await supabase
      .from("product_variants")
      .select(inventorySelect)
      .eq("id", variantId)
      .maybeSingle();
    if (error) throw new OperationsError("STORE_INVALID", error.message);
    return data ? toInventoryRow(data as Row) : null;
  }

  async listMovements(input: MovementListInput) {
    const supabase = await client();
    let query = supabase
      .from("inventory_movements")
      .select("*")
      .order("occurred_at", { ascending: false });
    if (input.variantId) query = query.eq("variant_id", input.variantId);
    if (input.locationId && input.locationId !== "all")
      query = query.eq("location_id", input.locationId);
    if (input.type && input.type !== "all")
      query = query.eq("movement_type", input.type);
    if (input.dateFrom) query = query.gte("occurred_at", input.dateFrom);
    if (input.dateTo) query = query.lte("occurred_at", input.dateTo);
    const { data, error } = await query;
    if (error) throw new OperationsError("STORE_INVALID", error.message);
    let items = rows(data).map((movement) =>
      stockMovementSchema.parse({
        id: String(movement.id),
        variantId: String(movement.variant_id),
        locationId: movement.location_id,
        type: movement.movement_type,
        onHandDelta: numeric(movement.on_hand_delta),
        reservedDelta: numeric(movement.reserved_delta),
        reason: String(movement.reason),
        referenceType: String(movement.reference_type),
        referenceId: String(movement.reference_id),
        actorId: String(movement.actor_id ?? "sonai-system"),
        commandId: String(movement.command_id),
        occurredAt: String(movement.occurred_at),
      }),
    );
    if (input.query) {
      const needle = input.query.toLowerCase();
      items = items.filter(
        (item) =>
          item.reason.toLowerCase().includes(needle) ||
          item.referenceId.toLowerCase().includes(needle),
      );
    }
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

  async adjust(input: StockCommandInput) {
    if (input.locationId !== "loc-online")
      unsupported(
        "Live branch stock is awaiting the branch-balance migration.",
      );
    const supabase = await client();
    const { data, error } = await supabase.rpc("admin_adjust_inventory", {
      p_variant_id: input.variantId,
      p_location_id: input.locationId,
      p_quantity: input.quantity,
      p_kind: input.kind,
      p_reason: input.reason,
      p_reference: input.reference,
      p_expected_version: input.expectedVersion,
      p_command_id: input.idempotencyKey,
    });
    if (error)
      throw new OperationsError(
        error.code === "40001" ? "CONFLICT" : "STORE_INVALID",
        error.message,
      );
    const result = await this.listMovements({
      query: String(data),
      pageSize: 100,
    });
    const movement = result.items.find((item) => item.id === String(data));
    if (!movement)
      throw new OperationsError("NOT_FOUND", "Movement not found.");
    return movement;
  }

  async setThreshold(
    variantId: string,
    locationId: "rupnagar" | "mirpur-shopping-center" | "loc-online",
    threshold: number | null,
    expectedVersion: number,
  ) {
    if (locationId !== "loc-online")
      unsupported(
        "Live branch thresholds are awaiting the branch-balance migration.",
      );
    const supabase = await client();
    const value = threshold ?? 2;
    const { data, error } = await supabase
      .from("inventory")
      .update({ low_stock_threshold: value, version: expectedVersion + 1 })
      .eq("variant_id", variantId)
      .eq("version", expectedVersion)
      .select("quantity_on_hand,quantity_reserved,version")
      .maybeSingle();
    if (error) throw new OperationsError("STORE_INVALID", error.message);
    if (!data)
      throw new OperationsError(
        "CONFLICT",
        "Inventory changed before the threshold was saved.",
      );
    return stockBalanceSchema.parse({
      variantId,
      locationId,
      onHand: numeric(data.quantity_on_hand),
      reserved: numeric(data.quantity_reserved),
      thresholdOverride: threshold,
      version: numeric(data.version),
    });
  }

  async listTransfers(): Promise<readonly StockTransfer[]> {
    return [];
  }
  async getTransfer(): Promise<StockTransfer | null> {
    return null;
  }
  async createTransfer(input: TransferCreateInput): Promise<StockTransfer> {
    void input;
    return unsupported(
      "Live branch transfers are awaiting the branch-balance migration.",
    );
  }
  async dispatchTransfer(): Promise<StockTransfer> {
    return unsupported(
      "Live branch transfers are awaiting the branch-balance migration.",
    );
  }
  async receiveTransfer(): Promise<StockTransfer> {
    return unsupported(
      "Live branch transfers are awaiting the branch-balance migration.",
    );
  }
  async listCounts(): Promise<readonly StockCount[]> {
    return [];
  }
  async getCount(): Promise<StockCount | null> {
    return null;
  }
  async createCount(input: CountCreateInput): Promise<StockCount> {
    void input;
    return unsupported(
      "Live stock counts are awaiting the branch-balance migration.",
    );
  }
  async startCount(): Promise<StockCount> {
    return unsupported(
      "Live stock counts are awaiting the branch-balance migration.",
    );
  }
  async recordCount(): Promise<StockCount> {
    return unsupported(
      "Live stock counts are awaiting the branch-balance migration.",
    );
  }
  async submitCount(): Promise<StockCount> {
    return unsupported(
      "Live stock counts are awaiting the branch-balance migration.",
    );
  }
  async approveCount(): Promise<StockCount> {
    return unsupported(
      "Live stock counts are awaiting the branch-balance migration.",
    );
  }
}
