# Optimization feature

Phase 8's `optimization` feature composes the mock design for governed insights, reorder review, supplier scorecards, segments, rewards, privacy, finance reconciliation, report schedules, channels, safe automation, complaint SLA and localization readiness.

## Architecture

- `schemas/optimization.ts`: typed, runtime-validated view contracts.
- `data/repository.ts`: adapter-neutral workspace contract.
- `data/mock-repository.ts`: deterministic fictional history, recommendations and provider states.
- `server/queries.ts`: module-appropriate server permission checks.
- `components/`: focused 37–80 line presentation units with semantic tables and accessible forecast summaries.

Routes never import fixtures. They authorize through server queries and consume the repository result. Recommendations are advisory: accepted mock labels do not create POs, reserve points, alter payments, contact customers, ingest external orders, dispatch jobs or change translations.

## Production boundaries

API-TODO: split the design into the planned `insights`, `rewards`, `privacy`, `finance`, `channels` and `automation` adapters when their production APIs exist. Analytical projections must never mutate transactional state directly; existing catalog, inventory, orders, customers, procurement, complaints and reporting commands remain authoritative.

API-TODO: Phase 8 production activation still requires reconciled Phase 7 data, metric ownership, model/rule versioning, backtesting, provider contracts, privacy/accounting policies, professional Bengali review and approved offline-device controls.
