"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const GOLD = "#E8B84B";
const PALETTE = ["#E8B84B", "#7B3FF2", "#4C8DFF", "#3BB273", "#E5484D", "#F2618C", "#0FA3B1"];

const axis = { stroke: "#5b6679", fontSize: 11 };
const tooltipStyle = {
  background: "#161E2D",
  border: "1px solid #243149",
  borderRadius: 12,
  fontSize: 12,
  color: "#EEF2F8",
};

export function AreaTrend({
  data,
  xKey,
  yKey,
  color = GOLD,
  height = 200,
}: {
  data: any[];
  xKey: string;
  yKey: string;
  color?: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id={`g-${yKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey={xKey} tick={axis} tickLine={false} axisLine={false} minTickGap={28}
          tickFormatter={(v) => String(v).slice(5)} />
        <YAxis tick={axis} tickLine={false} axisLine={false} width={44} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} fill={`url(#g-${yKey})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function Histogram({
  data,
  xKey,
  yKey,
  color = "#4C8DFF",
  height = 200,
  rawLabels,
}: {
  data: any[];
  xKey: string;
  yKey: string;
  color?: string;
  height?: number;
  rawLabels?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
        <XAxis dataKey={xKey} tick={axis} tickLine={false} axisLine={false} minTickGap={20}
          tickFormatter={rawLabels ? (v) => String(v) : (v) => String(v).slice(5)} />
        <YAxis tick={axis} tickLine={false} axisLine={false} width={44} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#ffffff08" }} />
        <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function HorizontalBars({
  data,
  labelKey,
  valueKey,
  height = 220,
}: {
  data: any[];
  labelKey: string;
  valueKey: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, left: 8, bottom: 0 }}>
        <XAxis type="number" tick={axis} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey={labelKey} tick={{ ...axis, fontSize: 10 }} width={104}
          tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#ffffff08" }} />
        <Bar dataKey={valueKey} radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function Donut({
  data,
  nameKey,
  valueKey,
  height = 220,
  inner = 58,
}: {
  data: any[];
  nameKey: string;
  valueKey: string;
  height?: number;
  inner?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey={valueKey}
          nameKey={nameKey}
          innerRadius={inner}
          outerRadius={88}
          paddingAngle={2}
          stroke="none"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11, color: "#8A97AD" }} iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function PieBasic({
  data,
  nameKey,
  valueKey,
  height = 220,
}: {
  data: any[];
  nameKey: string;
  valueKey: string;
  height?: number;
}) {
  return <Donut data={data} nameKey={nameKey} valueKey={valueKey} height={height} inner={0} />;
}
