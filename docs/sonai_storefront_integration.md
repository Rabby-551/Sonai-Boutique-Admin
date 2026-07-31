# Sonai storefront and dashboard integration

## Implemented shared boundary

| Area           | Dashboard behavior                                                                                            | Shared source                                                     |
| -------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Brand          | Sonai wine, cream, brass, typography, transparent PNG logo and campaign artwork                               | Storefront brand assets copied into the dashboard public boundary |
| Authentication | Cookie-based Supabase SSR, session refresh in `proxy.ts`, email/password sign-in and active admin-role lookup | Supabase Auth and `public.admin_roles`                            |
| Dashboard      | Website order revenue, order counts, recent orders, low-stock alerts and online fulfillment                   | `orders`, `order_items`, `inventory`, `product_variants`          |
| Catalog        | Product/category reads and product create/update/archive RPCs                                                 | Existing storefront catalog tables                                |
| Inventory      | Online balances, thresholds, movements and audited adjustments                                                | `inventory`, `inventory_movements`                                |
| Orders         | Website-order lookup, manual capture, payment/status/note transitions                                         | Existing checkout/order/payment/shipment tables plus admin RPCs   |
| Website        | English and Bangla homepage hero/section editing with draft/published state and optimistic versions           | `site_content`; the storefront reads published rows only          |
| Locations      | Rupnagar, Mirpur Shopping Center and Online IDs align with storefront data                                    | `store_locations` plus the virtual online operations location     |

## Runtime modes

- `COMMERCE_SOURCE=mock` retains deterministic file-backed demonstrations.
- `COMMERCE_SOURCE=supabase` enables shared catalog, online inventory, order, dashboard and website-content adapters.
- `AUTH_SOURCE=supabase` is required for live writes; the publishable key is user-scoped through RLS.
- `DATA_SOURCE` continues to select the wider legacy mock/API modules that have not moved to shared commerce tables.

## Deliberate launch boundaries

Branch-specific stock balances, transfers and physical counts need a normalized location-balance migration before live writes are enabled. Returns/refunds need provider and accounting rules. Procurement, payroll, campaigns, loyalty, complaints, messaging, couriers and payment-provider operations remain mock or adapter designs until their owners, credentials, webhooks and retention rules are approved. The live repositories return an explicit unsupported error for unsafe operations instead of writing partial business state.

## Database rollout

Apply `Sonai-Boutique-Website/supabase/migrations/20260731181432_admin_storefront_unification.sql` through the normal Supabase migration workflow. The migration adds explicit grants and RLS, version columns, audited admin RPCs, inventory movement records and bilingual site content. Create the first owner in Supabase Auth, then add an active `admin_roles` row. Never expose a service-role key to either browser application.

## Verification checklist

1. Run typecheck, lint, unit tests and production builds in both repositories.
2. Apply the migration to a staging Supabase project and run database lint there.
3. Sign in as Owner and Manager; verify Cashier and Support cannot access `/website`.
4. Publish English and Bangla homepage changes and confirm only published versions appear.
5. Create/update a product, place a storefront order, transition it in admin and reconcile stock and totals.
6. Test rollback, backup, payment/courier sandbox behavior and audit retention before production cutover.
