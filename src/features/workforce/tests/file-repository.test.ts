import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { ShonaiFileStore } from "@/lib/mock-store/file-store";
import { createShonaiStore } from "@/lib/mock-store/fixtures";
import { FileWorkforceRepository } from "../data/file-repository";
const directories: string[] = [];
afterEach(async () => {
  for (const directory of directories.splice(0))
    await rm(directory, { recursive: true, force: true });
});
describe("workforce repository", () => {
  it("deducts absences and requires ordered payroll approval", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "shonai-workforce-"));
    directories.push(directory);
    const store = new ShonaiFileStore(directory);
    await store.write(createShonaiStore());
    const repo = new FileWorkforceRepository(store);
    await repo.recordAttendance(
      {
        staffId: "stf-cashier-01",
        date: "2026-07-10",
        status: "absent",
        checkIn: null,
        checkOut: null,
        note: "Fictional absence.",
      },
      null,
      { actorId: "usr-manager-01", branchId: null },
    );
    let payroll = await repo.createPayroll(
      { month: "2026-07", locationId: "rupnagar" },
      "usr-manager-01",
    );
    const cashier = payroll.lines.find(
      (line) => line.staffId === "stf-cashier-01",
    )!;
    expect(cashier.absenceDays).toBe(1);
    expect(cashier.absenceDeductionMinor).toBeGreaterThan(0);
    payroll = await repo.transitionPayroll(
      payroll.id,
      "submitted",
      payroll.version,
      "cmd-submit",
      "usr-manager-01",
    );
    payroll = await repo.transitionPayroll(
      payroll.id,
      "approved",
      payroll.version,
      "cmd-approve",
      "usr-owner-01",
    );
    const retry = await repo.transitionPayroll(
      payroll.id,
      "approved",
      payroll.version - 1,
      "cmd-approve",
      "usr-owner-01",
    );
    expect(retry.status).toBe("approved");
    payroll = await repo.transitionPayroll(
      payroll.id,
      "paid",
      payroll.version,
      "cmd-paid",
      "usr-owner-01",
    );
    expect(payroll.status).toBe("paid");
  });
});
