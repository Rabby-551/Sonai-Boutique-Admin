import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { ShonaiFileStore } from "@/lib/mock-store/file-store";
import { createShonaiStore } from "@/lib/mock-store/fixtures";
import { FileProcurementRepository } from "../data/file-repository";
const directories: string[] = [];
afterEach(async () => {
  for (const directory of directories.splice(0))
    await rm(directory, { recursive: true, force: true });
});
describe("procurement repository", () => {
  it("approves and partially receives a PO into inventory atomically", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "shonai-procurement-"));
    directories.push(directory);
    const store = new ShonaiFileStore(directory);
    await store.write(createShonaiStore());
    const repo = new FileProcurementRepository(store);
    const snapshot = await store.read();
    const variant = snapshot.products[0].variants[0];
    const before = snapshot.balances.find(
      (item) => item.variantId === variant.id && item.locationId === "rupnagar",
    )!.onHand;
    let po = await repo.createPurchaseOrder({
      supplierId: "sup-demo-001",
      destinationLocationId: "rupnagar",
      expectedDeliveryDate: "2026-08-15",
      lines: [
        {
          variantId: variant.id,
          supplierSku: `SUP-${variant.sku}`,
          orderedQuantity: 10,
          unitCostMinor: snapshot.products[0].costMinor,
        },
      ],
      shippingMinor: 5000,
      otherMinor: 0,
      note: "Fictional procurement test.",
      actorId: "usr-manager-01",
    });
    po = await repo.submitPurchaseOrder(
      po.id,
      po.version,
      "cmd-po-submit",
      "usr-manager-01",
    );
    po = await repo.decidePurchaseOrder(
      po.id,
      "approved",
      "",
      po.version,
      "usr-owner-01",
    );
    po = await repo.transitionPurchaseOrder(
      po.id,
      "supplier_confirmed",
      "SUP-CONF-001",
      po.version,
      "usr-manager-01",
    );
    po = await repo.receivePurchaseOrder(po.id, {
      lines: [
        {
          variantId: variant.id,
          acceptedQuantity: 6,
          damagedQuantity: 1,
          rejectedQuantity: 0,
        },
      ],
      reference: "GRN-001",
      note: "Partial delivery.",
      expectedVersion: po.version,
      commandId: "cmd-po-receipt",
      actorId: "usr-manager-01",
    });
    expect(po.status).toBe("partially_received");
    const after = await store.read();
    expect(
      after.balances.find(
        (item) =>
          item.variantId === variant.id && item.locationId === "rupnagar",
      )?.onHand,
    ).toBe(before + 6);
    expect(
      after.movements.some(
        (item) =>
          item.type === "purchase_receipt" && item.referenceId === po.id,
      ),
    ).toBe(true);
    await expect(
      repo.receivePurchaseOrder(po.id, {
        lines: [
          {
            variantId: variant.id,
            acceptedQuantity: 4,
            damagedQuantity: 0,
            rejectedQuantity: 0,
          },
        ],
        reference: "GRN-OVER",
        note: "",
        expectedVersion: po.version,
        commandId: "cmd-po-over",
        actorId: "usr-manager-01",
      }),
    ).rejects.toMatchObject({ code: "RECEIPT_MISMATCH" });
  });
});
