import type { GradeBand, MasteryStatus } from "./types";

/** Join class names, dropping falsy values. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function clamp(n: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, n));
}

export function gradeBandFor(grade: number): GradeBand {
  if (grade <= 5) return "3–5";
  if (grade <= 8) return "6–8";
  return "9–12";
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function relativeDate(ts: number): string {
  const diff = Date.now() - ts;
  const day = 24 * 60 * 60 * 1000;
  const days = Math.round(diff / day);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${weeks} wk ago`;
  const months = Math.round(days / 30);
  return `${months} mo ago`;
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export interface StatusStyle {
  label: string;
  text: string;
  bg: string;
  border: string;
  dot: string;
  bar: string;
}

const STATUS_STYLES: Record<MasteryStatus, StatusStyle> = {
  gap: {
    label: "Gap",
    text: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
    dot: "bg-rose-500",
    bar: "bg-rose-400",
  },
  developing: {
    label: "Developing",
    text: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-500",
    bar: "bg-amber-400",
  },
  secure: {
    label: "Secure",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
  },
};

export function statusStyle(status: MasteryStatus): StatusStyle {
  return STATUS_STYLES[status];
}

export function statusFromMastery(mastery: number): MasteryStatus {
  if (mastery < 55) return "gap";
  if (mastery < 78) return "developing";
  return "secure";
}

/** A pleasant pastel avatar background from a hue. */
export function avatarStyle(hue: number): { backgroundColor: string; color: string } {
  return {
    backgroundColor: `hsl(${hue} 65% 92%)`,
    color: `hsl(${hue} 55% 32%)`,
  };
}
