import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { ShonaiFileStore } from "@/lib/mock-store/file-store";
import { createShonaiStore } from "@/lib/mock-store/fixtures";
import { FileCustomerRepository } from "../data/file-repository";

const directories: string[] = [];
afterEach(async () => {
  for (const directory of directories.splice(0))
    await rm(directory, { recursive: true, force: true });
});
async function setup() {
  const directory = await mkdtemp(path.join(tmpdir(), "shonai-customers-"));
  directories.push(directory);
  const store = new ShonaiFileStore(directory);
  await store.write(createShonaiStore());
  return new FileCustomerRepository(store);
}

describe("customer repository", () => {
  it("normalizes contacts, blocks duplicates, and preserves an auditable loyalty ledger", async () => {
    const repo = await setup();
    const created = await repo.create(
      {
        name: "Test Customer",
        phone: "01700-000003",
        email: "test.customer@example.test",
        birthday: null,
        notes: "Fictional",
        address: "Sample Road, Dhaka",
        enrollLoyalty: true,
      },
      "usr-owner-01",
    );
    expect(created.phone).toBe("+8801700000003");
    await expect(
      repo.create(
        {
          name: "Duplicate",
          phone: "+8801700000003",
          email: null,
          birthday: null,
          notes: "",
          address: null,
          enrollLoyalty: false,
        },
        "usr-owner-01",
      ),
    ).rejects.toMatchObject({ code: "DUPLICATE_CUSTOMER" });
    await repo.adjustLoyalty(
      created.id,
      25,
      "Service recovery credit.",
      "cmd-loyalty-1",
      "usr-manager-01",
    );
    const detail = await repo.get(created.id);
    expect(detail?.loyaltyBalance).toBe(25);
    await expect(
      repo.adjustLoyalty(
        created.id,
        -30,
        "Invalid debit.",
        "cmd-loyalty-2",
        "usr-manager-01",
      ),
    ).rejects.toMatchObject({ code: "VALIDATION" });
  });
});
