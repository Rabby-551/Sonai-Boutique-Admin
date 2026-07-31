import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { ShonaiFileStore } from "@/lib/mock-store/file-store";
import { MockDemoRepository } from "../data/mock-repository";

const directories: string[] = [];
afterEach(async () => {
  await Promise.all(
    directories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

describe("MockDemoRepository", () => {
  it("returns isolated, runtime-validated guidance", async () => {
    const repository = new MockDemoRepository();
    const first = await repository.getWorkspace();
    first.scenarios[0].title = "Changed";
    const second = await repository.getWorkspace();
    expect(second.scenarios).toHaveLength(6);
    expect(second.roles.map((item) => item.role)).toEqual([
      "owner",
      "manager",
      "cashier",
      "support",
    ]);
    expect(second.scenarios[0].title).toBe("Merchandise setup");
  });

  it("accounts for every frozen admin route and visual checkpoint", async () => {
    const repository = new MockDemoRepository();
    const first = await repository.getAcceptanceWorkspace();
    expect(
      first.routeGroups.reduce((sum, group) => sum + group.routeCount, 0),
    ).toBe(71);
    expect(first.visualCheckpoints).toHaveLength(4);
    first.freezeRecords[0].decision = "Changed";
    expect(
      (await repository.getAcceptanceWorkspace()).freezeRecords[0].decision,
    ).not.toBe("Changed");
  });

  it("restores canonical fixtures through the file store", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "shonai-demo-"));
    directories.push(directory);
    const store = new ShonaiFileStore(directory);
    const original = await store.read();
    await store.transaction((draft) => {
      draft.products[0].name = "Temporary demo edit";
    });
    await new MockDemoRepository(store).resetFixtures();
    const restored = await store.read();
    expect(restored.products[0].name).toBe(original.products[0].name);
    expect(restored.schemaVersion).toBe(original.schemaVersion);
  });
});
