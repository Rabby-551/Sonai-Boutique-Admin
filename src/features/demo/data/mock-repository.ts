import { createShonaiStore } from "@/lib/mock-store/fixtures";
import { ShonaiFileStore } from "@/lib/mock-store/file-store";
import {
  acceptanceWorkspaceSchema,
  demoWorkspaceSchema,
} from "../schemas/demo";
import type { DemoRepository } from "./repository";

const workspace = demoWorkspaceSchema.parse({
  generatedAt: "2026-07-31T12:00:00.000Z",
  environment: "Deterministic fictional data",
  scenarios: [
    {
      id: "demo-catalog",
      title: "Merchandise setup",
      module: "Catalog",
      route: "/products",
      role: "manager",
      outcome:
        "Review a product, its variants, barcode and archive safeguards.",
      status: "ready",
      steps: [
        "Filter the product list.",
        "Open a product and inspect its variants.",
        "Review the printable barcode view.",
      ],
    },
    {
      id: "demo-fulfillment",
      title: "Stock-to-delivery flow",
      module: "Inventory and orders",
      route: "/orders",
      role: "cashier",
      outcome: "Trace reservation, fulfillment, delivery and stock movements.",
      status: "ready",
      steps: [
        "Open an order.",
        "Review its fulfillment controls and timeline.",
        "Verify the matching inventory movement.",
      ],
    },
    {
      id: "demo-service",
      title: "Customer service case",
      module: "Customers and complaints",
      route: "/complaints",
      role: "support",
      outcome: "Follow complaint ownership, notes, resolution and history.",
      status: "ready",
      steps: [
        "Filter the complaint queue.",
        "Open a complaint timeline.",
        "Review permitted support actions.",
      ],
    },
    {
      id: "demo-procurement",
      title: "Purchase receiving",
      module: "Procurement",
      route: "/purchase-orders",
      role: "manager",
      outcome: "Review approval, partial receipt and inventory reconciliation.",
      status: "ready",
      steps: [
        "Open a purchase order.",
        "Inspect approval and shipment history.",
        "Review accepted, damaged and outstanding quantities.",
      ],
    },
    {
      id: "demo-governance",
      title: "Business governance",
      module: "Reports and administration",
      route: "/reports",
      role: "owner",
      outcome: "Inspect reports, role controls, audit evidence and settings.",
      status: "ready",
      steps: [
        "Review a report and sanitized export boundary.",
        "Inspect role permissions.",
        "Open the audit log.",
      ],
    },
    {
      id: "demo-growth",
      title: "Growth design review",
      module: "Platform and optimization",
      route: "/insights",
      role: "owner",
      outcome:
        "Review advisory forecasts and fictional production-readiness signals.",
      status: "review",
      steps: [
        "Inspect accessible forecast evidence.",
        "Open reorder suggestions.",
        "Confirm provider and automation states are labeled fictional.",
      ],
    },
  ],
  roles: [
    {
      role: "owner",
      label: "Owner",
      startRoute: "/dashboard",
      scope: "Consolidated business and governance access.",
      can: [
        "Approve high-risk work",
        "Configure global settings",
        "Reset an explicitly enabled demo",
      ],
      cannot: [
        "Connect live providers from this mock",
        "Treat fictional readiness as launch approval",
      ],
    },
    {
      role: "manager",
      label: "Manager",
      startRoute: "/dashboard",
      scope: "Day-to-day operations across locations.",
      can: [
        "Manage catalog and inventory",
        "Approve counts and purchase orders",
        "Operate fulfillment",
      ],
      cannot: ["Change Owner-only identity policy", "Reset demo data"],
    },
    {
      role: "cashier",
      label: "Cashier",
      startRoute: "/orders",
      scope: "Rupnagar-scoped customer, order and count work.",
      can: [
        "Create and fulfill orders",
        "Enter stock counts",
        "Manage scoped customers",
      ],
      cannot: [
        "Approve adjustments or refunds",
        "Access payroll or procurement",
      ],
    },
    {
      role: "support",
      label: "Support",
      startRoute: "/complaints",
      scope: "Shared customer support and complaint operation.",
      can: [
        "Review customer context",
        "Add support notes",
        "Resolve and reopen complaints",
      ],
      cannot: ["Mutate inventory", "Access financial or payroll controls"],
    },
  ],
  checks: [
    {
      id: "check-static",
      area: "Code quality",
      label: "Formatting, lint and strict TypeScript",
      method: "automated",
      status: "passed",
      evidence: "Release quality scripts",
    },
    {
      id: "check-unit",
      area: "Regression",
      label: "Unit, component and repository tests",
      method: "automated",
      status: "passed",
      evidence: "Vitest regression",
    },
    {
      id: "check-browser",
      area: "Responsive UX",
      label: "Desktop and 360px workflows",
      method: "automated",
      status: "passed",
      evidence: "Playwright projects",
    },
    {
      id: "check-keyboard",
      area: "Accessibility",
      label: "Keyboard route and form review",
      method: "manual",
      status: "review",
      evidence: "Staff UAT walkthrough",
    },
    {
      id: "check-reader",
      area: "Accessibility",
      label: "Screen-reader labels and announcements",
      method: "manual",
      status: "review",
      evidence: "Assistive-technology review",
    },
    {
      id: "check-copy",
      area: "Content",
      label: "Business wording and Bengali sample review",
      method: "manual",
      status: "review",
      evidence: "Business-owner review",
    },
    {
      id: "check-roles",
      area: "Permissions",
      label: "Four-role navigation and denial behavior",
      method: "automated",
      status: "passed",
      evidence: "Role-cookie browser scenarios",
    },
    {
      id: "check-live",
      area: "Safety",
      label: "Mock and live boundaries remain explicit",
      method: "automated",
      status: "passed",
      evidence: "Boundary assertions and documentation",
    },
  ],
});

const acceptanceWorkspace = acceptanceWorkspaceSchema.parse({
  generatedAt: "2026-07-31T15:55:00.000Z",
  releaseLabel: "Mock design candidate",
  routeGroups: [
    {
      id: "routes-catalog",
      group: "Overview and catalog",
      routeCount: 8,
      owner: "Merchandising owner",
      status: "passed",
      evidence: [
        "URL-backed dashboard and catalog filters",
        "Product, category, import and barcode workflows",
      ],
    },
    {
      id: "routes-operations",
      group: "Inventory and orders",
      routeCount: 14,
      owner: "Operations owner",
      status: "passed",
      evidence: [
        "Movement-only stock changes",
        "Reservation, fulfillment, cancellation and return workflows",
      ],
    },
    {
      id: "routes-relationships",
      group: "Relationships and procurement",
      routeCount: 20,
      owner: "Customer and procurement owners",
      status: "passed",
      evidence: [
        "Customer, loyalty and complaint history",
        "Supplier, approval and strict receiving workflows",
      ],
    },
    {
      id: "routes-admin",
      group: "Business administration",
      routeCount: 20,
      owner: "Business administration owner",
      status: "passed",
      evidence: [
        "Campaign, report, workforce and payroll workflows",
        "Roles, audit, settings and finance designs",
      ],
    },
    {
      id: "routes-growth",
      group: "Platform and optimization",
      routeCount: 6,
      owner: "Future platform owner",
      status: "review",
      evidence: [
        "Fictional provider and migration evidence",
        "Advisory-only insight and automation designs",
      ],
    },
    {
      id: "routes-demo",
      group: "Demo, acceptance and release",
      routeCount: 3,
      owner: "Product owner",
      status: "passed",
      evidence: [
        "Guided four-role walkthrough",
        "Acceptance, limitations and visual evidence",
      ],
    },
  ],
  freezeRecords: [
    {
      id: "freeze-routes",
      area: "Routes and navigation",
      decision:
        "Keep the documented route hierarchy and role-filtered navigation.",
      policy: "frozen",
      changeRequires: "Scope approval, code-map update and browser regression",
    },
    {
      id: "freeze-ui",
      area: "Presentation components",
      decision:
        "Keep small Server pages and focused 50–150 line UI components.",
      policy: "controlled",
      changeRequires: "Visual baseline and accessibility review",
    },
    {
      id: "freeze-contracts",
      area: "Repository contracts",
      decision:
        "Preserve serializable domain results and stable safe error codes.",
      policy: "frozen",
      changeRequires: "Contract, adapter and traceability review",
    },
    {
      id: "freeze-values",
      area: "Money and dates",
      decision:
        "Use integer poisha and ISO UTC boundaries with localized display.",
      policy: "frozen",
      changeRequires: "Domain migration and complete regression",
    },
    {
      id: "freeze-access",
      area: "Permissions",
      decision: "Authorize independently on server queries and actions.",
      policy: "frozen",
      changeRequires: "Role-owner approval and permission-matrix tests",
    },
    {
      id: "freeze-live",
      area: "Production integration",
      decision:
        "Keep identity, providers, database and workers outside the mock bundle.",
      policy: "external",
      changeRequires: "Approved Phase 7 production contracts",
    },
  ],
  visualCheckpoints: [
    {
      id: "visual-demo-desktop",
      route: "/demo",
      viewport: "desktop",
      width: 1280,
      status: "passed",
      baseline: "demo-main-chromium-win32.png",
    },
    {
      id: "visual-demo-mobile",
      route: "/demo",
      viewport: "mobile",
      width: 390,
      status: "passed",
      baseline: "demo-main-mobile-win32.png",
    },
    {
      id: "visual-acceptance-desktop",
      route: "/demo/acceptance",
      viewport: "desktop",
      width: 1280,
      status: "passed",
      baseline: "acceptance-main-chromium-win32.png",
    },
    {
      id: "visual-acceptance-mobile",
      route: "/demo/acceptance",
      viewport: "mobile",
      width: 390,
      status: "passed",
      baseline: "acceptance-main-mobile-win32.png",
    },
  ],
  limitations: [
    {
      id: "limit-identity",
      area: "Identity",
      limitation: "Sessions and role overrides are fictional.",
      impact: "No production authentication, MFA or revocation evidence.",
      resolutionBoundary: "Approved identity provider and live session adapter",
    },
    {
      id: "limit-data",
      area: "Persistence",
      limitation: "The serialized JSON store is local mock infrastructure.",
      impact:
        "No multi-process consistency, managed backup or production durability.",
      resolutionBoundary: "Transactional production API and database",
    },
    {
      id: "limit-providers",
      area: "External services",
      limitation:
        "Payment, courier, messaging, media and channel states are simulated.",
      impact: "No real dispatch, callback, reconciliation or provider SLA.",
      resolutionBoundary:
        "Typed provider adapters, webhooks and durable workers",
    },
    {
      id: "limit-approval",
      area: "Acceptance",
      limitation: "Checklist selections remain in the current browser session.",
      impact: "They are not durable or legally meaningful sign-off.",
      resolutionBoundary: "External governance and approval record",
    },
    {
      id: "limit-assets",
      area: "Files and reports",
      limitation:
        "Media is metadata-only and verified XLSX generation is unavailable.",
      impact: "No permanent image processing or verified spreadsheet artifact.",
      resolutionBoundary: "Media service and approved spreadsheet runtime",
    },
    {
      id: "limit-deploy",
      area: "Deployment",
      limitation: "No public preview or production environment is configured.",
      impact: "Review currently runs from the local production build.",
      resolutionBoundary: "Separately approved hosting and access policy",
    },
  ],
  signoffChecks: [
    {
      id: "signoff-workflows",
      label: "Business workflows and terminology reviewed",
      owner: "Business owner",
      evidence: "Six guided demo scenarios",
    },
    {
      id: "signoff-roles",
      label: "Role boundaries reviewed with representative staff",
      owner: "Operations owner",
      evidence: "Four role guides and denial tests",
    },
    {
      id: "signoff-access",
      label: "Keyboard, screen-reader and zoom review completed",
      owner: "Accessibility reviewer",
      evidence: "Automated checks plus manual review",
    },
    {
      id: "signoff-copy",
      label: "English and Bengali-facing samples approved",
      owner: "Content owner",
      evidence: "Localization coverage and route copy",
    },
    {
      id: "signoff-limits",
      label: "Known mock limitations accepted",
      owner: "Product owner",
      evidence: "Visible limitations register",
    },
  ],
});

/** File-backed demo adapter; no external provider or production database is used. */
export class MockDemoRepository implements DemoRepository {
  constructor(private readonly store = new ShonaiFileStore()) {}

  async getWorkspace() {
    return structuredClone(workspace);
  }

  async getAcceptanceWorkspace() {
    return structuredClone(acceptanceWorkspace);
  }

  async resetFixtures() {
    await this.store.write(createShonaiStore());
  }
}
