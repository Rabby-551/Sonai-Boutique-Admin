# Demo and Staff UAT

Phase 9 provides a mock-only control center for repeatable staff walkthroughs. `schemas/demo.ts` validates scenario, role and checklist content; `data/mock-repository.ts` supplies deterministic guidance; `server/queries.ts` attaches the authenticated mock role; and focused components render the review experience.

## Safe reset

The reset action is intentionally narrow. It requires:

- `DATA_SOURCE=mock`
- `DEMO_RESET_ENABLED=true`
- the Owner role
- the exact confirmation phrase `RESET DEMO`

The server restores `createShonaiStore()` through `ShonaiFileStore`; it does not delete directories, call providers or operate in API mode. Keep the flag disabled outside controlled demonstrations.

## UAT boundary

Checklist changes live only in React state. They help a reviewer track the current walkthrough but are not durable acceptance evidence. Real sign-off, production analytics and external integrations remain separate work.

## Design freeze

`/demo/acceptance` uses the same validated mock repository boundary to inventory 71 route pages, including the Phase 11 release handoff, record frozen/controlled/external decisions, display four visual baselines, list limitations, and rehearse five stakeholder checks. Screenshot sources live beside `e2e/phase-ten-visual.spec.ts` and cover the demo and acceptance main content for desktop and mobile.

Changes to frozen routes, permissions, repository results, money/date rules, or adapter boundaries must update the implementation plan, code map, traceability, and regression coverage together. Browser-local selections never represent durable approval.
