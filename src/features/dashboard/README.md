# Dashboard

The dashboard owns aggregate business summaries. `DashboardQuery` validates URL-backed branch, channel, and range filters. Values stay in integer BDT minor units until display formatting.

`server/queries.ts` authorizes `dashboard.view` and requests the repository contract. The mock repository derives deterministic KPIs, channel revenue, trend points, alerts, fulfillment totals, and recent orders. Replace it with a validated HTTP adapter when the aggregate API contract is supplied.

Routes compose focused KPI, chart, attention, fulfillment, and recent-order components. Charts always include a textual accessible summary; do not replace it with a visual-only canvas.
