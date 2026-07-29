# Shonai Boutique Admin Panel

A mock-backed Next.js App Router frontend for Shonai's branch, online, inventory, fulfillment, procurement, reporting, and staff operations.

## Run locally

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`. `/login` demonstrates the future authentication boundary; the mock session opens the dashboard as the configured `MOCK_ROLE`.

## Quality commands

```powershell
npm run format:check
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
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

Mock catalog writes persist in `.mock-data/catalog.json`, which is git-ignored. Set `MOCK_DATA_DIR` to isolate a test store. Delete only that file when you intentionally want deterministic fixtures restored on the next request.

## Comment and documentation policy

Document exported contracts, business invariants, units, failure behavior, and architectural reasons. Avoid comments that restate obvious code. Search for `API-TODO` to find provisional integration assumptions. Structural changes must update `../docs/admin_panel_code_map.md`; scope changes update `../docs/admin_panel_implementation_plan.md`.

## Mock limitations

Catalog mutations persist locally, but selected product binaries are not copied: only validated metadata and safe placeholder URLs are stored. Live sessions, production persistence, permanent media, courier/payment calls, messaging, and exports require future backend/provider contracts.
