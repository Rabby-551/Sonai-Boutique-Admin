# Point of sale

The POS feature is the mock-first transactional boundary for physical-store registers. It owns register shifts, branch catalog availability, receipts, split tenders, approvals, returns, exchanges and POS configuration.

## Routes

- `/pos` runs the cashier register.
- `/pos/transactions` searches receipts and prepares returns or exchanges.
- `/pos/shifts` opens or closes cashier shifts and records cash variance.
- `/pos/approvals` is restricted to Manager and Owner approval work.
- `/pos/receipts/[saleId]` renders an 80 mm receipt with browser PDF printing.
- `/settings/pos` configures physical registers and payment providers.

## Data and API boundary

`PosRepository` is implemented by the serialized v5 file store and by the future HTTP adapter. `DATA_SOURCE=api` expects `/pos/bootstrap`, `/pos/shifts`, `/pos/sales`, `/pos/customers`, `/pos/approvals`, `/pos/returns`, `/pos/exchanges`, `/pos/registers` and `/pos/payment-providers` endpoints with the same domain semantics.

All high-risk commands are server-authorized, versioned or idempotent. Money is integer poisha, timestamps are UTC, and display uses Asia/Dhaka. The mock records external terminal/MFS references but never collects card number, CVV, PIN, OTP or wallet credentials.

## Live integration boundary

No Supabase migration is part of this phase. A live implementation must execute sale, tender, stock movement, return and exchange changes transactionally; enforce branch scope at the API/RLS layer; use explicit Data API grants plus RLS; and run database advisors before release.
