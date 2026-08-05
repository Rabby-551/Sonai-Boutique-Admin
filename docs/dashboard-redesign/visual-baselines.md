# Premium dashboard visual baselines

Verified on 2026-08-05 against the local production build in mock mode.

## Locked upper section

- Desktop 1920px: Operations Overview heading, FR-182 eyebrow and original Sonai campaign artwork retain their cream, maroon and gold composition.
- Mobile 360px: the heading remains first, the campaign artwork remains proportional and legible, and the copy stays within the rounded banner.

## Expanded workspace

- Desktop 1920px: six KPIs fit one row; intelligence panels use balanced two-column groups; the page has zero horizontal overflow.
- Mobile 360px: filters use the right-side drawer, KPIs and operational panels stack, targets use two columns, the district map precedes its ranked table, and orders render labeled record cards.
- English and Bangla both render without horizontal overflow. Bangla server content uses Hind Siliguri.

The Playwright dashboard visual baseline is maintained by `e2e/dashboard-redesign-visual.spec.ts`; the focused premium interactions are in `e2e/dashboard-premium.spec.ts`.
