# Inventory feature

Inventory is the only writable stock source of truth. Product `stock` values are hydrated read projections for catalog compatibility; catalog forms cannot write quantities.

## Boundaries and invariants

- `schemas/inventory.ts` owns stable locations, balances, movements, transfers and counts.
- `data/repository.ts` is the adapter-independent contract. `repository-factory.ts` selects file or HTTP infrastructure only on the server.
- `FileInventoryRepository` changes balances only inside `ShonaiFileStore.transaction()`. Every on-hand/reserved mutation also creates a movement.
- `available = onHand - reserved`; neither value may be negative and reserved cannot exceed on-hand.
- Dispatch deducts source stock; receipt adds destination stock. Count approval applies all variance movements atomically.
- High-risk commands use optimistic versions and idempotency keys. Stale forms return a conflict instead of overwriting newer work.

## Adding a command

Add the Zod/domain input, extend `InventoryRepository`, implement both adapters, authorize and validate in `server/actions.ts`, then compose a focused component. Never import `.mock-data`, fixtures or an API endpoint from UI code.

`API-TODO`: the HTTP paths and envelope remain provisional until the production inventory contract is supplied. Purchase-order matching belongs to Phase 4.
