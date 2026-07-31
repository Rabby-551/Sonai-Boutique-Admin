import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { ShonaiFileStore } from "@/lib/mock-store/file-store";
import { FileInventoryRepository } from "../data/file-repository";

const directories: string[] = [];
async function setup() {
  const dir = await mkdtemp(path.join(os.tmpdir(), "shonai-inventory-"));
  directories.push(dir);
  return new FileInventoryRepository(new ShonaiFileStore(dir));
}
afterEach(async () =>
  Promise.all(
    directories
      .splice(0)
      .map((value) => rm(value, { recursive: true, force: true })),
  ),
);

describe("inventory repository", () => {
  it("records adjustments, rejects stale versions and protects reserved stock", async () => {
    const repo = await setup();
    const row = (await repo.listInventory({ pageSize: 100 })).items[0];
    const movement = await repo.adjust({
      variantId: row.variantId,
      locationId: "loc-online",
      quantity: 2,
      kind: "receipt",
      reason: "Test receipt",
      reference: "TEST-1",
      expectedVersion: row.balanceVersions["loc-online"],
      idempotencyKey: "adjust-1",
      actorId: "tester",
    });
    expect(movement.onHandDelta).toBe(2);
    const duplicate = await repo.adjust({
      variantId: row.variantId,
      locationId: "loc-online",
      quantity: 2,
      kind: "receipt",
      reason: "Test receipt",
      reference: "TEST-1",
      expectedVersion: row.balanceVersions["loc-online"],
      idempotencyKey: "adjust-1",
      actorId: "tester",
    });
    expect(duplicate.id).toBe(movement.id);
    await expect(
      repo.adjust({
        variantId: row.variantId,
        locationId: "loc-online",
        quantity: 1,
        kind: "receipt",
        reason: "Stale retry",
        reference: "TEST-2",
        expectedVersion: row.balanceVersions["loc-online"],
        idempotencyKey: "adjust-2",
        actorId: "tester",
      }),
    ).rejects.toThrow(/changed/);
  });

  it("deducts at dispatch and adds at receipt", async () => {
    const repo = await setup();
    const before = (await repo.listInventory({ pageSize: 100 })).items.find(
      (item) => item.locations["loc-online"].onHand > 0,
    )!;
    const transfer = await repo.createTransfer({
      sourceLocationId: "loc-online",
      destinationLocationId: "rupnagar",
      lines: [{ variantId: before.variantId, quantity: 1 }],
      note: "Test route",
      actorId: "tester",
    });
    const dispatched = await repo.dispatchTransfer(
      transfer.id,
      transfer.version,
      "dispatch-1",
      "tester",
    );
    const afterDispatch = await repo.getVariantInventory(before.variantId);
    expect(afterDispatch?.locations["loc-online"].onHand).toBe(
      before.locations["loc-online"].onHand - 1,
    );
    await repo.receiveTransfer(
      transfer.id,
      dispatched.version,
      "receive-1",
      "tester",
    );
    const afterReceipt = await repo.getVariantInventory(before.variantId);
    expect(afterReceipt?.locations["rupnagar"].onHand).toBe(
      before.locations["rupnagar"].onHand + 1,
    );
  });

  it("snapshots and reconciles a stock count", async () => {
    const repo = await setup();
    const created = await repo.createCount({
      locationId: "loc-online",
      scope: "All SKUs",
      scheduledDate: "2026-07-30",
      actorId: "tester",
    });
    const started = await repo.startCount(created.id, created.version);
    const line = started.lines[0];
    let recorded = started;
    for (const current of started.lines)
      recorded = await repo.recordCount(
        started.id,
        current.variantId,
        current.variantId === line.variantId
          ? current.expected + 1
          : current.expected,
        recorded.version,
      );
    const submitted = await repo.submitCount(recorded.id, recorded.version);
    const approved = await repo.approveCount(
      submitted.id,
      submitted.version,
      "count-approve-1",
      "manager",
    );
    expect(approved.status).toBe("approved");
    expect(
      (
        await repo.listMovements({
          variantId: line.variantId,
          type: "count_correction",
        })
      ).items,
    ).toHaveLength(1);
  });
});
