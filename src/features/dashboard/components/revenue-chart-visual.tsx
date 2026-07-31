"use client";

import { useReducedMotion } from "motion/react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney } from "@/lib/formatting";
import type { DashboardSummary } from "../schemas/dashboard-schema";

type Trend = DashboardSummary["trend"];

function RevenueTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ value?: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <span>{label}</span>
      <strong>{formatMoney(Number(payload[0]?.value ?? 0))}</strong>
    </div>
  );
}

export function RevenueChartVisual({ data }: { data: Trend }) {
  const reduceMotion = useReducedMotion();
  return (
    <div className="revenue-chart" role="presentation">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 16, right: 4, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#5b8a8e" stopOpacity={0.32} />
              <stop offset="100%" stopColor="#5b8a8e" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke="#eee8de"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            axisLine={false}
            dataKey="label"
            tick={{ fill: "#6f6b63", fontSize: 11 }}
            tickLine={false}
          />
          <YAxis
            axisLine={false}
            tick={{ fill: "#6f6b63", fontSize: 11 }}
            tickFormatter={(value) => `${Math.round(Number(value) / 100000)}k`}
            tickLine={false}
            width={38}
          />
          <Tooltip
            content={<RevenueTooltip />}
            cursor={{ stroke: "#c4a574", strokeWidth: 1 }}
          />
          <Area
            animationDuration={reduceMotion ? 0 : 600}
            dataKey="revenueMinor"
            fill="url(#revenueFill)"
            isAnimationActive={!reduceMotion}
            stroke="#4f7c80"
            strokeWidth={2.5}
            type="monotone"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
