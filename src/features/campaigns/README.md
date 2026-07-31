# Campaigns

Campaigns own scheduling, scope validation, non-stacking percentage rules, lifecycle transitions, attribution, and ROI summaries. `calculateCampaignDiscount` selects the largest eligible discount; priority and stable ID only break ties.

Pages and components never read fixtures. Server Actions authorize `campaigns.manage`, validate input, call the selected repository, and revalidate campaign, report, and order-entry views.

API-TODO: confirm storefront publication, promotion snapshots, usage counters, budget enforcement, conflict policy, and production campaign analytics.
