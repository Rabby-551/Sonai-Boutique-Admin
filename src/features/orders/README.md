# Orders and fulfillment feature

Orders snapshot current catalog prices and use the inventory ledger for assignment, reservation, shipment, cancellation and received returns.

## Lifecycle rules

- Placed orders do not reserve. Confirmation validates a single complete location and reserves every line atomically.
- Picking and packing are status-only. Shipment reduces on-hand and reserved together and creates a fictional courier record.
- Cancellation is permitted only before shipment and releases reservations when present.
- Returns are separate records. Only delivered quantities may be returned; receiving an approved return restores stock and records a fictional refund.
- Non-COD orders must be paid before shipment. COD becomes paid on delivery.

## Integration boundary

Pages and components call authenticated server queries/actions. Those call `OrderRepository`; adapter selection occurs in `repository-factory.ts`. `HttpOrderRepository` preserves the file adapter's result/error contract.

`API-TODO`: payment, courier, notification and external-ingestion paths and DTO envelopes are provisional. Mock references are fictional and no card/mobile-financial credentials are persisted.
