# Procurement

Suppliers own commercial contacts and variant mappings. Purchase orders snapshot supplier SKU, unit cost, and ordered quantity so later catalog changes do not rewrite procurement history.

Every PO is approved before supplier confirmation. Commercial lines freeze after submission. Receiving is strict: partial receipts are allowed, over-receipt is rejected, and only accepted quantities enter inventory. The file repository posts accepted quantities and `purchase_receipt` movements in the same `ShonaiFileStore.transaction()` call.

Damaged and rejected units remain receipt history but never become sellable stock. Procurement costs do not rewrite catalog cost or inventory valuation in Phase 4.

API-TODO: confirm supplier messaging, PO document delivery, invoice/AP integration, cost valuation, shipment webhooks, and production receiving contracts.
