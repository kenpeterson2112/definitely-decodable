"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useData, usePassage } from "@/lib/store";
import type { Miscue, MiscueType } from "@/lib/types";
import { cx } from "@/lib/util";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
  SkillPill,
} from "@/components/ui";
import { AssignDialog } from "@/components/assign-dialog";

// Miscue cycle order when tapping a word (after the 5th tap it clears).
const CYCLE: MiscueType[] = ["substitution", "omission", "insertion", "self-correct", "hesitation"];
const ERROR_TYPES = new Set<MiscueType>(["substitution", "omission", "insertion"]);

const MISCUE_STYLE: Record<MiscueType, string> = {
  substitution: "bg-rose-100 text-rose-700 underline decoration-rose-400 decoration-2",
  omission: "bg-slate-200 text-slate-400 line-through",
  insertion: "bg-emerald-100 text-emerald-700 underline decoration-emerald-400 decoration-2",
  "self-correct": "bg-amber-100 text-amber-700 underline decoration-wavy decoration-amber-400",
  hesitation: "bg-amber-50 text-amber-600",
};

const MISCUE_LABEL: Record<MiscueType, string> = {
  substitution: "Substitution",
  omission: "Omission",
  insertion: "Insertion",
  "self-correct": "Self-correct",
  hesitation: "Hesitation",
};

interface Token {
  text: string;
  isWord: boolean;
  wordIndex: number; // -1 for whitespace
}

function tokenize(text: string): { paragraphs: Token[][]; wordCount: number } {
  const paragraphs = text.split(/\n\n+/);
  let wordIndex = 0;
  const out = paragraphs.map((para) =>
    para.split(/(\s+)/).map((chunk): Token => {
      const isWord = /\S/.test(chunk);
      return { text: chunk, isWord, wordIndex: isWord ? wordIndex++ : -1 };
    }),
  );
  return { paragraphs: out, wordCount: wordIndex };
}

function clean(word: string): string {
  return word.replace(/[^A-Za-z'-]/g, "");
}

export default function PassagePage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-400">Loading passage…</div>}>
      <PassageInner />
    </Suspense>
  );
}

function PassageInner() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data, recordSession } = useData();
  const passage = usePassage(params.id);

  const [recording, setRecording] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [studentId, setStudentId] = useState(searchParams.get("student") ?? "");
  const [marks, setMarks] = useState<Record<number, MiscueType>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  // Track only questions marked wrong; everything else counts as correct.
  const [missed, setMissed] = useState<Set<string>>(new Set());

  // Timer
  const [running, setRunning] = useState(false);
  const [startTs, setStartTs] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [saved, setSaved] = useState(false);

  const tokens = useMemo(() => (passage ? tokenize(passage.text) : { paragraphs: [], wordCount: 0 }), [passage]);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setElapsed(Math.max(0, (Date.now() - startTs) / 1000)), 250);
    return () => clearInterval(t);
  }, [running, startTs]);

  if (!passage) {
    return <EmptyState title="Passage not found" hint="It may have been removed." />;
  }

  const errorCount = Object.values(marks).filter((t) => ERROR_TYPES.has(t)).length;
  const markedCount = Object.keys(marks).length;
  const total = tokens.wordCount || 1;
  const accuracy = Math.round(((total - errorCount) / total) * 100);
  const wcpm = elapsed > 0 ? Math.round((total - errorCount) / (elapsed / 60)) : 0;
  const compCorrect = passage.questions.length - missed.size;
  const comprehension =
    passage.questions.length > 0 ? Math.round((compCorrect / passage.questions.length) * 100) : 100;
  const targetSet = new Set(passage.targetWords.map((w) => w.toLowerCase()));

  function cycleWord(idx: number) {
    if (!recording) return;
    setMarks((prev) => {
      const cur = prev[idx];
      const next = { ...prev };
      if (!cur) next[idx] = CYCLE[0];
      else {
        const i = CYCLE.indexOf(cur);
        if (i === CYCLE.length - 1) delete next[idx];
        else next[idx] = CYCLE[i + 1];
      }
      return next;
    });
  }

  function save() {
    if (!studentId || !passage) return;
    const miscues: Miscue[] = Object.entries(marks).map(([idx, type], i) => {
      const token = tokens.paragraphs.flat().find((t) => t.wordIndex === Number(idx));
      return {
        word: token ? clean(token.text) : "",
        type,
        skillId: passage.skillTargets[i % passage.skillTargets.length],
      };
    });
    recordSession({
      studentId,
      passageId: passage.id,
      accuracy,
      wcpm,
      comprehension,
      miscues,
      skillTargets: passage.skillTargets,
    });
    setSaved(true);
    setTimeout(() => router.push(`/students/${studentId}`), 1200);
  }

  const student = data.students.find((s) => s.id === studentId);

  return (
    <>
      <Link href="/library" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        ← Library
      </Link>

      <PageHeader
        title={passage.title}
        subtitle={`${passage.gradeBand} · Level ${passage.level} · ${passage.wordCount} words · ${passage.topic}`}
        actions={
          <>
            <Button variant="secondary" onClick={() => setAssignOpen(true)}>
              Assign
            </Button>
            <Button variant={recording ? "danger" : "primary"} onClick={() => setRecording((r) => !r)}>
              {recording ? "Exit recording" : "● Record a reading"}
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        {passage.skillTargets.map((s) => (
          <SkillPill key={s} skillId={s} />
        ))}
        {passage.source === "ai" && <Badge tone="violet">✨ AI-generated</Badge>}
        {passage.source === "draft" && <Badge tone="amber">Offline draft</Badge>}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Reading area */}
        <div className="lg:col-span-2">
          {recording && <RunningRecordBar />}

          <Card className="p-6 md:p-8">
            <div className="space-y-4 text-[17px] leading-8 text-slate-800">
              {tokens.paragraphs.map((para, pi) => (
                <p key={pi}>
                  {para.map((tok, ti) => {
                    if (!tok.isWord) return <span key={ti}>{tok.text}</span>;
                    const mark = marks[tok.wordIndex];
                    const isTarget = targetSet.has(clean(tok.text).toLowerCase());
                    return (
                      <span
                        key={ti}
                        onClick={() => cycleWord(tok.wordIndex)}
                        className={cx(
                          "rounded px-0.5",
                          recording && "cursor-pointer hover:bg-slate-100",
                          mark && MISCUE_STYLE[mark],
                          !mark && !recording && isTarget && "underline decoration-indigo-300 decoration-2 underline-offset-2",
                        )}
                        title={mark ? MISCUE_LABEL[mark] : undefined}
                      >
                        {tok.text}
                      </span>
                    );
                  })}
                </p>
              ))}
            </div>
          </Card>

          {!recording && (
            <p className="mt-2 text-xs text-slate-400">
              <span className="underline decoration-indigo-300 decoration-2 underline-offset-2">Underlined</span>{" "}
              words are decodable focus words for this passage&apos;s target skills.
            </p>
          )}
        </div>

        {/* Right rail */}
        <div className="space-y-6">
          {recording ? (
            <RecordingPanel
              students={data.students}
              studentId={studentId}
              setStudentId={setStudentId}
              running={running}
              elapsed={elapsed}
              onStart={() => {
                setStartTs(Date.now() - elapsed * 1000);
                setRunning(true);
              }}
              onStop={() => setRunning(false)}
              onReset={() => {
                setRunning(false);
                setElapsed(0);
                setMarks({});
              }}
              accuracy={accuracy}
              wcpm={wcpm}
              comprehension={comprehension}
              errorCount={errorCount}
              markedCount={markedCount}
              canSave={!!studentId && elapsed > 0}
              saved={saved}
              onSave={save}
              studentName={student?.name}
              questions={passage.questions}
              correct={Object.fromEntries(passage.questions.map((q) => [q.id, !missed.has(q.id)]))}
              onToggleCorrect={(id) =>
                setMissed((m) => {
                  const next = new Set(m);
                  if (next.has(id)) next.delete(id);
                  else next.add(id);
                  return next;
                })
              }
            />
          ) : (
            <>
              <Card className="p-4">
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-400">Vocabulary</h3>
                <dl className="space-y-2.5">
                  {passage.vocabulary.map((v) => (
                    <div key={v.word}>
                      <dt className="text-sm font-semibold text-slate-800">{v.word}</dt>
                      <dd className="text-sm text-slate-500">{v.definition}</dd>
                    </div>
                  ))}
                </dl>
              </Card>

              <Card className="p-4">
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
                  Comprehension
                </h3>
                <ol className="space-y-3">
                  {passage.questions.map((q, i) => (
                    <li key={q.id}>
                      <p className="text-sm text-slate-700">
                        <span className="font-semibold text-slate-900">{i + 1}.</span> {q.prompt}{" "}
                        <Badge tone="slate">{q.type}</Badge>
                      </p>
                      <button
                        onClick={() => setRevealed((r) => ({ ...r, [q.id]: !r[q.id] }))}
                        className="mt-1 text-xs font-medium text-indigo-600 hover:underline"
                      >
                        {revealed[q.id] ? "Hide answer" : "Show answer"}
                      </button>
                      {revealed[q.id] && <p className="mt-1 text-sm text-slate-500">{q.answer}</p>}
                    </li>
                  ))}
                </ol>
              </Card>
            </>
          )}
        </div>
      </div>

      <AssignDialog open={assignOpen} onClose={() => setAssignOpen(false)} passage={passage} />
    </>
  );
}

function RunningRecordBar() {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs">
      <span className="font-semibold text-slate-500">Tap a word to mark:</span>
      {CYCLE.map((t) => (
        <span key={t} className={cx("rounded px-1.5 py-0.5", MISCUE_STYLE[t])}>
          {MISCUE_LABEL[t]}
        </span>
      ))}
    </div>
  );
}

function Readout({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-2 text-center">
      <p className={cx("text-xl font-bold tabular-nums", accent)}>{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-slate-400">{label}</p>
    </div>
  );
}

function RecordingPanel(props: {
  students: { id: string; name: string }[];
  studentId: string;
  setStudentId: (id: string) => void;
  running: boolean;
  elapsed: number;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  accuracy: number;
  wcpm: number;
  comprehension: number;
  errorCount: number;
  markedCount: number;
  canSave: boolean;
  saved: boolean;
  onSave: () => void;
  studentName?: string;
  questions: { id: string; prompt: string }[];
  correct: Record<string, boolean>;
  onToggleCorrect: (id: string) => void;
}) {
  const mins = Math.floor(props.elapsed / 60);
  const secs = Math.floor(props.elapsed % 60);
  const timeStr = `${mins}:${secs.toString().padStart(2, "0")}`;

  return (
    <Card className="p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">Running record</h3>

      <label className="mb-1 block text-xs font-medium text-slate-500">Reader</label>
      <select
        value={props.studentId}
        onChange={(e) => props.setStudentId(e.target.value)}
        className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
      >
        <option value="">Select a student…</option>
        {props.students.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <div className="mb-3 flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
        <span className="font-mono text-lg tabular-nums text-slate-800">{timeStr}</span>
        <div className="flex gap-1.5">
          {!props.running ? (
            <Button size="sm" variant="primary" onClick={props.onStart}>
              {props.elapsed > 0 ? "Resume" : "Start"}
            </Button>
          ) : (
            <Button size="sm" variant="secondary" onClick={props.onStop}>
              Pause
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={props.onReset}>
            Reset
          </Button>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2">
        <Readout label="Accuracy" value={`${props.accuracy}%`} accent={props.accuracy >= 95 ? "text-emerald-600" : props.accuracy >= 90 ? "text-amber-600" : "text-rose-600"} />
        <Readout label="WCPM" value={`${props.wcpm}`} accent="text-slate-900" />
        <Readout label="Errors" value={`${props.errorCount}`} accent="text-slate-900" />
      </div>

      <div className="mb-3">
        <p className="mb-1.5 text-xs font-medium text-slate-500">Comprehension ({props.comprehension}%)</p>
        <ul className="space-y-1.5">
          {props.questions.map((q, i) => {
            const ok = props.correct[q.id];
            return (
              <li key={q.id} className="flex items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-xs text-slate-600" title={q.prompt}>
                  {i + 1}. {q.prompt}
                </span>
                <button
                  onClick={() => props.onToggleCorrect(q.id)}
                  className={cx(
                    "shrink-0 rounded-md border px-2 py-0.5 text-xs font-medium",
                    ok
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-rose-200 bg-rose-50 text-rose-700",
                  )}
                >
                  {ok ? "✓ Correct" : "✗ Missed"}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {props.saved ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Saved — updating {props.studentName ?? "student"}&apos;s profile…
        </div>
      ) : (
        <Button variant="primary" className="w-full" onClick={props.onSave} disabled={!props.canSave}>
          Save reading
        </Button>
      )}
      {!props.canSave && !props.saved && (
        <p className="mt-1.5 text-center text-xs text-slate-400">
          Pick a reader and run the timer to save.
        </p>
      )}
    </Card>
  );
}
