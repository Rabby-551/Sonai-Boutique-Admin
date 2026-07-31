import { describe, expect, it } from "vitest";
import { MockPlatformRepository } from "../data/mock-repository";
import { platformOverviewSchema } from "../schemas/platform";

describe("MockPlatformRepository", () => {
  it("returns a validated fictional operational overview", async () => {
    const overview = await new MockPlatformRepository().getOverview();
    expect(platformOverviewSchema.safeParse(overview).success).toBe(true);
    expect(overview.environment).toBe("Fictional staging");
    expect(
      overview.integrations.every((item) =>
        ["mock", "sandbox"].includes(item.environment),
      ),
    ).toBe(true);
    expect(
      overview.releaseGates.some((item) => item.status === "blocked"),
    ).toBe(true);
  });

  it("returns a clone so presentation changes cannot mutate fixtures", async () => {
    const repository = new MockPlatformRepository();
    const first = await repository.getOverview();
    first.services[0].name = "Changed locally";
    const second = await repository.getOverview();
    expect(second.services[0].name).toBe("Admin application");
  });
});
