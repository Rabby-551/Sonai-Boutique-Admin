import { Banknote, PackageCheck, ShoppingBag, TrendingUp } from "lucide-react";
import { KpiCard } from "@/components/ui/kpi-card";
import { formatMoney } from "@/lib/formatting";
import type { DashboardSummary } from "../schemas/dashboard-schema";

export function KpiGrid({ summary }: { summary: DashboardSummary }) {
  const metrics = [
    {
      label: "Revenue",
      value: formatMoney(summary.revenueMinor),
      note: "+12.4% vs previous period",
      icon: Banknote,
      tone: "positive" as const,
    },
    {
      label: "Orders",
      value: summary.orders.toLocaleString("en-BD"),
      note: "94.2% delivery success",
      icon: ShoppingBag,
      tone: "positive" as const,
    },
    {
      label: "Gross profit",
      value: formatMoney(summary.profitMinor),
      note: "37.6% margin",
      icon: TrendingUp,
      tone: "positive" as const,
    },
    {
      label: "Inventory value",
      value: formatMoney(summary.inventoryMinor),
      note: "Current filtered scope",
      icon: PackageCheck,
      tone: "neutral" as const,
    },
  ];
  return (
    <section
      className="cards kpi-grid motion-stagger"
      aria-label="Business metrics"
    >
      {metrics.map((metric) => (
        <KpiCard {...metric} key={metric.label} />
      ))}
    </section>
  );
}
