# Component reuse map

## Reuse unchanged

- Domain schemas, repository interfaces/adapters, server queries/actions, mock-store, permissions, formatting and observability.
- Feature forms and operational controls unless a wrapper is required for layout.

## Refactor in place

- `AdminShell`, `Sidebar`, `Topbar`, `PageHeader`, `StatusBadge` and global layout/card/table/form styles.
- Dashboard KPI, chart, attention, fulfillment and recent-order components.
- Existing feature tables and filters to consume shared shells without moving data logic.

## Add

- Client shell controller, active navigation item, command search, mobile drawer and page transition wrapper.
- Motion provider/presets.
- Base surface, KPI card, filter/action bar, responsive table shell, mobile record card and shared state/skeleton components.

## Replace

- Replace the dashboard's CSS bar visualization with Recharts while retaining its textual summary.
- Replace the permanent mobile icon rail with a modal drawer.
- Replace visible `Shonai` shell copy with `Sonai`; do not rename internal code identifiers.

## Remove

No source module, route or workflow is removed. Legacy CSS aliases may be removed only after every dependent route and visual regression test has migrated.
