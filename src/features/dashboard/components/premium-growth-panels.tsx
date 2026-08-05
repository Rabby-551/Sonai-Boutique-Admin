"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/formatting";
import type { AdminLocale } from "@/lib/i18n/admin-locale";
import { dashboardCopy } from "../dashboard-copy";
import type { DashboardWorkspace } from "../schemas/dashboard-schema";
import { DashboardPanelState } from "./dashboard-panel-state";
import { PremiumCustomerCampaignPanels } from "./premium-customer-campaign-panels";

type Props = { data: DashboardWorkspace; locale: AdminLocale };
type Kind = "product" | "category" | "collection" | "branch";

export function PremiumMerchandise({ data, locale }: Props) {
  const copy = dashboardCopy(locale);
  const [kind, setKind] = useState<Kind>("product");
  const panel = data.merchandise;
  return (
    <section className="premium-panel premium-table-panel">
      <div className="premium-section-heading">
        <h2>{copy.merchandising}</h2>
      </div>
      {panel.status === "unavailable" ? (
        <DashboardPanelState locale={locale} message={panel.message} />
      ) : (
        <>
          <div className="premium-tabs" role="tablist">
            {(["product", "category", "collection", "branch"] as const).map(
              (item) => (
                <button
                  aria-selected={kind === item}
                  key={item}
                  onClick={() => setKind(item)}
                  role="tab"
                  type="button"
                >
                  {copy[item]}
                </button>
              ),
            )}
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>{copy.units}</th>
                  <th>{copy.revenue}</th>
                  <th>{copy.margin}</th>
                  <th>{copy.stock}</th>
                  <th>{copy.returns}</th>
                  <th>{copy.growth}</th>
                </tr>
              </thead>
              <tbody>
                {panel.data.entries
                  .filter((entry) => entry.kind === kind)
                  .map((entry) => (
                    <tr key={entry.id}>
                      <td>
                        <strong>{entry.name}</strong>
                      </td>
                      <td>{entry.units}</td>
                      <td>{formatMoney(entry.revenueMinor, locale)}</td>
                      <td>{entry.marginPercent}%</td>
                      <td>{entry.stock}</td>
                      <td>{entry.returnRate}%</td>
                      <td
                        className={
                          entry.growthPercent >= 0 ? "positive" : "negative"
                        }
                      >
                        {entry.growthPercent > 0 ? "+" : ""}
                        {entry.growthPercent}%
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

export function PremiumGrowthPanels(props: Props) {
  return (
    <>
      <PremiumMerchandise {...props} />
      <PremiumCustomerCampaignPanels {...props} />
    </>
  );
}
