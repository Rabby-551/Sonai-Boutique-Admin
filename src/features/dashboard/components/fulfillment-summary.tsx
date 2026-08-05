"use client";

import { useAdminLocale } from "@/components/i18n/admin-locale-provider";
import { localizeAdminTerm } from "@/lib/i18n/admin-locale";
import type { DashboardSummary } from "../schemas/dashboard-schema";
export function FulfillmentSummary({
  fulfillment,
}: {
  fulfillment: DashboardSummary["fulfillment"];
}) {
  const { locale, dictionary } = useAdminLocale();
  const copy = dictionary.dashboard;
  const entries = Object.entries(fulfillment);
  const total = entries.reduce((sum, item) => sum + item[1], 0);
  return (
    <section className="card">
      <div className="section-title">
        <div>
          <div className="eyebrow">{copy.fulfillment}</div>
          <h2>{copy.orderProgress}</h2>
        </div>
      </div>
      <div className="stack">
        {entries.map(([label, value]) => (
          <div key={label}>
            <div className="progress-label">
              <span>{localizeAdminTerm(label, locale)}</span>
              <strong>{value}</strong>
            </div>
            <div className="progress">
              <span
                style={{ width: `${total ? (value / total) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
