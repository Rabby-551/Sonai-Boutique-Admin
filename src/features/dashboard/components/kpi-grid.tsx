"use client";

import { Banknote, PackageCheck, ShoppingBag, TrendingUp } from "lucide-react";
import { KpiCard } from "@/components/ui/kpi-card";
import { useAdminLocale } from "@/components/i18n/admin-locale-provider";
import { formatMoney } from "@/lib/formatting";
import type { DashboardSummary } from "../schemas/dashboard-schema";

export function KpiGrid({ summary }: { summary: DashboardSummary }) {
  const { locale, dictionary } = useAdminLocale();
  const copy = dictionary.dashboard;
  const metrics = [
    {
      label: copy.revenue,
      value: formatMoney(summary.revenueMinor, locale),
      note: `+12.4% ${copy.previousPeriod}`,
      icon: Banknote,
      tone: "positive" as const,
    },
    {
      label: copy.orders,
      value: summary.orders.toLocaleString(locale === "bn" ? "bn-BD" : "en-BD"),
      note: `94.2% ${copy.deliverySuccess}`,
      icon: ShoppingBag,
      tone: "positive" as const,
    },
    {
      label: copy.grossProfit,
      value: formatMoney(summary.profitMinor, locale),
      note: `37.6% ${copy.margin}`,
      icon: TrendingUp,
      tone: "positive" as const,
    },
    {
      label: copy.inventoryValue,
      value: formatMoney(summary.inventoryMinor, locale),
      note: copy.currentScope,
      icon: PackageCheck,
      tone: "neutral" as const,
    },
  ];
  return (
    <section
      className="cards kpi-grid motion-stagger"
      aria-label={copy.businessMetrics}
    >
      {metrics.map((metric) => (
        <KpiCard {...metric} key={metric.label} />
      ))}
    </section>
  );
}
