# Catalog feature

Catalog owns product, variant, image-metadata, category, CSV-import, and barcode workflows for FR-152–154 and FR-204–209.

## Data flow

Small App Router pages call permission-gated queries. Client forms submit to Server Actions, which validate `FormData` with Zod, enforce `catalog.manage`, call `CatalogRepository`, and revalidate affected routes. Components never import fixtures or access the future backend directly.

`repository-factory.ts` selects `FileCatalogRepository` or `HttpCatalogRepository`. The file adapter uses the catalog section of `.mock-data/shonai.json`; a legacy `.mock-data/catalog.json` is migrated without deletion. Unified transactions replace the store atomically. Optimistic `version` values prevent silent overwrites. SKU and barcode uniqueness is enforced both inside a product and across the store.

## Mock and API boundaries

- Money uses integer poisha in schemas/repositories; forms display BDT.
- Image selection accepts JPEG, PNG, or WebP up to 5 MB and persists metadata/placeholder paths only.
- Code 128 output is isolated in `/api/barcodes/[value]`; EAN-13 is a future adapter option.
- CSV parsing is isolated in `utils/csv.ts`; only server-validated rows reach the repository.
- `API-TODO`: permanent media upload, production persistence, canonical error envelope, and external barcode requirements need backend contracts.

## Tests

Run `npm test` for schema, CSV, repository, permission, and component coverage. Run `npm run test:e2e` for dashboard filtering, product lifecycle, CSV import, and barcode rendering.
