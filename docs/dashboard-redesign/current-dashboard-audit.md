# Current dashboard audit

## Baseline

- Next.js 16.2.12, React 19.2.8, strict TypeScript and App Router.
- Seventy-one admin route pages across sixteen feature boundaries.
- Server Components own route composition and reads; fifty-three narrow client components own forms and mutations.
- Typed repositories select file-backed mock or validated HTTP adapters without changing presentation code.
- Styling is a single global CSS file with the correct cream, charcoal, gold, teal and brown palette but limited semantic tokens.
- Recharts is installed but the main dashboard still renders a hand-built bar chart. No motion dependency exists.

## Strengths to preserve

- Mature permissions, validation, Server Actions and mock/API boundaries.
- Consistent `PageHeader`, cards, filters, tables, status badges, loading/error boundaries and business formatting.
- Deterministic mock workflows with substantial Vitest and Playwright coverage.
- Clear neutral-luxury direction and accessibility guardrails.

## Primary problems

- The sidebar has no active-route treatment, collapse state, search or mobile drawer.
- At 390 px the permanent 76 px rail leaves roughly 314 px for content and clips top-bar controls.
- Thirty navigation destinations appear in one long scroll without expandable groups.
- Route layouts repeat low-level card/table/form CSS rather than composing shared design-system primitives.
- Only four route-level loading files cover seventy-one pages; loading feedback is generic rather than route-shaped.
- Global CSS has grown past 1,600 lines, increasing regression risk.
- Motion is limited to isolated CSS hover transitions; route, chart, skeleton and drawer motion is not coordinated.

## Redesign boundary

The redesign changes composition, visual hierarchy, navigation and feedback. It does not change domain schemas, repositories, URLs, query parameters, permissions, Server Actions, status transitions or mock persistence.
