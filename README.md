# Sonai Boutique Admin Panel

A Next.js operations dashboard for Sonai Boutique's storefront, branches, catalog, inventory, fulfillment, procurement, reporting, and staff workflows. It supports a safe mock mode and a shared Supabase commerce mode.

## Run locally

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`. `/login` uses the configured authentication boundary: `MOCK_ROLE` in mock mode or Supabase email/password plus `admin_roles` in live mode.

## Shared storefront mode

The admin and storefront can use the same Supabase project for identity, products, online inventory, orders, and bilingual homepage content. Apply the storefront migration `supabase/migrations/20260731181432_admin_storefront_unification.sql`, then configure:

```dotenv
DATA_SOURCE=mock
COMMERCE_SOURCE=supabase
AUTH_SOURCE=supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
STOREFRONT_URL=http://localhost:3000
```

Only the publishable key belongs in the dashboard. Create the staff user in Supabase Auth and assign an active row in `public.admin_roles`; the dashboard never trusts browser-editable user metadata for authorization. `/website` publishes English and Bangla homepage content consumed by the storefront. Branch transfers, physical counts, returns, and external payment/courier/messaging providers remain explicit launch integrations rather than simulated live actions.

`DEMO_RESET_ENABLED=false` is the safe default. Enable it only in a controlled mock environment when the Owner should be able to restore deterministic fixtures from `/demo`.

## Quality commands

```powershell
npm run format:check
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
npm run quality:release
```

## Architecture

- `src/app`: route composition and App Router boundaries.
- `src/features`: schemas, repositories, queries/actions, feature UI, and tests.
- `src/components`: reusable layout and UI components.
- `src/lib`: authentication, permissions, environment, navigation, and formatting.
- `test-cases`: structured source for the requirements-linked Excel workbook.

Server Components load initial data. Interactive components remain focused client islands, generally 50–150 lines. Presentation code consumes repositories and never imports fixtures. `DATA_SOURCE=mock|api` selects infrastructure in server-only factories.

## Phase 2 catalog

- `/dashboard` supports URL-backed location, channel, and date-range summaries.
- `/products` supports search, category/status/stock/price filters, sorting, and pagination.
- Product create/edit pages manage integer-poisha pricing, variants, unique SKUs/barcodes, image metadata, archive state, and optimistic versions.
- `/categories` manages hierarchy/order/status and prevents archiving categories used by active products.
- `/products/import` previews CSV validation before importing valid rows.
- `/products/barcodes` prints Code 128 labels through a dedicated route handler.

Catalog data now lives in `.mock-data/shonai.json`, which is git-ignored. A prior `catalog.json` is migrated without being deleted. Set `MOCK_DATA_DIR` to isolate a test store; remove only `shonai.json` when you intentionally want fixtures or legacy data reinitialized.

## Phase 3 inventory and orders

- `/inventory` is the stock source of truth with per-location on-hand, reserved, available, threshold and valuation views.
- `/stock-movements`, `/inventory/transfers`, and `/stock-counts` provide auditable stock commands, barcode/SKU lookup, transfers, physical counts and variance approval.
- `/orders` supports multi-line manual capture, server-side pricing, location assignment, reservation, picking, packing, shipment, delivery, cancellation, notes and returns.
- Payment, courier and notification events are fictional mock records. No real provider request or customer credential is stored.
- Inventory, catalog and order changes share one serialized `ShonaiFileStore.transaction()` boundary and atomic file replacement.

See `src/features/inventory/README.md` and `src/features/orders/README.md` for repository usage, invariants and integration assumptions.

## Phase 4 relationships and procurement

- `/customers` manages normalized profiles, immutable order relationships, consent-based loyalty enrollment, ledger adjustments, and earning configuration.
- Delivered orders award points once; received returns create capped ledger reversals.
- `/complaints` provides assignment, acknowledged/in-progress/resolved/closed transitions, internal/customer-update notes, and an auditable timeline.
- `/suppliers` maps supplier terms to catalog variants.
- `/purchase-orders` requires approval before supplier confirmation and posts only accepted receipt quantities to inventory atomically.

See the feature READMEs under `src/features/customers`, `complaints`, and `procurement` for business invariants and future API boundaries.

## Phase 5 business administration

- `/campaigns` manages validated schedules, percentage rules, deterministic non-stacking eligibility, lifecycle states, attribution, and ROI summaries.
- `/reports` derives sales, profit, inventory, campaign, procurement, and payroll views from the unified store. The CSV export route neutralizes spreadsheet formula injection.
- `/staff`, `/users`, and `/roles` manage fictional employment profiles, mock accounts, and persisted granular permission profiles. Owner permissions cannot be weakened.
- `/attendance` and `/attendance/leave` provide branch/self-scoped records and approval workflows.
- `/payroll` snapshots effective salary and attendance inputs, applies integer-poisha absence deductions, and requires Owner approval before payment recording.
- `/audit-log` retains append-only Phase 5 events; `/settings` manages global mock defaults with optimistic concurrency.

Schema version 4 migrates version 3 atomically. No passwords, reset tokens, bank details, NID values, tax identifiers, or payment credentials are stored. See the feature READMEs under `src/features/campaigns`, `workforce`, `administration`, and `reports`.

## Phase 6 release readiness

- `/api/health` provides dependency-free liveness; `/api/ready` verifies the configured mock/API data boundary without exposing internal errors.
- Shared security headers protect pages and route handlers. Barcode and report-export endpoints use process-local throttling for development/mock safety.
- Server diagnostics use structured JSON and recursive sensitive-field redaction. Correlation IDs connect readiness/error reports without exposing customer or credential data.
- The shell supports skip navigation, focused error recovery, 44px targets, reduced motion, forced colors, mobile reflow, and semantic loading/failure states.
- `npm run check:utf8`, `check:size`, and `verify:env` are portable gates. `npm run quality:release` runs the non-browser release suite and production build; `npm run test:e2e` adds desktop/mobile verification.
- Playwright resets only `.playwright-data` before building and starting the production artifact, then runs desktop/mobile checks. Resetting before server startup avoids active-store races and dev-compiler routing drift. GitHub Actions repeats the same gates. See `../docs/admin_panel_release_runbook.md` for configuration, smoke, backup, and rollback guidance.

## Phase 7 platform design — mock implemented

`/platform`, `/platform/migrations`, and `/platform/release-readiness` now provide a mock-backed operational design for service health, provider adapters, cutover rehearsals, reconciliation evidence and go/no-go gates. Every integration is visibly fictional and makes no external call.

The real Phase 7 production backend, identity, providers, migration and infrastructure remain external. See `src/features/platform/README.md` and `../docs/phase_7_live_backend_launch_plan.md` for boundaries and production exit gates.

## Phase 8 optimization and growth design — mock implemented

Phase 8 mock routes now cover `/insights`, reorder suggestions, customer segments, rewards, privacy requests, payment reconciliation, scheduled reports, channels, automation rules, complaint SLA and localization readiness. Runtime-validated deterministic data demonstrates normal, warning, blocked, insufficient-data and review-required states.

Recommendations remain advisory: no PO, loyalty balance, customer record, settlement, external order, notification or translation is changed. See `src/features/optimization/README.md` and `../docs/phase_8_optimization_growth_plan.md` for production entry criteria and contracts.

## Phase 9 mock UAT and demo release

`/demo` provides six guided cross-module workflows, four role guides, automated evidence, browser-local manual review tracking, and explicit fictional-data boundaries. The owner-only reset restores canonical mock fixtures through the existing atomic store only when `DATA_SOURCE=mock` and `DEMO_RESET_ENABLED=true`.

See `src/features/demo/README.md` and `../docs/phase_9_mock_uat_demo_release_plan.md` for safety rules, test coverage, and the distinction between a staff walkthrough and production sign-off.

## Phase 10 stakeholder review and design freeze

`/demo/acceptance` inventories all 71 admin route pages, records controlled-change decisions, exposes known mock limitations, and provides a browser-local stakeholder sign-off rehearsal. Four Phase 10 Playwright baselines guard the `/demo` and `/demo/acceptance` main content on desktop and mobile.

The acceptance screen does not persist approval or enable production features. See `../docs/phase_10_stakeholder_review_design_freeze_plan.md` for the freeze policy and evidence requirements.

## Phase 11 preview packaging and handoff

Phase 11 packages the Phase 10 mock baseline as a versioned, reproducible local preview with isolated fictional data, a sanitized release manifest, checksums, artifact smoke tests, a review runbook, release notes, and a feedback template. `/demo/release` makes release identity, verification status, routes, roles, and limitations visible.

Build and verify a local preview with:

```powershell
npm run preview:init
npm run preview:verify
npm run preview:package
npm run preview:smoke
```

Generated packages are written under the git-ignored `artifacts/preview/` boundary. Deployment remains outside this phase and requires separate approval for access, persistence, retention, expiry, monitoring, and takedown. See `../docs/phase_11_preview_packaging_handoff_plan.md` and `../docs/admin_panel_preview_runbook.md`.

## Phase 7 production integration — planned

Phase 7 will replace mock identity and file-backed repositories with validated live adapters, a transactional production API/database, durable workers, provider integrations, controlled migration, observability, recovery, UAT, launch, and hypercare. It is deliberately not implemented until hosting, identity, OpenAPI/data contracts, provider sandboxes, privacy rules, and operational ownership are approved.

See `../docs/phase_7_live_backend_launch_plan.md` for the decision gates, implementation waves, compatibility rules, test strategy, blockers, and production definition of done.

## Comment and documentation policy

Document exported contracts, business invariants, units, failure behavior, and architectural reasons. Avoid comments that restate obvious code. Search for `API-TODO` to find provisional integration assumptions. Structural changes must update `../docs/admin_panel_code_map.md`; scope changes update `../docs/admin_panel_implementation_plan.md`.

## Mock limitations

Catalog mutations persist locally, but selected product binaries are not copied: only validated metadata and safe placeholder URLs are stored. Live sessions, production persistence, permanent media, courier/payment calls, messaging, production Excel/PDF reports, scheduled delivery, accounting, payroll payment, and immutable audit retention require future backend/provider contracts.
