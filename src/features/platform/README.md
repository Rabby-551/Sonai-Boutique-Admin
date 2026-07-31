# Platform feature

Phase 7's `platform` feature is a read-only operational design backed by deterministic fictional data. It demonstrates service health, provider-adapter visibility, migration rehearsals and go/no-go evidence without calling a real identity, API, database, payment, courier, messaging, media or backup provider.

## Structure

- `schemas/platform.ts`: runtime-validated operational read models.
- `data/repository.ts`: adapter-neutral read contract.
- `data/mock-repository.ts`: stable fictional staging signals.
- `server/queries.ts`: server-side `settings.view` authorization.
- `components/`: focused metrics, health, provider, migration and release-gate views.
- Routes: `/platform`, `/platform/migrations`, `/platform/release-readiness`.

The mock repository returns a structured clone so components cannot mutate shared fixtures. Production implementation must replace it behind the repository contract and preserve safe status/error semantics.

API-TODO: connect live session, API health, queue, provider, telemetry, backup and migration evidence only after the approved Phase 7 decision gates are supplied.
