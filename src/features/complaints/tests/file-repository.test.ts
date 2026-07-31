import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { ShonaiFileStore } from "@/lib/mock-store/file-store";
import { createShonaiStore } from "@/lib/mock-store/fixtures";
import { FileComplaintRepository } from "../data/file-repository";
const directories: string[] = [];
afterEach(async () => {
  for (const directory of directories.splice(0))
    await rm(directory, { recursive: true, force: true });
});
async function setup() {
  const directory = await mkdtemp(path.join(tmpdir(), "shonai-complaints-"));
  directories.push(directory);
  const store = new ShonaiFileStore(directory);
  await store.write(createShonaiStore());
  return new FileComplaintRepository(store);
}
describe("complaint repository", () => {
  it("enforces resolution and reopening rules while retaining history", async () => {
    const repo = await setup();
    let item = await repo.create({
      type: "complaint",
      category: "delivery",
      priority: "high",
      source: "phone",
      customerId: "cus-1700000001",
      orderId: "ord-captured-001",
      productId: null,
      locationId: "loc-online",
      dueAt: null,
      description: "The fictional delivery arrived later than expected.",
      actorId: "usr-support-01",
    });
    item = await repo.assign(
      item.id,
      "usr-support-01",
      item.version,
      "usr-manager-01",
    );
    item = await repo.transition(
      item.id,
      "acknowledged",
      "Case acknowledged.",
      item.version,
      "usr-support-01",
    );
    item = await repo.transition(
      item.id,
      "in_progress",
      "Courier context reviewed.",
      item.version,
      "usr-support-01",
    );
    await expect(
      repo.transition(
        item.id,
        "resolved",
        "short",
        item.version,
        "usr-support-01",
      ),
    ).rejects.toMatchObject({ code: "VALIDATION" });
    item = await repo.transition(
      item.id,
      "resolved",
      "Fictional customer received a service recovery update.",
      item.version,
      "usr-support-01",
    );
    item = await repo.transition(
      item.id,
      "closed",
      "Customer confirmed closure.",
      item.version,
      "usr-support-01",
    );
    item = await repo.transition(
      item.id,
      "acknowledged",
      "Customer reported the issue again.",
      item.version,
      "usr-support-01",
    );
    expect(item.status).toBe("acknowledged");
    expect(item.timeline.length).toBeGreaterThan(5);
  });
});
