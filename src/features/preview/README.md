# Preview Feature

The preview feature exposes sanitized release identity and reviewer guidance for the local mock package. It does not own operational data or call a backend.

## Boundaries

- `schemas/preview.ts` validates the browser-safe manifest.
- `data/release-manifest.ts` maps server-only environment values to safe display data.
- `server/queries.ts` authenticates the reviewer before returning the manifest.
- Components display identity, gates, routes, limitations, and handoff steps.
- Packaging and checksum generation remain operator scripts under `scripts/`.

Do not read process environment, Git metadata, or filesystem paths from Client Components. Preview mode requires mock data and an isolated `MOCK_DATA_DIR`; it never authorizes a live provider or hosted deployment.
