import { describe, expect, it } from "vitest";
import { buildPreviewReleaseManifest } from "../data/release-manifest";
import { previewReleaseManifestSchema } from "../schemas/preview";

describe("preview release manifest", () => {
  it("returns a sanitized deterministic development view", () => {
    const manifest = buildPreviewReleaseManifest();
    expect(previewReleaseManifestSchema.parse(manifest)).toEqual(manifest);
    expect(manifest.dataSource).toBe("mock");
    expect(manifest.routeCount).toBe(71);
    expect(manifest.roles).toEqual(["Owner", "Manager", "Cashier", "Support"]);
    expect(JSON.stringify(manifest)).not.toContain(process.cwd());
  });

  it("keeps live boundaries and review guidance explicit", () => {
    const manifest = buildPreviewReleaseManifest();
    expect(manifest.limitations.map((item) => item.area)).toEqual(
      expect.arrayContaining([
        "Identity",
        "Persistence",
        "Providers",
        "Approval",
      ]),
    );
    expect(manifest.gates.find((gate) => gate.id === "gate-data")?.status).toBe(
      "ready",
    );
    expect(manifest.handoffSteps).toHaveLength(5);
  });
});
