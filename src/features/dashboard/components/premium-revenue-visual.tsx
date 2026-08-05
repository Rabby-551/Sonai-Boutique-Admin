"use client";

import { useReducedMotion } from "motion/react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney } from "@/lib/formatting";
import type { AdminLocale } from "@/lib/i18n/admin-locale";
import type { DashboardWorkspace } from "../schemas/dashboard-schema";

type Panel = DashboardWorkspace["revenue"];
export type RevenuePoint = Extract<Panel, { status: "ready" }>["data"][number];
export type RevenueSeries = "revenue" | "profit" | "orders" | "previous";

function TooltipContent({
  active,
  payload,
  label,
  locale,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ dataKey?: string; value?: number; color?: string }>;
  label?: string;
  locale: AdminLocale;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="premium-chart-tooltip">
      <strong>{label}</strong>
      {payload.map((item) => (
        <span key={item.dataKey} style={{ color: item.color }}>
          {item.dataKey === "orders"
            ? Number(item.value).toLocaleString()
            : formatMoney(Number(item.value), locale)}
        </span>
      ))}
    </div>
  );
}

export function PremiumRevenueVisual({
  data,
  locale,
  visible,
}: {
  data: RevenuePoint[];
  locale: AdminLocale;
  visible: Set<RevenueSeries>;
}) {
  const reduced = useReducedMotion();
  return (
    <div className="premium-revenue-visual">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 18, right: 14, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id="premiumRevenue" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#741d33" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#741d33" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="#e7e1d6"
            strokeDasharray="3 3"
          />
          <XAxis dataKey="label" axisLine={false} tickLine={false} />
          <YAxis
            yAxisId="money"
            width={48}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `${Math.round(Number(value) / 100_000)}k`}
          />
          <YAxis yAxisId="orders" hide orientation="right" />
          <Tooltip
            cursor={{ stroke: "#c4a574" }}
            content={<TooltipContent locale={locale} />}
          />
          {visible.has("revenue") && (
            <Area
              yAxisId="money"
              dataKey="revenueMinor"
              name="Revenue"
              stroke="#741d33"
              fill="url(#premiumRevenue)"
              strokeWidth={2.5}
              isAnimationActive={!reduced}
            />
          )}
          {visible.has("profit") && (
            <Line
              yAxisId="money"
              dataKey="profitMinor"
              name="Profit"
              stroke="#39715e"
              strokeWidth={2}
              dot={false}
              isAnimationActive={!reduced}
            />
          )}
          {visible.has("previous") && (
            <Line
              yAxisId="money"
              dataKey="previousRevenueMinor"
              name="Previous"
              stroke="#8b6f47"
              strokeDasharray="5 4"
              dot={false}
              isAnimationActive={!reduced}
            />
          )}
          {visible.has("orders") && (
            <Line
              yAxisId="orders"
              dataKey="orders"
              name="Orders"
              stroke="#5b8a8e"
              strokeWidth={2}
              dot={false}
              isAnimationActive={!reduced}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
