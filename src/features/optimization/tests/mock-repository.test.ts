import { describe, expect, it } from "vitest";
import { MockOptimizationRepository } from "../data/mock-repository";
import { optimizationWorkspaceSchema } from "../schemas/optimization";

describe("MockOptimizationRepository", () => {
  it("returns a validated, deterministic Phase 8 workspace", async () => {
    const workspace = await new MockOptimizationRepository().getWorkspace();
    expect(optimizationWorkspaceSchema.safeParse(workspace).success).toBe(true);
    expect(workspace.forecast).toHaveLength(6);
    expect(
      workspace.reorderSuggestions.every((item) => item.suggested > 0),
    ).toBe(true);
    expect(
      workspace.channels.every((item) => item.mode === "fictional sandbox"),
    ).toBe(true);
  });

  it("keeps exact matches and review exceptions visibly distinct", async () => {
    const workspace = await new MockOptimizationRepository().getWorkspace();
    const items = workspace.reconciliationRuns.flatMap((run) => run.items);
    const exact = items.find((item) => item.status === "matched");
    const mismatch = items.find((item) => item.status === "amount_mismatch");
    expect(exact?.differenceMinor).toBe(0);
    expect(mismatch?.differenceMinor).not.toBe(0);
  });

  it("returns independent clones", async () => {
    const repository = new MockOptimizationRepository();
    const first = await repository.getWorkspace();
    first.metrics[0].value = "changed";
    expect((await repository.getWorkspace()).metrics[0].value).toBe("98.7%");
  });
});
