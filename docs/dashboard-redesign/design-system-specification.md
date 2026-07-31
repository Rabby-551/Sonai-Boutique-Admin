# Design system specification

## Foundations

- Semantic colors: canvas, surface, surface-muted, surface-elevated, foreground, foreground-muted, border, border-strong, primary, primary-hover, accent, focus, success, warning, destructive and information.
- Type: serif display headings; system sans UI; tabular numerals for metrics and money.
- Spacing: 4 px micro and an 8 px base rhythm.
- Radius: 8 px controls, 12 px standard cards, 16 px featured surfaces, full pill badges.
- Elevation: border-only base cards, soft shadow for interactive/elevated surfaces, stronger shadow only for overlays.
- Targets: minimum 40 x 40 px; visible 3 px focus ring.
- Breakpoints: 520, 800, 1100 and 1440 px with explicit 360 px acceptance.

## Shared components

- Layout: admin shell, sidebar group/item, top bar, mobile drawer, content container, page header, breadcrumbs, action bar and responsive grid.
- Display: base card, KPI card, chart card, summary panel, status badge, progress, timeline and activity item.
- Data: filter bar, search field, table shell, pagination, mobile record card and export action.
- Interactive: button, icon button, native select, segmented control, tooltip, native-dialog modal/drawer and confirmation.
- State: page skeleton, section skeleton, loading panel, empty, no-result, error, permission and success states.

Native controls remain the default. No additional headless-component dependency is planned.
