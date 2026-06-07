import type { AppData, GradeBand, Passage, Student } from "./types";
import { clamp, gradeBandFor } from "./util";

const BAND_ORDER: GradeBand[] = ["3–5", "6–8", "9–12"];

/**
 * Dynamic difficulty: map a 0–100 mastery estimate to a target passage level (1–10).
 * We aim a little below frustration so decodable practice stays at ~95% success.
 */
export function difficultyTarget(mastery: number): number {
  return clamp(Math.round(1 + mastery / 13), 1, 10);
}

function bandFit(passageBand: GradeBand, studentBand: GradeBand): number {
  const d = Math.abs(BAND_ORDER.indexOf(passageBand) - BAND_ORDER.indexOf(studentBand));
  if (d === 0) return 1;
  if (d === 1) return 0.55;
  return 0.15;
}

export interface Recommendation {
  passage: Passage;
  /** 0–100 overall fit. */
  fit: number;
  reason: string;
}

interface RecommendOptions {
  student: Student;
  skillId: string;
  data: AppData;
  limit?: number;
}

/**
 * Recommend passages for a student + target skill. Scores on skill match,
 * grade-band fit, difficulty fit (relative to the student's mastery of the skill),
 * and novelty (penalize texts the student has read recently).
 */
export function recommendPassages(opts: RecommendOptions): Recommendation[] {
  const { student, skillId, data, limit = 6 } = opts;
  const studentBand = gradeBandFor(student.grade);
  const mastery = student.skills[skillId]?.mastery ?? 50;
  const target = difficultyTarget(mastery);

  const recentPassageIds = new Set(
    data.sessions
      .filter((s) => s.studentId === student.id)
      .sort((a, b) => b.date - a.date)
      .slice(0, 4)
      .map((s) => s.passageId),
  );

  const gaps = new Set(
    Object.values(student.skills)
      .filter((m) => m.status === "gap")
      .map((m) => m.skillId),
  );

  const pool = data.passages.filter((p) => p.skillTargets.includes(skillId));

  const scored = pool.map((passage): Recommendation => {
    const grade = bandFit(passage.gradeBand, studentBand);
    const level = 1 - Math.abs(passage.level - target) / 10;
    const extraGapHit = passage.skillTargets.some((s) => s !== skillId && gaps.has(s));
    const novelty = recentPassageIds.has(passage.id) ? 0 : 1;

    const fit = clamp(
      Math.round(
        100 * (0.4 * grade + 0.34 * level + 0.16 * novelty + (extraGapHit ? 0.1 : 0)),
      ),
      0,
      100,
    );

    const reasons: string[] = [];
    if (grade === 1) reasons.push("on grade band");
    else if (grade > 0.4) reasons.push("near grade band");
    if (level > 0.8) reasons.push("right difficulty");
    else if (passage.level > target) reasons.push("a stretch");
    else reasons.push("builds confidence");
    if (extraGapHit) reasons.push("hits a second gap");
    if (novelty === 0) reasons.push("read recently");

    return { passage, fit, reason: reasons.join(" • ") };
  });

  return scored.sort((a, b) => b.fit - a.fit).slice(0, limit);
}

/** Top recommendation for a student's current focus skill. */
export function recommendForStudent(student: Student, data: AppData): Recommendation | undefined {
  return recommendPassages({ student, skillId: student.focusSkillId, data, limit: 1 })[0];
}
