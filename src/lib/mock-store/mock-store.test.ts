import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { initialCatalogStore } from "@/features/catalog/data/fixtures";
import { ShonaiFileStore } from "./file-store";
import { createShonaiStore } from "./fixtures";

const directories: string[] = [];
const directory = async () => {
  const value = await mkdtemp(path.join(os.tmpdir(), "shonai-store-"));
  directories.push(value);
  return value;
};
afterEach(async () =>
  Promise.all(
    directories
      .splice(0)
      .map((value) => rm(value, { recursive: true, force: true })),
  ),
);

describe("unified mock store", () => {
  it("migrates legacy catalog stock to Online without deleting the source", async () => {
    const dir = await directory();
    await writeFile(
      path.join(dir, "catalog.json"),
      JSON.stringify(initialCatalogStore),
      "utf8",
    );
    const snapshot = await new ShonaiFileStore(dir).read();
    const legacyStock = initialCatalogStore.products
      .flatMap((product) => product.variants)
      .reduce((sum, variant) => sum + variant.stock, 0);
    expect(
      snapshot.balances
        .filter((item) => item.locationId === "loc-online")
        .reduce((sum, item) => sum + item.onHand, 0),
    ).toBe(legacyStock);
    expect(
      snapshot.movements.some((item) => item.type === "migration_opening"),
    ).toBe(true);
    expect(await readFile(path.join(dir, "catalog.json"), "utf8")).toContain(
      "products",
    );
  });

  it("preserves a malformed unified store", async () => {
    const dir = await directory();
    const invalid = '{"schemaVersion":2}';
    await writeFile(path.join(dir, "shonai.json"), invalid, "utf8");
    await expect(new ShonaiFileStore(dir).read()).rejects.toThrow(/malformed/);
    expect(await readFile(path.join(dir, "shonai.json"), "utf8")).toBe(invalid);
  });

  it("migrates Phase 3 orders to durable customer relationships", async () => {
    const dir = await directory();
    const current = createShonaiStore();
    const legacy = {
      schemaVersion: 2,
      products: current.products,
      categories: current.categories,
      locations: current.locations,
      balances: current.balances,
      movements: current.movements,
      transfers: current.transfers,
      counts: current.counts,
      orders: current.orders.map(({ customerId, ...order }) => {
        void customerId;
        return order;
      }),
      processedCommands: current.processedCommands,
      orderSequences: current.orderSequences,
    };
    await writeFile(
      path.join(dir, "shonai.json"),
      JSON.stringify(legacy),
      "utf8",
    );
    const migrated = await new ShonaiFileStore(dir).read();
    expect(migrated.schemaVersion).toBe(4);
    expect(migrated.customers).toHaveLength(2);
    expect(migrated.orders.every((order) => order.customerId)).toBe(true);
    expect(migrated.loyaltyTransactions).toEqual([]);
    expect(migrated.roleProfiles).toHaveLength(4);
    expect(migrated.auditEvents[0]?.action).toBe("store_migrated");
  });

  it("normalizes legacy branch IDs without discarding the persisted store", async () => {
    const dir = await directory();
    const legacy = JSON.stringify(createShonaiStore())
      .replaceAll("rupnagar", "loc-banani")
      .replaceAll("mirpur-shopping-center", "loc-dhanmondi");
    await writeFile(path.join(dir, "shonai.json"), legacy, "utf8");

    const migrated = await new ShonaiFileStore(dir).read();

    expect(migrated.locations.map((item) => item.id)).toContain("rupnagar");
    expect(migrated.locations.map((item) => item.id)).toContain(
      "mirpur-shopping-center",
    );
    expect(await readFile(path.join(dir, "shonai.json"), "utf8")).not.toMatch(
      /loc-banani|loc-dhanmondi/,
    );
  });

  it("adds newly introduced permissions to system-managed role profiles", async () => {
    const dir = await directory();
    const stale = createShonaiStore();
    stale.roleProfiles.forEach((profile) => {
      profile.permissions = profile.permissions.filter(
        (permission) => !permission.startsWith("website."),
      );
    });
    stale.locations[0]!.name = "Banani";
    stale.locations[1]!.name = "Dhanmondi";
    stale.businessSettings.businessName = "Shonai Boutique";
    await writeFile(
      path.join(dir, "shonai.json"),
      JSON.stringify(stale),
      "utf8",
    );

    const migrated = await new ShonaiFileStore(dir).read();

    expect(
      migrated.roleProfiles.find((profile) => profile.role === "owner")
        ?.permissions,
    ).toContain("website.view");
    expect(
      migrated.roleProfiles.find((profile) => profile.role === "manager")
        ?.permissions,
    ).toContain("website.manage");
    expect(migrated.locations.map((location) => location.name)).toEqual([
      "Rupnagar",
      "Mirpur 2",
      "Online",
    ]);
    expect(migrated.businessSettings.businessName).toBe("Sonai Boutique");
  });
});
