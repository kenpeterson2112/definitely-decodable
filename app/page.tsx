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
  content: string[];
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
    content: [
      "The hen sat in the pen. She had ten eggs. Jen and Bev ran to look.",
      "“Will they hatch?” said Jen. “Yes, but we must wait,” said Bev.",
      "They sat by the pen and did not fret. Then one egg got a crack in it!",
      "A wet, little chick sat up. The hen was glad. Jen and Bev were glad too.",
    ],
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
    content: [
      "A slug sat on a log in the mud. “I am stuck,” said the slug.",
      "A bug ran up. “Tug and pull,” said the bug. They tugged and tugged.",
      "Plop! The slug rolled off the log and into the mud.",
      "“Fun!” said the slug. The bug had fun too. They sat in the mud all day.",
    ],
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
    content: [
      "At Camp Mud, the kids slept in tents and ran down the slick, sloppy hill.",
      "Clint grabbed a stick to stir the thick, black mud. “Let's build a fort!” said Clint.",
      "They stacked sticks and slid mud on top. By the end, the fort stood tall and strong.",
      "Camp Mud was the best week of the summer.",
    ],
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
    content: [
      "A rocket can blast off fast. First, it must stand on a launch pad.",
      "Then a crew checks each part and runs a test. When it is time, the engines burst with light.",
      "The rocket lifts off the land and zooms past the clouds.",
      "It does not stop until it is in space.",
    ],
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
    content: [
      "Where is the fish? It is not in the dish. It is not on the path.",
      "Look! It is in the bath, under a wide, flat shell.",
      "Wish you could see it shimmer and flash! The fish swishes its tail and dashes off, then hides with a splash.",
      "Where will it go next?",
    ],
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
    content: [
      "Chip the chick did not match the other chicks on the ranch.",
      "He liked to watch the cheetah stretch and catch bugs by the ditch.",
      "One day, Chip got stuck in a patch of thatch. The cheetah saw him and gave a quick tug.",
      "From then on, Chip and the cheetah were the best of pals.",
    ],
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
    content: [
      "Jake wants to bake a cake. He gets a plate, a cup, and a pan.",
      "He shakes in flour and a pinch of salt. Then he stirs and stirs.",
      "He slides the cake in to bake. While it bakes, Jake takes a short hike outside.",
      "When he comes back, the cake is done — and it smells just fine!",
    ],
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
    content: [
      "Mike likes to fly his kite by the lake. The wind blows, and the kite rides high in the sky.",
      "It dives, glides, and twists in time with the breeze.",
      "Mike smiles as he holds tight to the line. The kite shines like a star against the white clouds.",
      "It is the best ride yet.",
    ],
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
    content: [
      "On a rainy day, Gail and Jay rode the train. Rain ran down the windowpane in tiny trails.",
      "“I hope it does not rain all day,” said Gail.",
      "The train sailed past a bay, a plain, and a tray of hay.",
      "By the time they reached the station, the rain had gone away, and the sun came out to play.",
    ],
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
    content: [
      "At the beach, a sneaky seal crept near a picnic to eat a treat.",
      "He saw cheese, peaches, and a sweet bean salad. He reached out and — whoosh — grabbed a peach in his teeth!",
      "The kids laughed to see him sneak away.",
      "He waved his fins and dove deep into the sea, pleased with his feast.",
    ],
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
    content: [
      "Each morning, a deer slips into the garden to nibble herbs and ferns.",
      "The girl who tends the garden is not stirred — she just smiles and waits.",
      "One day, she sets out a bird feeder near the curb to give the deer something else to munch on.",
      "After that, the deer turns toward the feeder first, and the herbs are safe.",
    ],
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
    content: [
      "At the shore, surfers wait for the perfect wave. Some sport boards that are short; others like them long and broad.",
      "The crowd roars as a surfer carves a sharp turn near the shore.",
      "Stars of the sport perform tricks that seem to defy the storm of spray around them.",
      "It's a sport for the bold and the hardy.",
    ],
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
    content: [
      "Mara was unhappy when her plans were unexpectedly canceled.",
      "She decided to rebuild her schedule and revisit an old hobby instead.",
      "As she unpacked a dusty box, she found a letter she had never read. It was unsigned, but the handwriting looked familiar.",
      "Mara couldn't resist — she had to uncover who had written it.",
    ],
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
    content: [
      "Reptiles are animals with dry, scaly skin.",
      "Most reptiles, such as lizards and snakes, live on land, though some, like turtles, spend time in water.",
      "Unlike mammals, reptiles cannot regulate their own body temperature, so they often rest in sunlight to get warm.",
      "Scientists continue to study how reptiles survive in such a wide variety of habitats.",
    ],
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
    content: [
      "bl — black, blast, bloom, blend",
      "cl — clap, clip, clock, club",
      "sl — slip, slug, sled, slow",
      "st — stop, stamp, stand, step",
    ],
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
    content: [
      "ai / ay — rain, mail, paint, play, stay, tray",
      "ee / ea — tree, seed, sleep, leaf, team, beach",
      "oa / ow — boat, coat, soap, snow, grow, slow",
    ],
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

function ResourceCard({ resource, onOpen }: { resource: Resource; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="text-left bg-white rounded-xl border border-stone-200 p-5 flex flex-col gap-3 hover:shadow-sm hover:border-stone-300 transition-all"
    >
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
        <span className="text-xs font-medium px-3 py-1.5 rounded-lg bg-stone-100 text-stone-600">
          Open →
        </span>
      </div>
    </button>
  );
}

function ResourceModal({ resource, onClose }: { resource: Resource; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-stone-900/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-stone-100 flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              <StagePill stage={resource.stage} />
              <span className="text-xs px-2 py-0.5 rounded bg-stone-100 text-stone-500">{resource.type}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-stone-100 text-stone-500">Grade {resource.grade}</span>
            </div>
            <h2 className="text-xl font-semibold text-stone-900">{resource.title}</h2>
            <p className="text-sm text-stone-500 mt-0.5">{resource.phonicsFocus} · {resource.wordCount} words</p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 shrink-0 rounded-lg p-1.5 hover:bg-stone-100 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {resource.type === "Word List" ? (
            <div className="flex flex-col gap-2">
              {resource.content.map((line, i) => (
                <p key={i} className="text-base text-stone-700 leading-relaxed font-mono bg-stone-50 rounded-lg px-4 py-2.5 border border-stone-100">
                  {line}
                </p>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {resource.content.map((paragraph, i) => (
                <p key={i} className="text-base text-stone-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          )}

          {resource.accessible && (
            <p className="text-xs text-stone-400 flex items-center gap-1.5 pt-2 border-t border-stone-100">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              An accessible version of this resource is available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Page() {
  const [selectedStages, setSelectedStages] = useState<Set<Stage>>(new Set());
  const [selectedGrades, setSelectedGrades] = useState<Set<Grade>>(new Set());
  const [selectedTypes, setSelectedTypes] = useState<Set<ResourceType>>(new Set());
  const [search, setSearch] = useState("");
  const [openResource, setOpenResource] = useState<Resource | null>(null);

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
                <ResourceCard key={r.id} resource={r} onOpen={() => setOpenResource(r)} />
              ))}
            </div>
          )}
        </main>
      </div>

      {openResource && <ResourceModal resource={openResource} onClose={() => setOpenResource(null)} />}
    </div>
  );
}
