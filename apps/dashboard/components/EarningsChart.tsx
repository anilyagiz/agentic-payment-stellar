"use client";

import { ResponsiveContainer, Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

export type EarningsPoint = {
  day: string;
  earnings: number;
};

export function EarningsChart({ data }: { data: EarningsPoint[] }) {
  return (
    <div className="chart-shell">
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="earningsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity={0.42} />
              <stop offset="100%" stopColor="#f97316" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis dataKey="day" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip
            contentStyle={{
              background: "#0f172a",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              color: "#fff"
            }}
          />
          <Area type="monotone" dataKey="earnings" stroke="#fb923c" fill="url(#earningsFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
