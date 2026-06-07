import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { MasteryStatus, SkillDomain } from "@/lib/types";
import { SKILL_BY_ID, DOMAIN_STYLES } from "@/lib/scope";
import { avatarStyle, cx, initials, statusStyle } from "@/lib/util";

/** Brand wordmark: a sprouting leaf + "Sapling". */
export function Brand({ className }: { className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-1.5 text-lg font-bold tracking-tight", className)}>
      <svg viewBox="0 0 24 24" className="h-[1.15em] w-[1.15em]" aria-hidden>
        <path d="M5 19C5 11 11 5 19 5c0 8-6 14-14 14Z" className="fill-emerald-500" />
        <path
          d="M8.5 16C11 13 14 10.5 17 8.5"
          fill="none"
          className="stroke-emerald-50"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      <span className="text-slate-900">Sapling</span>
    </span>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cx("rounded-xl border border-slate-200 bg-white", className)}>{children}</div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">{children}</h2>
      {action}
    </div>
  );
}

export function Stat({
  label,
  value,
  sub,
  accent = "text-slate-900",
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  accent?: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
      <p className={cx("mt-1 text-2xl font-bold tabular-nums", accent)}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

type Tone = "slate" | "indigo" | "emerald" | "amber" | "rose" | "violet";
const TONES: Record<Tone, string> = {
  slate: "bg-slate-100 text-slate-600",
  indigo: "bg-indigo-50 text-indigo-700",
  emerald: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  rose: "bg-rose-50 text-rose-700",
  violet: "bg-violet-50 text-violet-700",
};

export function Badge({
  children,
  tone = "slate",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Avatar({ name, hue, size = 40 }: { name: string; hue: number; size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold"
      style={{ ...avatarStyle(hue), width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials(name)}
    </span>
  );
}

export function ProgressBar({
  value,
  barClass = "bg-indigo-500",
  className,
}: {
  value: number;
  barClass?: string;
  className?: string;
}) {
  return (
    <div className={cx("h-1.5 w-full overflow-hidden rounded-full bg-slate-100", className)}>
      <div
        className={cx("h-full rounded-full transition-all", barClass)}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center">
      <p className="font-medium text-slate-500">{title}</p>
      {hint && <p className="mt-1 text-sm text-slate-400">{hint}</p>}
    </div>
  );
}

const BUTTON_VARIANTS = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-600",
  secondary: "bg-white text-slate-700 hover:bg-slate-50 border-slate-200",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100 border-transparent",
  danger: "bg-white text-rose-600 hover:bg-rose-50 border-rose-200",
} as const;

export function Button({
  variant = "secondary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof BUTTON_VARIANTS;
  size?: "sm" | "md";
}) {
  return (
    <button
      {...rest}
      className={cx(
        "inline-flex items-center justify-center gap-1.5 rounded-lg border font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-2 text-sm",
        BUTTON_VARIANTS[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

// ── Skill + mastery chips ────────────────────────────────────────────────────

export function SkillPill({ skillId, className }: { skillId: string; className?: string }) {
  const skill = SKILL_BY_ID[skillId];
  if (!skill) return null;
  const style = DOMAIN_STYLES[skill.domain];
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
        style.soft,
        style.text,
        style.border,
        className,
      )}
    >
      <span className={cx("h-1.5 w-1.5 rounded-full", style.dot)} />
      {skill.shortName}
    </span>
  );
}

export function DomainDot({ domain }: { domain: SkillDomain }) {
  return <span className={cx("inline-block h-2 w-2 rounded-full", DOMAIN_STYLES[domain].dot)} />;
}

export function MasteryBadge({ status }: { status: MasteryStatus }) {
  const s = statusStyle(status);
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        s.bg,
        s.text,
        s.border,
      )}
    >
      <span className={cx("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

export function TrendArrow({ value }: { value: number }) {
  if (value > 0) return <span className="text-emerald-600">▲ {value}</span>;
  if (value < 0) return <span className="text-rose-500">▼ {Math.abs(value)}</span>;
  return <span className="text-slate-400">– 0</span>;
}
