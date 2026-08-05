import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { calculateCampaignDiscount } from "@/features/campaigns/utils/discount";
import { ShonaiFileStore } from "@/lib/mock-store/file-store";
import { createShonaiStore } from "@/lib/mock-store/fixtures";
import { FilePosRepository } from "../data/file-repository";
import type { TenderInput } from "../data/repository";

const directories: string[] = [];
afterEach(async () =>
  Promise.all(
    directories
      .splice(0)
      .map((value) => rm(value, { recursive: true, force: true })),
  ),
);

describe("file-backed POS repository", () => {
  it("atomically sells with split tenders, returns stock and closes the drawer", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "sonai-pos-"));
    directories.push(directory);
    const store = new ShonaiFileStore(directory);
    await store.write(createShonaiStore());
    const repo = new FilePosRepository(store);
    const bootstrap = await repo.bootstrap("rupnagar", "usr-cashier-01");
    const item = bootstrap.catalog.find((entry) => entry.available > 0)!;
    const shift = await repo.openShift({
      registerId: "reg-rupnagar-01",
      openingFloatMinor: 50_000,
      cashierId: "usr-cashier-01",
      commandId: "shift-test-001",
    });
    const snapshot = await store.read();
    const campaign = calculateCampaignDiscount(snapshot, [
      {
        variantId: item.variantId,
        quantity: 1,
        unitPriceMinor: item.priceMinor,
      },
    ]);
    const total = item.priceMinor - (campaign?.discountMinor ?? 0);
    const cash = Math.min(40_000, total);
    const sale = await repo.completeSale({
      registerId: shift.registerId,
      shiftId: shift.id,
      locationId: shift.locationId,
      customerId: null,
      lines: [{ variantId: item.variantId, quantity: 1 }],
      manualDiscountMinor: 0,
      manualDiscountReason: null,
      approvalId: null,
      tenders: (
        [
          { kind: "cash", amountMinor: cash, receivedMinor: cash + 10_000 },
          {
            kind: "mfs",
            providerId: "mfs-bkash",
            reference: "MOCK-BKASH-001",
            amountMinor: total - cash,
          },
        ] satisfies TenderInput[]
      ).filter((entry) => entry.amountMinor > 0),
      actorId: "usr-cashier-01",
      commandId: "sale-test-001",
    });
    expect(
      sale.tenders.reduce((sum, entry) => sum + entry.amountMinor, 0),
    ).toBe(total);
    expect(sale.tenders[0]?.changeMinor).toBe(10_000);
    const requested = await repo.requestReturn({
      saleId: sale.id,
      receiptNumber: sale.receiptNumber,
      locationId: shift.locationId,
      shiftId: shift.id,
      reason: "Customer changed their mind.",
      noReceipt: false,
      lines: [
        {
          variantId: item.variantId,
          quantity: 1,
          disposition: "restock",
          refundMinor: sale.lines[0]!.refundableUnitMinor,
        },
      ],
      actorId: "usr-cashier-01",
    });
    const approval = (await repo.listApprovals()).find(
      (entry) => entry.entityId === requested.id,
    )!;
    await repo.decideApproval(
      approval.id,
      "approved",
      approval.version,
      "usr-manager-01",
    );
    const approved = (await repo.listReturns()).find(
      (entry) => entry.id === requested.id,
    )!;
    await repo.completeReturn({
      returnId: approved.id,
      approvalId: approval.id,
      refundTenders: sale.tenders.map((entry, index) => ({
        kind: entry.kind,
        providerId: entry.providerId,
        reference: entry.kind === "cash" ? null : `MOCK-REFUND-${index + 1}`,
        amountMinor: entry.amountMinor,
      })),
      actorId: "usr-manager-01",
      expectedVersion: approved.version,
      commandId: "refund-test-001",
    });
    const closed = await repo.closeShift({
      shiftId: shift.id,
      countedCashMinor: 50_000,
      actorId: "usr-cashier-01",
      reason: null,
      expectedVersion: shift.version,
      commandId: "close-test-001",
    });
    expect(closed.varianceMinor).toBe(0);
    expect(
      (await repo.bootstrap("rupnagar", "usr-cashier-01")).catalog.find(
        (entry) => entry.variantId === item.variantId,
      )?.available,
    ).toBe(item.available);
  });

  it("settles higher, lower and equal exchanges at current campaign pricing", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "sonai-pos-"));
    directories.push(directory);
    const store = new ShonaiFileStore(directory);
    await store.write(createShonaiStore());
    const repo = new FilePosRepository(store);
    const shift = await repo.openShift({
      registerId: "reg-rupnagar-01",
      openingFloatMinor: 50_000,
      cashierId: "usr-cashier-01",
      commandId: "exchange-shift",
    });

    const exchange = async (
      sourceSku: string,
      replacementSku: string,
      commandId: string,
    ) => {
      const bootstrap = await repo.bootstrap("rupnagar", "usr-cashier-01");
      const source = bootstrap.catalog.find((item) => item.sku === sourceSku)!;
      const replacement = bootstrap.catalog.find(
        (item) => item.sku === replacementSku,
      )!;
      const current = await store.read();
      const sourceCampaign = calculateCampaignDiscount(current, [
        {
          variantId: source.variantId,
          quantity: 1,
          unitPriceMinor: source.priceMinor,
        },
      ]);
      const sourceTotal =
        source.priceMinor - (sourceCampaign?.discountMinor ?? 0);
      const sale = await repo.completeSale({
        registerId: shift.registerId,
        shiftId: shift.id,
        locationId: shift.locationId,
        customerId: null,
        lines: [{ variantId: source.variantId, quantity: 1 }],
        manualDiscountMinor: 0,
        manualDiscountReason: null,
        approvalId: null,
        tenders: [
          {
            kind: "cash",
            amountMinor: sourceTotal,
            receivedMinor: sourceTotal,
          },
        ],
        actorId: "usr-cashier-01",
        commandId: `${commandId}-original-sale`,
      });
      const requested = await repo.requestReturn({
        saleId: sale.id,
        receiptNumber: sale.receiptNumber,
        locationId: shift.locationId,
        shiftId: shift.id,
        reason: "Exchange requested by customer.",
        noReceipt: false,
        lines: [
          {
            variantId: source.variantId,
            quantity: 1,
            disposition: "restock",
            refundMinor: sale.lines[0]!.refundableUnitMinor,
          },
        ],
        actorId: "usr-cashier-01",
      });
      const approval = (await repo.listApprovals()).find(
        (item) => item.entityId === requested.id,
      )!;
      await repo.decideApproval(
        approval.id,
        "approved",
        approval.version,
        "usr-manager-01",
      );
      const replacementCampaign = calculateCampaignDiscount(current, [
        {
          variantId: replacement.variantId,
          quantity: 1,
          unitPriceMinor: replacement.priceMinor,
        },
      ]);
      const replacementTotal =
        replacement.priceMinor - (replacementCampaign?.discountMinor ?? 0);
      const net = replacementTotal - sale.lines[0]!.refundableUnitMinor;
      const input = {
        returnId: requested.id,
        approvalId: approval.id,
        registerId: shift.registerId,
        shiftId: shift.id,
        replacementLines: [{ variantId: replacement.variantId, quantity: 1 }],
        tenders:
          net === 0
            ? []
            : [
                {
                  kind: "cash" as const,
                  amountMinor: Math.abs(net),
                  receivedMinor: Math.abs(net),
                },
              ],
        actorId: "usr-manager-01",
        commandId,
      };
      const result = await repo.completeExchange(input);
      const duplicate = await repo.completeExchange(input);
      const replacementSale = await repo.getSale(result.replacementSaleId);
      return { result, duplicate, replacementSale, expectedNet: net };
    };

    const higher = await exchange(
      "SH-SHL-0097-MR",
      "SH-3PC-0281-S",
      "exchange-higher",
    );
    const lower = await exchange(
      "SH-SAR-1048-TL",
      "SH-SHL-0097-MR",
      "exchange-lower",
    );
    const equal = await exchange(
      "SH-3PC-0281-M",
      "SH-3PC-0281-M",
      "exchange-equal",
    );

    for (const scenario of [higher, lower, equal]) {
      expect(scenario.result.netMinor).toBe(scenario.expectedNet);
      expect(scenario.duplicate.id).toBe(scenario.result.id);
      expect(scenario.replacementSale?.totalMinor).toBe(
        Math.max(scenario.expectedNet, 0),
      );
      expect(
        scenario.replacementSale?.tenders.reduce(
          (sum, item) => sum + item.amountMinor,
          0,
        ),
      ).toBe(Math.max(scenario.expectedNet, 0));
    }
  });
});
