"use client";

import { useId, useState } from "react";
import type { AdminLocale } from "@/lib/i18n/admin-locale";
import { dashboardCopy } from "../dashboard-copy";
import type { DashboardWorkspace } from "../schemas/dashboard-schema";
import {
  PremiumCampaigns,
  PremiumCustomers,
} from "./premium-customer-campaign-panels";
import {
  PremiumChannels,
  PremiumFulfillment,
} from "./premium-fulfillment-channels";
import { PremiumMerchandise } from "./premium-growth-panels";
import { PremiumInventory } from "./premium-inventory";
import { PremiumAlerts, PremiumTargets } from "./premium-targets-alerts";

type Props = { data: DashboardWorkspace; locale: AdminLocale };
type OperationsView =
  "attention" | "targets" | "fulfilment" | "channels" | "inventory";
type GrowthView = "merchandising" | "customers" | "campaigns";

function Tabs<T extends string>({
  active,
  labels,
  onChange,
}: {
  active: T;
  labels: readonly { id: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="premium-tabs compact-insight-tabs" role="tablist">
      {labels.map((item) => (
        <button
          aria-selected={active === item.id}
          key={item.id}
          onClick={() => onChange(item.id)}
          role="tab"
          type="button"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function CompactOperationsInsights({ data, locale }: Props) {
  const copy = dashboardCopy(locale);
  const titleId = useId();
  const [active, setActive] = useState<OperationsView>("attention");
  const labels = [
    { id: "attention", label: copy.attention },
    { id: "targets", label: copy.targets },
    { id: "fulfilment", label: copy.fulfilment },
    { id: "channels", label: copy.channels },
    { id: "inventory", label: copy.inventory },
  ] as const;
  return (
    <section
      className="premium-panel compact-insight-card"
      aria-labelledby={titleId}
    >
      <div className="premium-section-heading compact-insight-heading">
        <div>
          <span className="eyebrow">{copy.intelligence}</span>
          <h2 id={titleId}>{locale === "bn" ? "অপারেশনস" : "Operations"}</h2>
        </div>
      </div>
      <Tabs active={active} labels={labels} onChange={setActive} />
      <div className="compact-tab-panel" role="tabpanel">
        {active === "attention" && (
          <PremiumAlerts data={data} locale={locale} />
        )}
        {active === "targets" && <PremiumTargets data={data} locale={locale} />}
        {active === "fulfilment" && (
          <PremiumFulfillment data={data} locale={locale} />
        )}
        {active === "channels" && (
          <PremiumChannels data={data} locale={locale} />
        )}
        {active === "inventory" && (
          <PremiumInventory panel={data.inventory} locale={locale} />
        )}
      </div>
    </section>
  );
}

export function CompactGrowthInsights({ data, locale }: Props) {
  const copy = dashboardCopy(locale);
  const titleId = useId();
  const [active, setActive] = useState<GrowthView>("merchandising");
  const labels = [
    { id: "merchandising", label: copy.merchandising },
    { id: "customers", label: copy.customers },
    { id: "campaigns", label: copy.campaigns },
  ] as const;
  return (
    <section
      className="premium-panel compact-insight-card"
      aria-labelledby={titleId}
    >
      <div className="premium-section-heading compact-insight-heading">
        <div>
          <span className="eyebrow">{copy.growth}</span>
          <h2 id={titleId}>{locale === "bn" ? "প্রবৃদ্ধি" : "Growth"}</h2>
        </div>
      </div>
      <Tabs active={active} labels={labels} onChange={setActive} />
      <div className="compact-tab-panel" role="tabpanel">
        {active === "merchandising" && (
          <PremiumMerchandise data={data} locale={locale} />
        )}
        {active === "customers" && (
          <PremiumCustomers data={data} locale={locale} />
        )}
        {active === "campaigns" && (
          <PremiumCampaigns data={data} locale={locale} />
        )}
      </div>
    </section>
  );
}
