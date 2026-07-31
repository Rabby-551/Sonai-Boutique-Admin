# Reference video analysis

## Source

The supplied 22.467-second recording was inspected from the initial blank canvas through Dashboard, Deals kanban, Companies table and Report builder states.

## Transferable patterns

- A persistent white application shell sits inside a soft neutral canvas.
- The left sidebar and top bar remain fixed while only the main workspace changes.
- Route changes reveal page title and toolbars first, then primary content, then secondary detail.
- Cards use one-pixel borders, restrained 10-14 px radii and low-contrast shadows.
- Dashboard metrics are compact; the primary chart receives the strongest visual weight.
- List screens use a consistent filter/sort/action toolbar and dense but calm tables.
- The report screen uses a chart/table workspace with a configuration rail.
- Active navigation uses a soft filled pill; hover feedback is subtle and immediate.

## Motion estimate

- Feedback: 80-100 ms.
- Dropdown and hover: 140-180 ms.
- Component entrance: 200-240 ms.
- Page reveal: 280-320 ms with 8-12 px translation.
- Small-group stagger: 35-50 ms.
- Drawer: 260-300 ms; modal: 200-240 ms.
- Chart drawing: 500-650 ms.

## Explicit exclusions

- Do not copy the blue palette, Brisk/Mesh branding, CRM content, AI actions, share/import controls or storage upsell.
- Do not add Deals, Companies, Notes, Emails or a Kanban mode to Sonai unless a real Sonai workflow already requires it.
- Do not intentionally delay navigation to reproduce the video's blank canvas; use shaped skeletons only while data is actually pending.
