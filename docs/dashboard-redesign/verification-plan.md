# Dashboard redesign verification plan

## Automated gates

- `npm run format:check`
- `npm run check:utf8`
- `npm run check:size`
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run test:e2e`
- `npm run build`
- Final combined gate: `npm run quality:release`

## Focused behavior

- Permission-filtered navigation, active matching and grouped collapse.
- Desktop collapse and mobile drawer focus, Escape, backdrop and restoration.
- Navigation search keyboard behavior and route results.
- URL-backed filters, back navigation and existing mutations.
- Loading, empty, no-result, permission, error and success feedback.
- Dashboard chart tooltip plus text/table alternative.
- Reduced-motion behavior.

## Viewports

- 360 x 800 and 390 x 844 mobile.
- 768 x 1024 tablet.
- 1024 x 768 small laptop.
- 1440 x 900 desktop.
- 1920 x 1080 wide desktop.

Acceptance requires no clipped top bar, permanent mobile rail, full-page horizontal overflow, hydration warnings or layout-shifting entrance motion. Visual baselines cover dashboard, product list, order detail, product form and reports; route smoke coverage reaches all seventy-one pages with deterministic fixture identifiers.

## Final result — 2026-07-31

- `npm run quality:release` passed the environment, UTF-8 (502 files), source-size (78-line route / 172-line component maxima), formatting, lint, strict TypeScript, 73-test Vitest, and optimized production-build gates.
- `npm run test:e2e` passed 72 applicable checks with 20 intentional device/workflow skips in the 92-test desktop/mobile matrix.
- The dedicated route registry traversed all 71 admin pages without a server failure.
- Ten deterministic desktop/mobile archetype baselines pass for dashboard, products, product form, order detail, and reports; the existing demo, acceptance, and release baselines were refreshed and pass.
- Focused checks pass for active/permission navigation, collapse, multi-keyword search, modal-drawer focus restoration, 44 px mobile controls, reduced motion, mobile record cards, chart rendering, and zero full-page horizontal overflow.
