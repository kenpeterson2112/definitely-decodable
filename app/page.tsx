"use client";

import { useState } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

type Grade = "K" | "1" | "2" | "3";
type ResourceType = "Book" | "Passage" | "Word List";
type Stage =
  | "CVC / Short Vowels"
  | "Consonant Blends"
  | "Digraphs"
  | "Silent E"
  | "Vowel Teams"
  | "R-Controlled Vowels"
  | "Multisyllabic";

interface Resource {
  id: number;
  title: string;
  stage: Stage;
  phonicsFocus: string;
  grade: Grade;
  type: ResourceType;
  wordCount: number;
  accessible: boolean;
  description: string;
}

const resources: Resource[] = [
  {
    id: 1,
    title: "The Big Red Hen",
    stage: "CVC / Short Vowels",
    phonicsFocus: "Short /e/, /i/",
    grade: "K",
    type: "Book",
    wordCount: 120,
    accessible: true,
    description: "A classic story retold with strictly CVC words. Perfect for early decodable practice.",
  },
  {
    id: 2,
    title: "Slug on a Log",
    stage: "CVC / Short Vowels",
    phonicsFocus: "Short /u/, /o/",
    grade: "K",
    type: "Book",
    wordCount: 98,
    accessible: true,
    description: "Silly rhyming story with /u/ and /o/ words. High engagement for kindergartners.",
  },
  {
    id: 3,
    title: "Camp Mud",
    stage: "Consonant Blends",
    phonicsFocus: "Initial bl, cl, sl, st",
    grade: "1",
    type: "Book",
    wordCount: 210,
    accessible: false,
    description: "Adventures at a muddy summer camp. Introduces initial blends in context.",
  },
  {
    id: 4,
    title: "Blast Off!",
    stage: "Consonant Blends",
    phonicsFocus: "Final -st, -nd, -mp",
    grade: "1",
    type: "Passage",
    wordCount: 145,
    accessible: true,
    description: "A short nonfiction passage about rockets. Great for final blend practice.",
  },
  {
    id: 5,
    title: "Where Is the Fish?",
    stage: "Digraphs",
    phonicsFocus: "sh, th, wh",
    grade: "1",
    type: "Book",
    wordCount: 180,
    accessible: true,
    description: "A search-and-find story packed with digraph words. Predictable text pattern.",
  },
  {
    id: 6,
    title: "Chip and the Cheetah",
    stage: "Digraphs",
    phonicsFocus: "ch, -tch",
    grade: "1",
    type: "Book",
    wordCount: 230,
    accessible: false,
    description: "An unlikely friendship story. Dense ch and -tch practice throughout.",
  },
  {
    id: 7,
    title: "Jake's Cake",
    stage: "Silent E",
    phonicsFocus: "a_e, i_e",
    grade: "1",
    type: "Book",
    wordCount: 195,
    accessible: true,
    description: "A baking story that doubles as a silent-e showcase. Students love the ending.",
  },
  {
    id: 8,
    title: "The Kite Ride",
    stage: "Silent E",
    phonicsFocus: "i_e, o_e",
    grade: "1",
    type: "Passage",
    wordCount: 160,
    accessible: true,
    description: "Nonfiction-style passage about kite flying. Targets i_e and o_e patterns.",
  },
  {
    id: 9,
    title: "Rain on the Train",
    stage: "Vowel Teams",
    phonicsFocus: "ai, ay",
    grade: "2",
    type: "Book",
    wordCount: 290,
    accessible: true,
    description: "A rainy-day adventure packed with ai and ay words from start to finish.",
  },
  {
    id: 10,
    title: "Sneaky Seal Feast",
    stage: "Vowel Teams",
    phonicsFocus: "ee, ea",
    grade: "2",
    type: "Book",
    wordCount: 320,
    accessible: false,
    description: "A humorous story about a seal who crashes a picnic. Targets ee and ea vowel teams.",
  },
  {
    id: 11,
    title: "Deer in the Garden",
    stage: "R-Controlled Vowels",
    phonicsFocus: "er, ir, ur",
    grade: "2",
    type: "Book",
    wordCount: 270,
    accessible: true,
    description: "A problem-solution story about garden visitors. Rich in r-controlled vowel patterns.",
  },
  {
    id: 12,
    title: "Surfing with the Stars",
    stage: "R-Controlled Vowels",
    phonicsFocus: "ar, or",
    grade: "2",
    type: "Passage",
    wordCount: 210,
    accessible: false,
    description: "Nonfiction passage about extreme sports. Focuses on ar and or patterns.",
  },
  {
    id: 13,
    title: "The Unexpected Visit",
    stage: "Multisyllabic",
    phonicsFocus: "Prefixes un-, re-",
    grade: "3",
    type: "Book",
    wordCount: 480,
    accessible: true,
    description: "A chapter book excerpt exploring un- and re- prefixes in a mystery setting.",
  },
  {
    id: 14,
    title: "Reptile Report",
    stage: "Multisyllabic",
    phonicsFocus: "VCCV, VCV patterns",
    grade: "3",
    type: "Passage",
    wordCount: 350,
    accessible: true,
    description: "An informational text about reptiles. Strong VCCV and VCV syllable division practice.",
  },
  {
    id: 15,
    title: "Blends Word Hunt",
    stage: "Consonant Blends",
    phonicsFocus: "All initial blends",
    grade: "1",
    type: "Word List",
    wordCount: 60,
    accessible: true,
    description: "A curated word list for fluency drills and word sorting activities.",
  },
  {
    id: 16,
    title: "Vowel Team Parade",
    stage: "Vowel Teams",
    phonicsFocus: "ai, ay, ee, ea, oa, ow",
    grade: "2",
    type: "Word List",
    wordCount: 80,
    accessible: true,
    description: "Comprehensive word list covering all major vowel teams. Great for weekly review.",
  },
];

const stages: Stage[] = [
  "CVC / Short Vowels",
  "Consonant Blends",
  "Digraphs",
  "Silent E",
  "Vowel Teams",
  "R-Controlled Vowels",
  "Multisyllabic",
];

const grades: Grade[] = ["K", "1", "2", "3"];
const types: ResourceType[] = ["Book", "Passage", "Word List"];

const stageColors: Record<Stage, string> = {
  "CVC / Short Vowels": "bg-sky-100 text-sky-700 border-sky-200",
  "Consonant Blends": "bg-violet-100 text-violet-700 border-violet-200",
  "Digraphs": "bg-amber-100 text-amber-700 border-amber-200",
  "Silent E": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Vowel Teams": "bg-rose-100 text-rose-700 border-rose-200",
  "R-Controlled Vowels": "bg-orange-100 text-orange-700 border-orange-200",
  "Multisyllabic": "bg-teal-100 text-teal-700 border-teal-200",
};

// ─── Components ──────────────────────────────────────────────────────────────

function StagePill({ stage }: { stage: Stage }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${stageColors[stage]}`}>
      {stage}
    </span>
  );
}

function ResourceCard({
  resource,
  added,
  onToggle,
}: {
  resource: Resource;
  added: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5 flex flex-col gap-3 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          <StagePill stage={resource.stage} />
          <span className="text-xs px-2 py-0.5 rounded bg-stone-100 text-stone-500">{resource.type}</span>
        </div>
        <span className="text-xs text-stone-400 shrink-0">Gr. {resource.grade}</span>
      </div>

      <div>
        <h3 className="font-semibold text-stone-900 leading-snug">{resource.title}</h3>
        <p className="text-xs text-stone-500 mt-0.5">{resource.phonicsFocus}</p>
      </div>

      <p className="text-sm text-stone-600 leading-relaxed flex-1">{resource.description}</p>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3 text-xs text-stone-400">
          <span>{resource.wordCount} words</span>
          {resource.accessible && (
            <span className="flex items-center gap-1" title="Accessible version available">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Accessible
            </span>
          )}
        </div>
        <button
          onClick={onToggle}
          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
            added
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-stone-100 text-stone-600 hover:bg-stone-200 border border-transparent"
          }`}
        >
          {added ? "Added ✓" : "Add to Lesson"}
        </button>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Page() {
  const [selectedStages, setSelectedStages] = useState<Set<Stage>>(new Set());
  const [selectedGrades, setSelectedGrades] = useState<Set<Grade>>(new Set());
  const [selectedTypes, setSelectedTypes] = useState<Set<ResourceType>>(new Set());
  const [lessonItems, setLessonItems] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");

  function toggleStage(s: Stage) {
    setSelectedStages((prev) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  }

  function toggleGrade(g: Grade) {
    setSelectedGrades((prev) => {
      const next = new Set(prev);
      next.has(g) ? next.delete(g) : next.add(g);
      return next;
    });
  }

  function toggleType(t: ResourceType) {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  }

  function toggleLesson(id: number) {
    setLessonItems((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const filtered = resources.filter((r) => {
    if (selectedStages.size > 0 && !selectedStages.has(r.stage)) return false;
    if (selectedGrades.size > 0 && !selectedGrades.has(r.grade)) return false;
    if (selectedTypes.size > 0 && !selectedTypes.has(r.type)) return false;
    if (
      search &&
      !r.title.toLowerCase().includes(search.toLowerCase()) &&
      !r.phonicsFocus.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const lessonCount = lessonItems.size;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold tracking-tight text-stone-900">Definitely</span>
            <span className="text-lg font-bold tracking-tight text-emerald-600 ml-1">Decodable</span>
          </div>

          <div className="flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search texts or phonics focus…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-sm px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>

          <button
            className={`flex items-center gap-2 text-sm font-medium px-4 py-1.5 rounded-lg transition-colors border ${
              lessonCount > 0
                ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"
                : "bg-white text-stone-500 border-stone-200 hover:bg-stone-50"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Plan Lesson
            {lessonCount > 0 && (
              <span className="bg-white text-emerald-700 text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {lessonCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 flex gap-6">
        {/* Sidebar */}
        <aside className="w-52 shrink-0 flex flex-col gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
              Phonics Stage
            </p>
            <div className="flex flex-col gap-1">
              {stages.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleStage(s)}
                  className={`text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                    selectedStages.has(s)
                      ? "bg-emerald-50 text-emerald-700 font-medium"
                      : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Grade</p>
            <div className="flex flex-wrap gap-1.5">
              {grades.map((g) => (
                <button
                  key={g}
                  onClick={() => toggleGrade(g)}
                  className={`text-sm w-9 h-9 rounded-lg font-medium transition-colors ${
                    selectedGrades.has(g)
                      ? "bg-emerald-600 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Type</p>
            <div className="flex flex-col gap-1">
              {types.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleType(t)}
                  className={`text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                    selectedTypes.has(t)
                      ? "bg-emerald-50 text-emerald-700 font-medium"
                      : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {(selectedStages.size > 0 || selectedGrades.size > 0 || selectedTypes.size > 0 || search) && (
            <button
              onClick={() => {
                setSelectedStages(new Set());
                setSelectedGrades(new Set());
                setSelectedTypes(new Set());
                setSearch("");
              }}
              className="text-xs text-stone-400 hover:text-stone-600 text-left"
            >
              Clear all filters
            </button>
          )}
        </aside>

        {/* Main */}
        <main className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-stone-500">
              {filtered.length} {filtered.length === 1 ? "resource" : "resources"}
              {selectedStages.size > 0 || selectedGrades.size > 0 || selectedTypes.size > 0 || search
                ? " matching filters"
                : ""}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20 text-stone-400">
              <p className="text-lg font-medium mb-1">No resources found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((r) => (
                <ResourceCard
                  key={r.id}
                  resource={r}
                  added={lessonItems.has(r.id)}
                  onToggle={() => toggleLesson(r.id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
