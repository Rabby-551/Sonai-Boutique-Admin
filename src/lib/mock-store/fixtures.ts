import { initialCatalogStore } from "@/features/catalog/data/fixtures";
import type { CatalogStore } from "@/features/catalog/schemas/catalog";
import { defaultRolePermissions, type Role } from "@/lib/auth/permissions";
import type { ShonaiStore, ShonaiStoreV2, ShonaiStoreV3 } from "./schema";

const migratedAt = "2026-07-30T00:00:00.000Z";

/** Creates the versioned operations store while preserving legacy catalog quantities as Online opening stock. */
export function createShonaiStore(
  catalog: CatalogStore = initialCatalogStore,
): ShonaiStore {
  const products = structuredClone(catalog.products);
  const balances: ShonaiStore["balances"] = [];
  const movements: ShonaiStore["movements"] = [];
  for (const product of products) {
    for (const variant of product.variants) {
      const opening = variant.stock;
      for (const locationId of [
        "rupnagar",
        "mirpur-shopping-center",
        "loc-online",
      ] as const) {
        balances.push({
          variantId: variant.id,
          locationId,
          onHand: locationId === "loc-online" ? opening : 0,
          reserved: 0,
          thresholdOverride: null,
          version: 1,
        });
      }
      if (opening > 0)
        movements.push({
          id: `mov-migration-${variant.id}`,
          variantId: variant.id,
          locationId: "loc-online",
          type: "migration_opening",
          onHandDelta: opening,
          reservedDelta: 0,
          reason: "Legacy catalog opening balance; original location unknown.",
          referenceType: "migration",
          referenceId: "catalog-v1",
          actorId: "system",
          commandId: `migration-${variant.id}`,
          occurredAt: migratedAt,
        });
      // Catalog retains this field as a read projection only; repositories hydrate it from balances.
      variant.stock = 0;
    }
  }
  const firstProduct = products[0];
  const firstVariant = firstProduct.variants[0];
  const secondProduct = products[1];
  const secondVariant = secondProduct.variants[0];
  const version3: ShonaiStoreV3 = {
    schemaVersion: 3,
    products,
    categories: structuredClone(catalog.categories),
    locations: [
      { id: "rupnagar", name: "Rupnagar", kind: "branch", active: true },
      {
        id: "mirpur-shopping-center",
        name: "Mirpur 2",
        kind: "branch",
        active: true,
      },
      { id: "loc-online", name: "Online", kind: "online", active: true },
    ],
    balances,
    movements,
    transfers: [],
    counts: [],
    orders: [
      {
        id: "ord-captured-001",
        customerId: "cus-1700000001",
        orderNumber: "SH-260730-0001",
        source: "website",
        customer: {
          name: "Demo Customer",
          phone: "+8801700000001",
          email: "customer.one@example.test",
        },
        deliveryAddress: "House 10, Road 5, Demo Area, Dhaka",
        fulfillmentLocationId: "loc-online",
        lines: [
          {
            variantId: firstVariant.id,
            sku: firstVariant.sku,
            productName: firstProduct.name,
            variantLabel: `${firstVariant.color} · ${firstVariant.size}`,
            quantity: 1,
            unitPriceMinor: firstVariant.priceMinor ?? firstProduct.priceMinor,
            unitCostMinor: firstProduct.costMinor,
          },
        ],
        campaignId: null,
        discountMinor: 0,
        subtotalMinor: firstVariant.priceMinor ?? firstProduct.priceMinor,
        deliveryMinor: 8_000,
        totalMinor:
          (firstVariant.priceMinor ?? firstProduct.priceMinor) + 8_000,
        paymentMethod: "bkash",
        paymentStatus: "pending",
        status: "placed",
        notes: "Captured website demonstration order.",
        timeline: [
          {
            id: "evt-captured-001",
            type: "order_placed",
            label: "Order captured",
            detail: "Website order entered the fulfillment queue.",
            actorId: "system",
            occurredAt: migratedAt,
          },
        ],
        payments: [],
        shipment: null,
        returns: [],
        createdAt: migratedAt,
        updatedAt: migratedAt,
        version: 1,
      },
      {
        id: "ord-captured-002",
        customerId: "cus-1800000002",
        orderNumber: "SH-260730-0002",
        source: "whatsapp",
        customer: {
          name: "Sample Buyer",
          phone: "+8801800000002",
          email: null,
        },
        deliveryAddress: "Flat 2B, Example Avenue, Dhaka",
        fulfillmentLocationId: null,
        lines: [
          {
            variantId: secondVariant.id,
            sku: secondVariant.sku,
            productName: secondProduct.name,
            variantLabel: `${secondVariant.color} · ${secondVariant.size}`,
            quantity: 1,
            unitPriceMinor:
              secondVariant.priceMinor ?? secondProduct.priceMinor,
            unitCostMinor: secondProduct.costMinor,
          },
        ],
        campaignId: null,
        discountMinor: 0,
        subtotalMinor: secondVariant.priceMinor ?? secondProduct.priceMinor,
        deliveryMinor: 8_000,
        totalMinor:
          (secondVariant.priceMinor ?? secondProduct.priceMinor) + 8_000,
        paymentMethod: "cod",
        paymentStatus: "pending",
        status: "placed",
        notes: "Captured message demonstration order.",
        timeline: [
          {
            id: "evt-captured-002",
            type: "order_placed",
            label: "Message order captured",
            detail: "WhatsApp order was recorded manually.",
            actorId: "usr-manager-01",
            occurredAt: migratedAt,
          },
        ],
        payments: [],
        shipment: null,
        returns: [],
        createdAt: migratedAt,
        updatedAt: migratedAt,
        version: 1,
      },
    ],
    customers: [
      {
        id: "cus-1700000001",
        name: "Demo Customer",
        phone: "+8801700000001",
        email: "customer.one@example.test",
        birthday: null,
        notes: "Fictional website customer created for local workflows.",
        status: "active",
        kind: "guest",
        loyaltyEnrolledAt: null,
        addresses: [
          {
            id: "addr-demo-001",
            label: "Delivery",
            address: "House 10, Road 5, Demo Area, Dhaka",
          },
        ],
        createdAt: migratedAt,
        updatedAt: migratedAt,
        version: 1,
      },
      {
        id: "cus-1800000002",
        name: "Sample Buyer",
        phone: "+8801800000002",
        email: null,
        birthday: null,
        notes: "Fictional message-order customer created for local workflows.",
        status: "active",
        kind: "guest",
        loyaltyEnrolledAt: null,
        addresses: [
          {
            id: "addr-demo-002",
            label: "Delivery",
            address: "Flat 2B, Example Avenue, Dhaka",
          },
        ],
        createdAt: migratedAt,
        updatedAt: migratedAt,
        version: 1,
      },
    ],
    loyaltySettings: {
      spendPerPointMinor: 10_000,
      pointsPerUnit: 1,
      version: 1,
      updatedAt: migratedAt,
      updatedBy: "system",
    },
    loyaltyTransactions: [],
    complaints: [],
    complaintSequences: {},
    suppliers: [
      {
        id: "sup-demo-001",
        code: "SUP-0001",
        name: "Demo Artisan Collective",
        contactName: "Fictional Contact",
        phone: "+8801900000001",
        email: "supplier@example.test",
        address: "Sample Trade Area, Dhaka",
        paymentTerms: "30 days",
        leadTimeDays: 14,
        notes: "Fictional supplier for local procurement testing.",
        status: "active",
        variants: [
          {
            variantId: firstVariant.id,
            supplierSku: `SUP-${firstVariant.sku}`,
            minimumQuantity: 5,
            lastUnitCostMinor: firstProduct.costMinor,
            leadTimeDays: 14,
          },
        ],
        createdAt: migratedAt,
        updatedAt: migratedAt,
        version: 1,
      },
    ],
    purchaseOrders: [],
    purchaseOrderSequences: {},
    processedCommands: movements.map((movement) => movement.commandId),
    orderSequences: { "260730": 2 },
  };
  return migrateShonaiStoreV3(version3);
}

/** Migrates Phase 3 data without rewriting historical customer snapshots. */
export function migrateShonaiStoreV2(legacy: ShonaiStoreV2): ShonaiStoreV3 {
  const customers: ShonaiStore["customers"] = [];
  const orders: ShonaiStore["orders"] = legacy.orders.map((order) => {
    const id = `cus-${order.customer.phone.replace(/\D/g, "").slice(-10)}`;
    let customer = customers.find((item) => item.id === id);
    if (!customer) {
      customer = {
        id,
        name: order.customer.name,
        phone: order.customer.phone,
        email: order.customer.email,
        birthday: null,
        notes: "Migrated from Phase 3 order history.",
        status: "active",
        kind: "guest",
        loyaltyEnrolledAt: null,
        addresses: order.deliveryAddress
          ? [
              {
                id: `addr-${id}-1`,
                label: "Delivery",
                address: order.deliveryAddress,
              },
            ]
          : [],
        createdAt: order.createdAt,
        updatedAt: migratedAt,
        version: 1,
      };
      customers.push(customer);
    } else if (
      order.deliveryAddress &&
      !customer.addresses.some((item) => item.address === order.deliveryAddress)
    ) {
      customer.addresses.push({
        id: `addr-${id}-${customer.addresses.length + 1}`,
        label: "Delivery",
        address: order.deliveryAddress,
      });
    }
    return { ...order, customerId: id };
  });
  return {
    ...legacy,
    schemaVersion: 3,
    orders,
    customers,
    loyaltySettings: {
      spendPerPointMinor: 10_000,
      pointsPerUnit: 1,
      version: 1,
      updatedAt: migratedAt,
      updatedBy: "system",
    },
    loyaltyTransactions: [],
    complaints: [],
    complaintSequences: {},
    suppliers: [],
    purchaseOrders: [],
    purchaseOrderSequences: {},
  };
}

const staffSeed = [
  ["owner", "Nusrat Rahman", "+8801700000101", "Owner", []],
  [
    "manager",
    "Ayesha Karim",
    "+8801700000102",
    "M2",
    ["rupnagar", "mirpur-shopping-center"],
  ],
  ["cashier", "Rafi Hasan", "+8801700000103", "C1", ["rupnagar"]],
  ["support", "Maliha Noor", "+8801700000104", "S1", []],
] as const;

/** Adds Phase 5 administration data without rewriting earlier operational history. */
export function migrateShonaiStoreV3(legacy: ShonaiStoreV3): ShonaiStore {
  const staff: ShonaiStore["staff"] = staffSeed.map(
    ([role, name, phone, grade, branchIds], index) => ({
      id: `stf-${role}-01`,
      employeeCode: `EMP-${String(index + 1).padStart(4, "0")}`,
      name,
      phone,
      email: `${role}@shonai.example.test`,
      role,
      branchIds: [...branchIds],
      sharedScope: role === "owner" || role === "support",
      hireDate: `2024-0${index + 1}-01`,
      status: "active",
      salaryGrade: grade,
      notes: "Fictional staff profile for local administration workflows.",
      createdAt: migratedAt,
      updatedAt: migratedAt,
      version: 1,
    }),
  );
  const userAccounts: ShonaiStore["userAccounts"] = staff.map((item) => ({
    id: `usr-${item.role}-01`,
    staffId: item.id,
    username: `${item.role}@shonai.example.test`,
    role: item.role,
    active: true,
    passwordResetRequestedAt: null,
    lastLoginAt: null,
    createdAt: migratedAt,
    updatedAt: migratedAt,
    version: 1,
  }));
  const roleProfiles: ShonaiStore["roleProfiles"] = (
    ["owner", "manager", "cashier", "support"] as Role[]
  ).map((role) => ({
    role,
    label: role[0].toUpperCase() + role.slice(1),
    permissions: [...defaultRolePermissions[role]],
    version: 1,
    updatedAt: migratedAt,
    updatedBy: "system",
  }));
  const salaryByRole: Record<Role, number> = {
    owner: 120_000_00,
    manager: 75_000_00,
    cashier: 35_000_00,
    support: 40_000_00,
  };
  return {
    ...legacy,
    schemaVersion: 4,
    staff,
    userAccounts,
    roleProfiles,
    attendanceRecords: [],
    leaveRequests: [],
    salaryRecords: staff.map((item) => ({
      id: `sal-${item.id}-001`,
      staffId: item.id,
      effectiveFrom: "2026-01-01",
      baseSalaryMinor: salaryByRole[item.role],
      fixedAllowanceMinor: item.role === "cashier" ? 2_000_00 : 5_000_00,
      fixedDeductionMinor: 0,
      grade: item.salaryGrade,
      note: "Fictional opening salary record.",
      createdBy: "system",
      createdAt: migratedAt,
    })),
    payrollRuns: [],
    payrollSequences: {},
    campaigns: [
      {
        id: "cmp-demo-001",
        code: "CMP-0001",
        name: "Fictional Monsoon Preview",
        description:
          "Demonstration campaign for local administration workflows.",
        status: "scheduled",
        scope: "store",
        targetIds: [],
        percentageOff: 10,
        startsAt: "2026-08-01T00:00:00.000Z",
        endsAt: "2026-08-15T23:59:59.000Z",
        priority: 10,
        budgetMinor: 100_000_00,
        usageLimit: 500,
        estimatedCostMinor: 20_000_00,
        createdBy: "system",
        createdAt: migratedAt,
        updatedAt: migratedAt,
        version: 1,
      },
    ],
    campaignSequences: 1,
    auditEvents: [
      {
        id: "aud-migration-v4",
        module: "system",
        action: "store_migrated",
        entityType: "store",
        entityId: "shonai",
        actorId: "system",
        branchId: null,
        summary: "Unified mock store migrated from schema version 3 to 4.",
        metadata: { fromVersion: 3, toVersion: 4 },
        occurredAt: migratedAt,
      },
    ],
    businessSettings: {
      businessName: "Sonai Boutique",
      timezone: "Asia/Dhaka",
      currency: "BDT",
      defaultLocationId: "loc-online",
      deliveryChargeMinor: 8_000,
      defaultLowStockThreshold: 5,
      payrollWorkingDays: 26,
      supportEmail: "support@shonai.example.test",
      version: 1,
      updatedAt: migratedAt,
      updatedBy: "system",
    },
  };
}
