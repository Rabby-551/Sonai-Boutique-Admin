import type { AdminLocale } from "@/lib/i18n/admin-locale";
import type { DashboardWorkspace } from "../schemas/dashboard-schema";
import { PremiumFulfillmentChannels } from "./premium-fulfillment-channels";
import { PremiumInventory } from "./premium-inventory";
import { PremiumTargetsAlerts } from "./premium-targets-alerts";

export function PremiumOperationsPanels({
  data,
  locale,
}: {
  data: DashboardWorkspace;
  locale: AdminLocale;
}) {
  return (
    <>
      <PremiumTargetsAlerts data={data} locale={locale} />
      <PremiumFulfillmentChannels data={data} locale={locale} />
      <PremiumInventory panel={data.inventory} locale={locale} />
    </>
  );
}
