import type {
  AppData,
  Assignment,
  Group,
  MasteryStatus,
  Miscue,
  MiscueType,
  Passage,
  Session,
  SkillMastery,
  Student,
} from "./types";
import { SKILLS } from "./scope";
import { LIBRARY } from "./passages";

// Deterministic PRNG so the generated roster/history is stable between reloads
// before anything is persisted. (After first load we save to localStorage.)
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function statusFor(mastery: number): MasteryStatus {
  if (mastery < 55) return "gap";
  if (mastery < 78) return "developing";
  return "secure";
}

function gradeBandFor(grade: number): Passage["gradeBand"] {
  if (grade <= 5) return "3–5";
  if (grade <= 8) return "6–8";
  return "9–12";
}

interface StudentSpec {
  id: string;
  name: string;
  grade: number;
  hue: number;
  gaps: string[];
  strengths: string[];
}

const SPECS: StudentSpec[] = [
  { id: "maya", name: "Maya Hill", grade: 3, hue: 210, gaps: ["closed-syllables", "suffixes-inflectional"], strengths: ["open-syllables"] },
  { id: "diego", name: "Diego Romero", grade: 4, hue: 25, gaps: ["r-controlled", "prefixes-1"], strengths: ["closed-syllables"] },
  { id: "aisha", name: "Aisha Khan", grade: 4, hue: 330, gaps: ["vowel-teams", "vce-multisyllabic"], strengths: ["open-syllables"] },
  { id: "liam", name: "Liam O'Brien", grade: 5, hue: 150, gaps: ["consonant-le", "schwa"], strengths: ["prefixes-1"] },
  { id: "sofia", name: "Sofia Nguyen", grade: 6, hue: 268, gaps: ["schwa", "suffixes-derivational-1"], strengths: ["vowel-teams"] },
  { id: "marcus", name: "Marcus Bell", grade: 6, hue: 12, gaps: ["diphthongs", "r-controlled"], strengths: ["closed-syllables"] },
  { id: "priya", name: "Priya Patel", grade: 7, hue: 300, gaps: ["prefixes-2", "suffixes-derivational-1"], strengths: ["prefixes-1"] },
  { id: "noah", name: "Noah Carter", grade: 8, hue: 200, gaps: ["latin-roots", "suffixes-derivational-2"], strengths: ["suffixes-inflectional"] },
  { id: "ella", name: "Ella Foster", grade: 9, hue: 178, gaps: ["greek-forms", "latin-roots"], strengths: ["suffixes-derivational-1"] },
];

const MISCUE_TYPES: MiscueType[] = [
  "substitution",
  "omission",
  "insertion",
  "self-correct",
  "hesitation",
];

const DAY = 24 * 60 * 60 * 1000;

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function clamp(n: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, n));
}

function buildStudent(spec: StudentSpec): { student: Student; sessions: Session[] } {
  const rng = mulberry32(hash(spec.id));
  const now = Date.now();

  // Current per-skill mastery.
  const skills: Record<string, SkillMastery> = {};
  for (const skill of SKILLS) {
    let mastery: number;
    if (spec.gaps.includes(skill.id)) mastery = 34 + Math.floor(rng() * 20); // 34–54
    else if (spec.strengths.includes(skill.id)) mastery = 84 + Math.floor(rng() * 12); // 84–95
    else mastery = 60 + Math.floor(rng() * 22); // 60–81
    const trend = spec.gaps.includes(skill.id)
      ? 3 + Math.floor(rng() * 7) // improving
      : Math.floor(rng() * 5) - 1;
    skills[skill.id] = {
      skillId: skill.id,
      mastery,
      accuracy: clamp(mastery + Math.floor(rng() * 8) - 3),
      status: statusFor(mastery),
      trend,
    };
  }

  // Top gap = lowest mastery, breaking ties by scope order.
  const focusSkillId = [...spec.gaps].sort((a, b) => {
    const dm = skills[a].mastery - skills[b].mastery;
    if (dm !== 0) return dm;
    return (SKILLS.find((s) => s.id === a)?.order ?? 0) - (SKILLS.find((s) => s.id === b)?.order ?? 0);
  })[0];

  // Headline metrics, anchored to grade with gap penalties.
  const baseWcpm = 58 + (spec.grade - 3) * 16;
  const wcpm = Math.round(clamp(baseWcpm - spec.gaps.length * 6 + rng() * 14 - 7, 30, 200));
  const accuracy = Math.round(
    clamp(
      Object.values(skills).reduce((s, m) => s + m.accuracy, 0) / SKILLS.length,
      0,
      100,
    ),
  );
  const comprehension = Math.round(clamp(56 + (spec.grade - 3) * 3 + rng() * 18 - spec.gaps.length * 4));

  const band = gradeBandFor(spec.grade);
  const candidatePassages = LIBRARY.filter((p) => p.gradeBand === band);

  // ~8 sessions over the last ~10 weeks, trending upward toward current state.
  const sessions: Session[] = [];
  const total = 8;
  for (let i = 0; i < total; i++) {
    const ago = (total - i) * 8 + Math.floor(rng() * 4); // days ago, decreasing
    const date = now - ago * DAY;
    const progress = i / (total - 1); // 0 → 1 across the window

    // Rotate through the student's gaps so each shows up in the history.
    const targetSkill = spec.gaps[i % spec.gaps.length];
    const matching = candidatePassages.filter((p) => p.skillTargets.includes(targetSkill));
    const passage = matching.length ? pick(rng, matching) : pick(rng, candidatePassages.length ? candidatePassages : LIBRARY);

    // Earlier sessions are weaker; later ones approach current ability.
    const lift = (1 - progress) * 14;
    const sAcc = Math.round(clamp(accuracy - lift + rng() * 6 - 3, 40, 100));
    const sWcpm = Math.round(clamp(wcpm - (1 - progress) * 18 + rng() * 8 - 4, 25, 220));
    const sComp = Math.round(clamp(comprehension - (1 - progress) * 16 + rng() * 12 - 6, 20, 100));

    // Miscues concentrate on the skills this student struggles with.
    const miscueCount = Math.max(0, Math.round((100 - sAcc) / 8));
    const miscues: Miscue[] = [];
    const pool = passage.targetWords.length ? passage.targetWords : passage.text.split(/\s+/);
    for (let m = 0; m < miscueCount; m++) {
      const skillForMiscue =
        passage.skillTargets.find((s) => spec.gaps.includes(s)) ??
        targetSkill ??
        passage.skillTargets[0];
      miscues.push({
        word: pick(rng, pool).replace(/[.,!?]/g, ""),
        type: pick(rng, MISCUE_TYPES),
        skillId: skillForMiscue,
      });
    }

    sessions.push({
      id: `${spec.id}-s${i}`,
      studentId: spec.id,
      passageId: passage.id,
      date,
      accuracy: sAcc,
      wcpm: sWcpm,
      comprehension: sComp,
      miscues,
      skillTargets: passage.skillTargets,
    });
  }

  const student: Student = {
    id: spec.id,
    name: spec.name,
    grade: spec.grade,
    avatarHue: spec.hue,
    skills,
    wcpm,
    accuracy,
    comprehension,
    focusSkillId,
  };

  return { student, sessions };
}

export function buildSeedData(): AppData {
  const students: Student[] = [];
  const sessions: Session[] = [];
  for (const spec of SPECS) {
    const built = buildStudent(spec);
    students.push(built.student);
    sessions.push(...built.sessions);
  }

  // A couple of auto-suggested groups built from shared gaps, plus one manual group.
  const groups: Group[] = [
    {
      id: "grp-schwa",
      name: "Schwa Strategy Group",
      skillId: "schwa",
      auto: true,
      studentIds: students.filter((s) => s.skills["schwa"].status === "gap").map((s) => s.id),
    },
    {
      id: "grp-rcontrolled",
      name: "R-Controlled Crew",
      skillId: "r-controlled",
      auto: true,
      studentIds: students.filter((s) => s.skills["r-controlled"].status === "gap").map((s) => s.id),
    },
    {
      id: "grp-roots",
      name: "Roots & Affixes (Period 4)",
      skillId: "latin-roots",
      auto: false,
      studentIds: ["noah", "ella", "priya"],
    },
  ].filter((g) => g.studentIds.length > 0);

  const now = Date.now();
  const assignments: Assignment[] = [
    {
      id: "asg-1",
      passageId: "endurance",
      studentIds: students.filter((s) => s.skills["schwa"].status === "gap").map((s) => s.id),
      groupId: "grp-schwa",
      skillId: "schwa",
      status: "assigned",
      assignedAt: now - 2 * DAY,
      dueAt: now + 5 * DAY,
      repeatedReading: true,
    },
    {
      id: "asg-2",
      passageId: "parkour",
      studentIds: ["marcus"],
      skillId: "r-controlled",
      status: "in-progress",
      assignedAt: now - 4 * DAY,
      repeatedReading: false,
    },
    {
      id: "asg-3",
      passageId: "vaccines",
      studentIds: ["noah", "ella"],
      groupId: "grp-roots",
      skillId: "latin-roots",
      status: "complete",
      assignedAt: now - 9 * DAY,
      repeatedReading: true,
    },
  ];

  return {
    students,
    passages: LIBRARY,
    sessions,
    groups,
    assignments,
  };
}
