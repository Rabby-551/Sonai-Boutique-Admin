"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/formatting";
import type { AdminLocale } from "@/lib/i18n/admin-locale";
import { dashboardCopy } from "../dashboard-copy";
import type { DashboardWorkspace } from "../schemas/dashboard-schema";
import { DashboardPanelState } from "./dashboard-panel-state";

type Panel = DashboardWorkspace["geography"];
type District = Extract<
  Panel,
  { status: "ready" }
>["data"]["districts"][number];

const outline =
  "M47 4 C57 7 60 18 66 22 C72 27 68 35 73 41 C80 48 75 56 79 65 C82 75 74 82 70 91 L62 86 L57 95 L51 84 L44 91 L39 80 L31 82 L33 69 L23 61 L27 49 L20 38 L29 29 L31 16 L40 14 Z";

export function BangladeshDashboardMap({
  panel,
  locale,
}: {
  panel: Panel;
  locale: AdminLocale;
}) {
  const copy = dashboardCopy(locale);
  const [selected, setSelected] = useState<District | null>(
    panel.status === "unavailable" ? null : (panel.data.districts[0] ?? null),
  );
  if (panel.status === "unavailable")
    return (
      <section className="premium-panel">
        <div className="premium-section-heading">
          <h2>{copy.geography}</h2>
        </div>
        <DashboardPanelState locale={locale} message={panel.message} />
      </section>
    );
  const top = [...panel.data.districts]
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 5);
  const max = Math.max(
    ...panel.data.districts.map((district) => district.orders),
  );
  return (
    <section
      className="premium-panel premium-map-panel"
      aria-labelledby="bangladesh-map-title"
    >
      <div className="premium-section-heading">
        <div>
          <h2 id="bangladesh-map-title">{copy.geography}</h2>
          <p>{copy.geographyHelp}</p>
        </div>
      </div>
      <div className="premium-map-layout">
        <div className="premium-map-canvas">
          <svg
            viewBox="0 0 100 100"
            role="img"
            aria-labelledby="map-svg-title map-svg-description"
          >
            <title id="map-svg-title">{copy.geography}</title>
            <desc id="map-svg-description">{copy.geographyHelp}</desc>
            <path className="bangladesh-outline" d={outline} />
            {panel.data.districts.map((district) => {
              const radius = 1.8 + (district.orders / max) * 3.2;
              return (
                <circle
                  aria-label={`${locale === "bn" ? district.nameBn : district.nameEn}: ${district.orders} ${copy.orders}`}
                  className={
                    selected?.id === district.id
                      ? "district-marker selected"
                      : "district-marker"
                  }
                  cx={district.x}
                  cy={district.y}
                  key={district.id}
                  onClick={() => setSelected(district)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ")
                      setSelected(district);
                  }}
                  r={radius}
                  role="button"
                  tabIndex={0}
                />
              );
            })}
          </svg>
          {selected && (
            <div className="premium-map-tooltip" role="status">
              <strong>
                {locale === "bn" ? selected.nameBn : selected.nameEn}
              </strong>
              <span>
                {selected.orders} {copy.orders}
              </span>
              <span>
                {formatMoney(selected.revenueMinor, locale)} ·{" "}
                {selected.revenueShare.toFixed(1)}%
              </span>
              <span>
                {copy.deliverySuccess}: {selected.deliverySuccess}%
              </span>
            </div>
          )}
        </div>
        <div className="premium-ranked-districts">
          <table>
            <caption>
              {locale === "bn" ? "শীর্ষ পাঁচ জেলা" : "Top five districts"}
            </caption>
            <thead>
              <tr>
                <th>{copy.district}</th>
                <th>{copy.orders}</th>
                <th>{copy.share}</th>
              </tr>
            </thead>
            <tbody>
              {top.map((district) => (
                <tr key={district.id}>
                  <td>
                    <button onClick={() => setSelected(district)} type="button">
                      {locale === "bn" ? district.nameBn : district.nameEn}
                    </button>
                  </td>
                  <td>{district.orders}</td>
                  <td>{district.revenueShare.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <dl className="premium-map-notes">
            <div>
              <dt>{copy.otherDistricts}</dt>
              <dd>{panel.data.otherDistrictOrders}</dd>
            </div>
            <div>
              <dt>{copy.unmapped}</dt>
              <dd>{panel.data.unmappedOrders}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
