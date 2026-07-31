# Motion system specification

## Tokens

- Immediate: 90 ms.
- Fast: 160 ms.
- Standard: 220 ms.
- Page: 300 ms.
- Drawer: 280 ms.
- Modal: 220 ms.
- Chart: 600 ms.
- Stagger: 45 ms, maximum six items.
- Ease out: `cubic-bezier(0.22, 1, 0.36, 1)`.
- Exit: `cubic-bezier(0.4, 0, 1, 1)`.

## Patterns

- Shell persists between routes.
- Page title/toolbar precede summary and main content.
- Entrances use opacity and 8-12 px vertical translation; optional scale is limited to 0.985-1.
- Buttons use small press-scale feedback; cards lift no more than 2 px.
- Tables animate as a surface, never row-by-row for large result sets.
- Recharts draws only on initial route entry, not ordinary filter rerenders.
- Skeletons fade to content without changing dimensions.
- Navigation never waits for exit animation.

## Reduced motion

`MotionConfig reducedMotion="user"` disables transform/layout motion. CSS media queries disable smooth scrolling and long transitions. State clarity remains through focus, color, text and short opacity changes.
