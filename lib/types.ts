// Core domain model for Definitely Decodable.
// The product is built for intermediate / older struggling readers (grades 3+),
// so the "scope & sequence" is multisyllabic decoding + morphology — not early CVC.

export type SkillDomain = "Decoding" | "Morphology";

/** A target in the phonics / morphology scope & sequence. Passages are built around these. */
export interface Skill {
  id: string;
  domain: SkillDomain;
  name: string;
  shortName: string;
  focus: string;
  examples: string[];
  /** Position in the scope & sequence (lower = taught earlier). */
  order: number;
  gradeHint: string;
}

export type GradeBand = "3–5" | "6–8" | "9–12";

/** Three-tier mastery used everywhere status is shown. */
export type MasteryStatus = "gap" | "developing" | "secure";

export interface VocabItem {
  word: string;
  definition: string;
}

export type QuestionType = "literal" | "inferential" | "vocabulary";

export interface ComprehensionQuestion {
  id: string;
  prompt: string;
  type: QuestionType;
  answer: string;
}

/** Provenance of a passage — drives the badge shown to teachers. */
export type PassageSource = "library" | "ai" | "draft";

export interface Passage {
  id: string;
  title: string;
  topic: string;
  blurb: string;
  gradeBand: GradeBand;
  /** Difficulty within the scope, 1 (accessible) – 10 (demanding). */
  level: number;
  skillTargets: string[];
  /** Paragraphs separated by a blank line. */
  text: string;
  /** Decodable focus words worth highlighting / scoring against. */
  targetWords: string[];
  vocabulary: VocabItem[];
  questions: ComprehensionQuestion[];
  wordCount: number;
  source: PassageSource;
  createdAt?: number;
}

export interface SkillMastery {
  skillId: string;
  /** Most recent decoding accuracy on this skill (0–100). */
  accuracy: number;
  /** Rolling model estimate of mastery (0–100). */
  mastery: number;
  status: MasteryStatus;
  /** Change over the recent window, signed. */
  trend: number;
}

export interface Student {
  id: string;
  name: string;
  grade: number;
  /** Hue (0–360) for the generated avatar. */
  avatarHue: number;
  skills: Record<string, SkillMastery>;
  /** Latest headline metrics. */
  wcpm: number;
  accuracy: number;
  comprehension: number;
  /** Current top-priority gap (skill id). */
  focusSkillId: string;
}

export type MiscueType =
  | "substitution"
  | "omission"
  | "insertion"
  | "self-correct"
  | "hesitation";

export interface Miscue {
  word: string;
  type: MiscueType;
  skillId: string;
}

export interface Session {
  id: string;
  studentId: string;
  passageId: string;
  date: number;
  accuracy: number;
  wcpm: number;
  comprehension: number;
  miscues: Miscue[];
  skillTargets: string[];
  notes?: string;
}

export type AssignmentStatus = "assigned" | "in-progress" | "complete";

export interface Assignment {
  id: string;
  passageId: string;
  studentIds: string[];
  groupId?: string;
  skillId: string;
  status: AssignmentStatus;
  assignedAt: number;
  dueAt?: number;
  repeatedReading: boolean;
}

export interface Group {
  id: string;
  name: string;
  studentIds: string[];
  skillId: string;
  /** Auto-suggested by shared gap vs. teacher-built. */
  auto: boolean;
}

export interface AppData {
  students: Student[];
  passages: Passage[];
  sessions: Session[];
  groups: Group[];
  assignments: Assignment[];
}

// ── Passage generation (Server Action contract) ──────────────────────────────

export interface GeneratePassageInput {
  skillIds: string[];
  gradeBand: GradeBand;
  topic: string;
  approxWords?: number;
}

export interface GeneratePassageResult {
  passage: Passage;
  /** Human-readable provenance note shown to the teacher. */
  note: string;
  source: "ai" | "draft";
}
