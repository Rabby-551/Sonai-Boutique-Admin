# Live dashboard data requirements

The premium dashboard intentionally leaves unsupported Supabase panels unavailable. A future backend expansion should add versioned aggregates rather than infer business facts in the UI.

## Required source fields

- Order lines: merchandise subtotal after line/order discounts, refunded merchandise amount, delivery fee, payment outcome, placed/cancelled/terminal timestamps, channel, branch and campaign attribution identifiers.
- Inventory: snapshotted unit cost per receipt or valuation layer, on-hand quantity by location, ageing bucket, reorder policy, transfer history and sell-through history.
- Product finance: order-line COGS snapshot and return quantity/value; current catalog price is not a cost substitute.
- Geography: normalized district code produced upstream. Raw delivery addresses and coordinates must not enter dashboard payloads.
- Targets: target type, scope, period, value, currency/unit, owner, revision and effective timestamps.
- Customers: privacy-safe cohort identifiers and loyalty participation aggregates; no contact/address fields are required.
- Campaigns: attribution window/model, source link/channel, spend, redemption, attributed revenue and return/refund value.
- Activity: sanitized event type, entity identifier, action, actor display label, timestamp and permission-safe destination.

## Aggregation contracts

- Aggregate in Asia/Dhaka boundaries and return the current and immediately preceding equal-length periods.
- Revenue excludes delivery fees, drafts, failed payments and cancelled orders and subtracts merchandise refunds.
- Gross profit uses snapshotted order-line COGS. Inventory value uses on-hand quantity multiplied by unit cost.
- District output must suppress groups below five orders into `otherDistrictOrders` and report missing district codes separately.
- Every panel returns `ready`, `empty` or `unavailable`, plus source and update timestamp. Unexpected failures remain errors.
- Materialized views or server-side functions should serve chart granularity and one-year ranges; the browser must not download raw transactional history.

No schema migration or provider integration is part of the dashboard implementation.
