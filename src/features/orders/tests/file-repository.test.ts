import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { ShonaiFileStore } from "@/lib/mock-store/file-store";
import { FileInventoryRepository } from "@/features/inventory/data/file-repository";
import { FileOrderRepository } from "../data/file-repository";

const directories: string[] = [];
async function setup() {
  const dir = await mkdtemp(path.join(os.tmpdir(), "shonai-orders-"));
  directories.push(dir);
  const store = new ShonaiFileStore(dir);
  return {
    orders: new FileOrderRepository(store),
    inventory: new FileInventoryRepository(store),
  };
}
afterEach(async () =>
  Promise.all(
    directories
      .splice(0)
      .map((value) => rm(value, { recursive: true, force: true })),
  ),
);
const create = async (orders: FileOrderRepository, variantId: string) =>
  orders.createOrder({
    source: "phone",
    customerName: "Test Customer",
    customerPhone: "+8801712345678",
    customerEmail: null,
    deliveryAddress: "House 1, Dhaka",
    preferredLocationId: "loc-online",
    lines: [{ variantId, quantity: 1 }],
    deliveryMinor: 8000,
    paymentMethod: "cash",
    notes: "Repository workflow",
    actorId: "cashier",
    idempotencyKey: crypto.randomUUID(),
  });

describe("order repository", () => {
  it("reserves on confirmation and releases on cancellation", async () => {
    const { orders, inventory } = await setup();
    const row = (await inventory.listInventory({ pageSize: 100 })).items.find(
      (item) => item.locations["loc-online"].onHand > 0,
    )!;
    const order = await create(orders, row.variantId);
    const confirmed = await orders.confirmOrder(
      order.id,
      order.version,
      "confirm-1",
      "manager",
    );
    const duplicate = await orders.confirmOrder(
      order.id,
      order.version,
      "confirm-1",
      "manager",
    );
    expect(duplicate.version).toBe(confirmed.version);
    expect(
      (await inventory.getVariantInventory(row.variantId))?.locations[
        "loc-online"
      ].reserved,
    ).toBe(1);
    await orders.cancelOrder(
      order.id,
      "Customer request",
      confirmed.version,
      "cancel-1",
      "manager",
    );
    expect(
      (await inventory.getVariantInventory(row.variantId))?.locations[
        "loc-online"
      ].reserved,
    ).toBe(0);
  });

  it("consumes inventory at shipment and restores a received return", async () => {
    const { orders, inventory } = await setup();
    const before = (
      await inventory.listInventory({ pageSize: 100 })
    ).items.find((item) => item.locations["loc-online"].onHand > 0)!;
    let order = await create(orders, before.variantId);
    order = await orders.confirmOrder(
      order.id,
      order.version,
      "confirm-2",
      "manager",
    );
    order = await orders.transitionOrder(
      order.id,
      "picking",
      order.version,
      "pick-2",
      "manager",
    );
    order = await orders.transitionOrder(
      order.id,
      "packed",
      order.version,
      "pack-2",
      "manager",
    );
    order = await orders.transitionOrder(
      order.id,
      "shipped",
      order.version,
      "ship-2",
      "manager",
    );
    order = await orders.transitionOrder(
      order.id,
      "delivered",
      order.version,
      "deliver-2",
      "manager",
    );
    const request = await orders.requestReturn(
      order.id,
      [{ variantId: before.variantId, quantity: 1 }],
      "Changed mind",
      order.version,
      "manager",
    );
    await orders.decideReturn(
      order.id,
      request.id,
      "approved",
      order.version + 1,
      "manager",
    );
    const approvedOrder = await orders.getOrder(order.id);
    const returned = await orders.receiveReturn(
      order.id,
      request.id,
      approvedOrder!.version,
      "return-2",
      "manager",
    );
    expect(returned.paymentStatus).toBe("refunded");
    expect(
      (await inventory.getVariantInventory(before.variantId))?.locations[
        "loc-online"
      ].onHand,
    ).toBe(before.locations["loc-online"].onHand);
  });
});
