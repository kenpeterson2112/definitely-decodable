import type { Skill, SkillDomain } from "./types";

// The scope & sequence for intermediate / older readers. Ordered roughly the way
// a structured-literacy intervention would sequence advanced decoding, then layer
// in morphology. Every passage targets one or more of these skill ids.

export const SKILLS: Skill[] = [
  {
    id: "closed-syllables",
    domain: "Decoding",
    name: "Closed Syllables & VCCV",
    shortName: "Closed syllables",
    focus: "Splitting VCCV words between the consonants to keep vowels short.",
    examples: ["napkin", "basket", "rabbit", "contest"],
    order: 1,
    gradeHint: "3–4",
  },
  {
    id: "open-syllables",
    domain: "Decoding",
    name: "Open Syllables & VCV",
    shortName: "Open syllables",
    focus: "Recognizing open syllables that end in a long vowel sound.",
    examples: ["robot", "music", "tiger", "begin"],
    order: 2,
    gradeHint: "3–4",
  },
  {
    id: "vce-multisyllabic",
    domain: "Decoding",
    name: "Vowel-Consonant-e in Longer Words",
    shortName: "VCe syllables",
    focus: "Reading magic-e syllables inside multisyllabic words.",
    examples: ["compete", "decide", "promote", "reptile"],
    order: 3,
    gradeHint: "3–5",
  },
  {
    id: "consonant-le",
    domain: "Decoding",
    name: "Consonant-le Syllables",
    shortName: "Consonant-le",
    focus: "Final stable syllables: -ble, -dle, -tle, -gle, -ple.",
    examples: ["table", "gentle", "riddle", "crumble"],
    order: 4,
    gradeHint: "3–5",
  },
  {
    id: "r-controlled",
    domain: "Decoding",
    name: "R-Controlled Syllables",
    shortName: "R-controlled",
    focus: "ar / or / er / ir / ur inside multisyllabic words.",
    examples: ["garden", "perform", "thunder", "purpose"],
    order: 5,
    gradeHint: "4–6",
  },
  {
    id: "vowel-teams",
    domain: "Decoding",
    name: "Vowel-Team Syllables",
    shortName: "Vowel teams",
    focus: "ai, ea, ee, oa, oe, ow vowel teams across syllables.",
    examples: ["explain", "between", "complain", "approach"],
    order: 6,
    gradeHint: "4–6",
  },
  {
    id: "diphthongs",
    domain: "Decoding",
    name: "Diphthongs & Less-Common Vowels",
    shortName: "Diphthongs",
    focus: "oi / oy / ou / ow / au / aw in longer words.",
    examples: ["appoint", "account", "applaud", "powerful"],
    order: 7,
    gradeHint: "5–7",
  },
  {
    id: "schwa",
    domain: "Decoding",
    name: "Schwa in Unstressed Syllables",
    shortName: "Schwa",
    focus: "The lazy /ə/ vowel in unstressed syllables.",
    examples: ["about", "pencil", "support", "animal"],
    order: 8,
    gradeHint: "5–8",
  },
  {
    id: "prefixes-1",
    domain: "Morphology",
    name: "Common Prefixes",
    shortName: "Prefixes I",
    focus: "un-, re-, dis-, mis-, pre- and how they change meaning.",
    examples: ["unfair", "rebuild", "dislike", "mislead"],
    order: 9,
    gradeHint: "3–5",
  },
  {
    id: "prefixes-2",
    domain: "Morphology",
    name: "Latin Prefixes",
    shortName: "Prefixes II",
    focus: "in-/im-/il-/ir-, non-, inter-, sub-, trans-.",
    examples: ["impossible", "interact", "submarine", "transport"],
    order: 10,
    gradeHint: "5–8",
  },
  {
    id: "suffixes-inflectional",
    domain: "Morphology",
    name: "Suffixes & Spelling Rules",
    shortName: "Suffixes I",
    focus: "-ed, -ing, -s with doubling, drop-e, and change-y rules.",
    examples: ["stopping", "hoping", "carried", "babies"],
    order: 11,
    gradeHint: "3–5",
  },
  {
    id: "suffixes-derivational-1",
    domain: "Morphology",
    name: "Derivational Suffixes",
    shortName: "Suffixes II",
    focus: "-tion/-sion, -ment, -ness, -ful, -less.",
    examples: ["invention", "movement", "kindness", "harmless"],
    order: 12,
    gradeHint: "5–8",
  },
  {
    id: "suffixes-derivational-2",
    domain: "Morphology",
    name: "Advanced Suffixes",
    shortName: "Suffixes III",
    focus: "-able/-ible, -ous, -ity, -al, -ive.",
    examples: ["reliable", "famous", "activity", "creative"],
    order: 13,
    gradeHint: "6–9",
  },
  {
    id: "latin-roots",
    domain: "Morphology",
    name: "Latin Roots",
    shortName: "Latin roots",
    focus: "port, struct, dict, spect, ject, rupt, tract, scrib/script.",
    examples: ["transport", "structure", "predict", "inspect"],
    order: 14,
    gradeHint: "6–9",
  },
  {
    id: "greek-forms",
    domain: "Morphology",
    name: "Greek Combining Forms",
    shortName: "Greek forms",
    focus: "graph, phon, photo, tele, scope, bio, geo, meter.",
    examples: ["telescope", "biology", "photograph", "geography"],
    order: 15,
    gradeHint: "7–12",
  },
];

export const SKILL_BY_ID: Record<string, Skill> = Object.fromEntries(
  SKILLS.map((s) => [s.id, s]),
);

export function getSkill(id: string): Skill | undefined {
  return SKILL_BY_ID[id];
}

export function skillName(id: string): string {
  return SKILL_BY_ID[id]?.shortName ?? id;
}

export const DOMAINS: SkillDomain[] = ["Decoding", "Morphology"];

/** Tailwind class fragments per domain — kept in one place so accents stay consistent. */
export const DOMAIN_STYLES: Record<
  SkillDomain,
  { text: string; bg: string; border: string; dot: string; soft: string }
> = {
  Decoding: {
    text: "text-indigo-700",
    bg: "bg-indigo-600",
    border: "border-indigo-200",
    dot: "bg-indigo-500",
    soft: "bg-indigo-50",
  },
  Morphology: {
    text: "text-violet-700",
    bg: "bg-violet-600",
    border: "border-violet-200",
    dot: "bg-violet-500",
    soft: "bg-violet-50",
  },
};
