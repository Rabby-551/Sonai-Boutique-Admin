# Customers and loyalty

Customer profiles are durable relationship records. Orders retain immutable contact snapshots and reference a `customerId`; profile edits therefore never rewrite historical orders.

`CustomerRepository` is the only page/action data boundary. The file adapter normalizes Bangladesh phones, rejects duplicate phone/email identities, preserves archived records, and derives spend and loyalty views from operational records. The HTTP adapter keeps the same results and error semantics.

Loyalty is an append-only ledger. Enrolled customers earn points once when an order is delivered, using the earning-rate snapshot active at that time. Received returns create capped reversals. Manual adjustments require `loyalty.adjust`, a non-zero integer value, and a reason; balance cannot become negative.

API-TODO: confirm production customer identity, consent, merge, privacy export/deletion, and loyalty configuration contracts.
