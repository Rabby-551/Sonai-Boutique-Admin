import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { ShonaiFileStore } from "@/lib/mock-store/file-store";
import { createShonaiStore } from "@/lib/mock-store/fixtures";
import { FileAdministrationRepository } from "../data/file-repository";
import type { Permission } from "@/lib/auth/permissions";
const directories: string[] = [];
afterEach(async () => {
  for (const directory of directories.splice(0))
    await rm(directory, { recursive: true, force: true });
});
async function setup() {
  const directory = await mkdtemp(path.join(tmpdir(), "shonai-admin-"));
  directories.push(directory);
  const store = new ShonaiFileStore(directory);
  await store.write(createShonaiStore());
  return { store, repo: new FileAdministrationRepository(store) };
}
describe("administration repository", () => {
  it("creates unique staff and appends audit history", async () => {
    const { store, repo } = await setup();
    const item = await repo.createStaff(
      {
        name: "Fictional Employee",
        phone: "+8801700000999",
        email: "employee@example.test",
        role: "cashier",
        branchIds: ["rupnagar"],
        sharedScope: false,
        hireDate: "2026-07-01",
        status: "active",
        salaryGrade: "C2",
        notes: "Test profile.",
      },
      "usr-owner-01",
    );
    expect(item.employeeCode).toMatch(/^EMP-/);
    await expect(
      repo.createStaff(
        {
          ...item,
          name: "Duplicate",
          id: undefined,
          employeeCode: undefined,
          createdAt: undefined,
          updatedAt: undefined,
          version: undefined,
        } as never,
        "usr-owner-01",
      ),
    ).rejects.toThrow(/unique/);
    expect(
      (await store.read()).auditEvents.some(
        (event) => event.entityId === item.id,
      ),
    ).toBe(true);
  });
  it("updates persisted roles but never weakens owner", async () => {
    const { repo } = await setup();
    const cashier = (await repo.listRoles()).find(
      (item) => item.role === "cashier",
    )!;
    const updated = await repo.updateRole(
      "cashier",
      [...cashier.permissions, "reports.view"] as Permission[],
      cashier.version,
      "usr-owner-01",
    );
    expect(updated.permissions).toContain("reports.view");
    const owner = (await repo.listRoles()).find(
      (item) => item.role === "owner",
    )!;
    await expect(
      repo.updateRole(
        "owner",
        ["dashboard.view"],
        owner.version,
        "usr-owner-01",
      ),
    ).rejects.toThrow(/cannot be weakened/);
  });
});
