import type { Point } from "@/lib/analytics";
import { cx } from "@/lib/util";

/** Tiny inline trend line. */
export function Sparkline({
  values,
  width = 96,
  height = 28,
  className = "text-indigo-500",
}: {
  values: number[];
  width?: number;
  height?: number;
  className?: string;
}) {
  if (values.length < 2) return <div style={{ width, height }} />;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pad = 2;
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (width - pad * 2);
    const y = pad + (1 - (v - min) / span) * (height - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg width={width} height={height} className={className} aria-hidden>
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Line chart with area fill and an end-point marker. Pure SVG, responsive. */
export function GrowthChart({
  points,
  height = 160,
  color = "#4f46e5",
  domain,
  unit = "",
}: {
  points: Point[];
  height?: number;
  color?: string;
  /** Optional fixed [min, max]; defaults to data range with padding. */
  domain?: [number, number];
  unit?: string;
}) {
  const width = 520;
  const padL = 30;
  const padR = 14;
  const padT = 12;
  const padB = 22;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  if (points.length === 0) {
    return <div className="text-sm text-slate-400">No data yet.</div>;
  }

  const values = points.map((p) => p.value);
  const min = domain ? domain[0] : Math.max(0, Math.min(...values) - 6);
  const max = domain ? domain[1] : Math.max(...values) + 6;
  const span = max - min || 1;

  const x = (i: number) =>
    padL + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (v: number) => padT + (1 - (v - min) / span) * innerH;

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`).join(" ");
  const area = `${line} L${x(points.length - 1).toFixed(1)} ${(padT + innerH).toFixed(1)} L${x(0).toFixed(1)} ${(padT + innerH).toFixed(1)} Z`;
  const last = points[points.length - 1];
  const gradId = `grad-${color.replace("#", "")}`;

  const ticks = [max, Math.round((max + min) / 2), min];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      role="img"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.18} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {ticks.map((t, i) => {
        const yy = padT + (i / (ticks.length - 1)) * innerH;
        return (
          <g key={i}>
            <line x1={padL} y1={yy} x2={width - padR} y2={yy} stroke="#f1f5f9" strokeWidth={1} />
            <text x={4} y={yy + 3} fontSize={9} fill="#94a3b8">
              {Math.round(t)}
            </text>
          </g>
        );
      })}
      <path d={area} fill={`url(#${gradId})`} />
      <path d={line} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(points.length - 1)} cy={y(last.value)} r={3.5} fill={color} />
      <text x={x(points.length - 1) - 4} y={y(last.value) - 8} fontSize={11} fontWeight={700} fill={color} textAnchor="end">
        {Math.round(last.value)}
        {unit}
      </text>
    </svg>
  );
}

export interface BarItem {
  label: string;
  value: number;
  hint?: string;
  barClass?: string;
}

/** Horizontal labeled bars (used for error patterns). */
export function BarList({ items, max }: { items: BarItem[]; max?: number }) {
  const top = max ?? Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="flex flex-col gap-2.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-28 shrink-0 truncate text-xs text-slate-600">{item.label}</div>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className={cx("h-full rounded-full", item.barClass ?? "bg-rose-400")}
              style={{ width: `${(item.value / top) * 100}%` }}
            />
          </div>
          <div className="w-6 shrink-0 text-right text-xs tabular-nums text-slate-500">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

/** Donut summarizing how many skills are gap / developing / secure. */
export function DonutStatus({
  counts,
  size = 92,
}: {
  counts: { gap: number; developing: number; secure: number };
  size?: number;
}) {
  const total = counts.gap + counts.developing + counts.secure || 1;
  const r = size / 2 - 8;
  const c = 2 * Math.PI * r;
  const segs = [
    { value: counts.secure, color: "#10b981" },
    { value: counts.developing, color: "#f59e0b" },
    { value: counts.gap, color: "#f43f5e" },
  ];
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={8} />
        {segs.map((s, i) => {
          const len = (s.value / total) * c;
          const el = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={8}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += len;
          return el;
        })}
      </g>
      <text x="50%" y="48%" textAnchor="middle" fontSize={18} fontWeight={700} fill="#0f172a">
        {counts.secure}
      </text>
      <text x="50%" y="64%" textAnchor="middle" fontSize={8} fill="#94a3b8">
        secure
      </text>
    </svg>
  );
}
