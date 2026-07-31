import { env } from "@/lib/env";
import { previewReleaseManifestSchema } from "../schemas/preview";

/**
 * Builds the browser-safe preview manifest from validated server configuration.
 * It deliberately excludes filesystem paths, secrets, process details and raw Git data.
 */
export function buildPreviewReleaseManifest() {
  const previewMode = env.PREVIEW_MODE === "true";
  const isolatedData = env.MOCK_DATA_DIR?.includes("preview-data") ?? false;
  return previewReleaseManifestSchema.parse({
    releaseVersion: env.PREVIEW_RELEASE_VERSION,
    sourceRevision: env.PREVIEW_SOURCE_REVISION,
    builtAt: env.PREVIEW_BUILT_AT ?? null,
    previewMode,
    accessPolicy: env.PREVIEW_ACCESS_POLICY,
    dataSource: "mock",
    storeSchemaVersion: 4,
    packageFormatVersion: 1,
    routeCount: 71,
    artifactSha256: env.PREVIEW_ARTIFACT_SHA256 ?? null,
    roles: ["Owner", "Manager", "Cashier", "Support"],
    gates: [
      {
        id: "gate-data",
        label: "Fictional data source",
        status: env.DATA_SOURCE === "mock" ? "ready" : "blocked",
        evidence: "The preview never connects operational pages to a live API.",
      },
      {
        id: "gate-freeze",
        label: "Phase 10 design baseline",
        status: "ready",
        evidence: "Desktop/mobile demo and acceptance baselines are committed.",
      },
      {
        id: "gate-store",
        label: "Isolated preview store",
        status: isolatedData ? "ready" : "review",
        evidence: isolatedData
          ? "Runtime data is isolated from development and Playwright stores."
          : "Run npm run preview:init before distributing a package.",
      },
      {
        id: "gate-artifact",
        label: "Packaged artifact checksum",
        status: env.PREVIEW_ARTIFACT_SHA256 ? "ready" : "review",
        evidence: env.PREVIEW_ARTIFACT_SHA256
          ? "The package has a recorded SHA-256 digest."
          : "The checksum appears after npm run preview:package completes.",
      },
    ],
    reviewRoutes: [
      {
        route: "/demo",
        label: "Guided demo",
        purpose: "Six cross-module staff workflows",
      },
      {
        route: "/demo/acceptance",
        label: "Design freeze",
        purpose: "Route, visual and limitation evidence",
      },
      {
        route: "/dashboard",
        label: "Dashboard",
        purpose: "Branch-aware operational overview",
      },
      {
        route: "/products",
        label: "Catalog",
        purpose: "Products, variants, categories and import",
      },
      {
        route: "/inventory",
        label: "Inventory",
        purpose: "Balances, movements, transfers and counts",
      },
      {
        route: "/orders",
        label: "Orders",
        purpose: "Capture, reservation and fulfillment",
      },
      {
        route: "/customers",
        label: "Relationships",
        purpose: "Customers, loyalty and complaints",
      },
      {
        route: "/purchase-orders",
        label: "Procurement",
        purpose: "Supplier approval and receiving",
      },
      {
        route: "/reports",
        label: "Administration",
        purpose: "Reports, workforce and settings",
      },
      {
        route: "/platform",
        label: "Platform design",
        purpose: "Fictional integration readiness",
      },
      {
        route: "/insights",
        label: "Optimization",
        purpose: "Advisory mock recommendations",
      },
    ],
    limitations: [
      {
        id: "limit-identity",
        area: "Identity",
        limitation:
          "Role switching is a development review aid, not production authentication.",
        productionBoundary: "Phase 7 identity and session provider",
      },
      {
        id: "limit-data",
        area: "Persistence",
        limitation: "The local JSON store is single-process mock persistence.",
        productionBoundary: "Transactional API and managed database",
      },
      {
        id: "limit-providers",
        area: "Providers",
        limitation:
          "Payments, courier, messaging, media and payroll events are fictional.",
        productionBoundary: "Approved adapters, workers and verified callbacks",
      },
      {
        id: "limit-approval",
        area: "Approval",
        limitation:
          "Browser-local checklist selections are not durable sign-off.",
        productionBoundary: "External governance system of record",
      },
    ],
    handoffSteps: [
      "Verify the package SHA-256 value before starting the preview.",
      "Use only fictional data and follow the role-specific guided routes.",
      "Record the release version, route, role and viewport with feedback.",
      "Reset only through the documented Owner control when explicitly enabled.",
      "Stop the local server and remove the isolated preview data when review ends.",
    ],
  });
}
