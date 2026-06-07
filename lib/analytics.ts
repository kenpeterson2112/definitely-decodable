import type { AppData, Session, Student } from "./types";
import { SKILLS } from "./scope";

export type Metric = "accuracy" | "wcpm" | "comprehension";

export interface Point {
  date: number;
  value: number;
}

export function sessionsForStudent(data: AppData, studentId: string): Session[] {
  return data.sessions
    .filter((s) => s.studentId === studentId)
    .sort((a, b) => a.date - b.date);
}

export function series(sessions: Session[], metric: Metric): Point[] {
  return sessions.map((s) => ({ date: s.date, value: s[metric] }));
}

/** Change from first to last session for a metric (signed). */
export function growthDelta(sessions: Session[], metric: Metric): number {
  if (sessions.length < 2) return 0;
  return sessions[sessions.length - 1][metric] - sessions[0][metric];
}

export interface ErrorPattern {
  skillId: string;
  count: number;
}

/** Aggregate miscues by implicated skill, most frequent first. */
export function errorPatterns(sessions: Session[]): ErrorPattern[] {
  const counts = new Map<string, number>();
  for (const s of sessions) {
    for (const m of s.miscues) {
      counts.set(m.skillId, (counts.get(m.skillId) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([skillId, count]) => ({ skillId, count }))
    .sort((a, b) => b.count - a.count);
}

export interface ClassAverages {
  accuracy: number;
  wcpm: number;
  comprehension: number;
}

export function classAverages(data: AppData): ClassAverages {
  const n = data.students.length || 1;
  const sum = data.students.reduce(
    (acc, s) => {
      acc.accuracy += s.accuracy;
      acc.wcpm += s.wcpm;
      acc.comprehension += s.comprehension;
      return acc;
    },
    { accuracy: 0, wcpm: 0, comprehension: 0 },
  );
  return {
    accuracy: Math.round(sum.accuracy / n),
    wcpm: Math.round(sum.wcpm / n),
    comprehension: Math.round(sum.comprehension / n),
  };
}

export interface SkillGap {
  skillId: string;
  studentIds: string[];
}

/** For each scope skill, which students currently have a gap. */
export function skillGapCounts(data: AppData): SkillGap[] {
  return SKILLS.map((skill) => ({
    skillId: skill.id,
    studentIds: data.students.filter((s) => s.skills[skill.id]?.status === "gap").map((s) => s.id),
  })).sort((a, b) => b.studentIds.length - a.studentIds.length);
}

export interface SuggestedGroup {
  skillId: string;
  studentIds: string[];
}

/** Auto-grouping: any skill where 2+ students share a gap. */
export function suggestGroups(data: AppData, min = 2): SuggestedGroup[] {
  return skillGapCounts(data)
    .filter((g) => g.studentIds.length >= min)
    .map((g) => ({ skillId: g.skillId, studentIds: g.studentIds }));
}

export interface AttentionItem {
  student: Student;
  gapCount: number;
  reason: string;
}

/** Students most in need of attention, ranked by gap count then accuracy. */
export function studentsNeedingAttention(data: AppData, limit = 4): AttentionItem[] {
  return data.students
    .map((student) => {
      const gapCount = Object.values(student.skills).filter((m) => m.status === "gap").length;
      const focus = SKILLS.find((s) => s.id === student.focusSkillId);
      return {
        student,
        gapCount,
        reason: focus ? `Focus: ${focus.shortName}` : "Needs review",
      };
    })
    .sort((a, b) => b.gapCount - a.gapCount || a.student.accuracy - b.student.accuracy)
    .slice(0, limit);
}

export function recentSessions(data: AppData, limit = 6): Session[] {
  return [...data.sessions].sort((a, b) => b.date - a.date).slice(0, limit);
}

/** Class-wide average of a metric, bucketed by week, for trend charts. */
export function classMetricTrend(data: AppData, metric: Metric, buckets = 8): Point[] {
  const week = 7 * 24 * 60 * 60 * 1000;
  const start = Date.now() - buckets * week;
  const sums = new Array(buckets).fill(0);
  const counts = new Array(buckets).fill(0);
  for (const s of data.sessions) {
    if (s.date < start) continue;
    const idx = Math.min(buckets - 1, Math.floor((s.date - start) / week));
    sums[idx] += s[metric];
    counts[idx] += 1;
  }
  const points: Point[] = [];
  for (let i = 0; i < buckets; i++) {
    if (counts[i] > 0) points.push({ date: start + i * week, value: Math.round(sums[i] / counts[i]) });
  }
  return points;
}

export interface StatusCounts {
  gap: number;
  developing: number;
  secure: number;
}

export function statusCounts(student: Student): StatusCounts {
  const counts: StatusCounts = { gap: 0, developing: 0, secure: 0 };
  for (const m of Object.values(student.skills)) counts[m.status] += 1;
  return counts;
}
