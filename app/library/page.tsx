"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { generatePassage } from "@/app/actions";
import { useData } from "@/lib/store";
import { SKILLS } from "@/lib/scope";
import type { GradeBand, Passage } from "@/lib/types";
import { cx } from "@/lib/util";
import { Badge, Button, Card, EmptyState, PageHeader, SkillPill } from "@/components/ui";
import { Modal } from "@/components/modal";
import { AssignDialog } from "@/components/assign-dialog";

const BANDS: GradeBand[] = ["3–5", "6–8", "9–12"];

function sourceBadge(source: Passage["source"]) {
  if (source === "ai") return <Badge tone="violet">✨ AI</Badge>;
  if (source === "draft") return <Badge tone="amber">Draft</Badge>;
  return <Badge tone="slate">Library</Badge>;
}

export default function LibraryPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-400">Loading library…</div>}>
      <LibraryInner />
    </Suspense>
  );
}

function LibraryInner() {
  const { data } = useData();
  const searchParams = useSearchParams();
  const initialSkill = searchParams.get("skill") ?? "";

  const [skill, setSkill] = useState(initialSkill);
  const [band, setBand] = useState<GradeBand | "">("");
  const [search, setSearch] = useState("");
  const [genOpen, setGenOpen] = useState(false);
  const [assignPassage, setAssignPassage] = useState<Passage | null>(null);

  const passages = useMemo(() => {
    return data.passages.filter((p) => {
      if (skill && !p.skillTargets.includes(skill)) return false;
      if (band && p.gradeBand !== band) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!p.title.toLowerCase().includes(q) && !p.topic.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [data.passages, skill, band, search]);

  return (
    <>
      <PageHeader
        title="Passage Library"
        subtitle="Skill-tagged texts for grades 3+ — match to a need, or generate a fresh one."
        actions={
          <Button variant="primary" onClick={() => setGenOpen(true)}>
            ✨ Generate passage
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search titles or topics…"
          className="w-full max-w-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 sm:w-auto"
        />
        <select
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <option value="">All skills</option>
          {SKILLS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.shortName}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-0.5 text-xs">
          <button
            onClick={() => setBand("")}
            className={cx("rounded-md px-2.5 py-1 font-medium", band === "" ? "bg-indigo-50 text-indigo-700" : "text-slate-500")}
          >
            All
          </button>
          {BANDS.map((b) => (
            <button
              key={b}
              onClick={() => setBand(b)}
              className={cx("rounded-md px-2.5 py-1 font-medium", band === b ? "bg-indigo-50 text-indigo-700" : "text-slate-500")}
            >
              {b}
            </button>
          ))}
        </div>
        <span className="ml-auto text-sm text-slate-400">{passages.length} texts</span>
      </div>

      {passages.length === 0 ? (
        <EmptyState title="No passages match" hint="Adjust filters, or generate a fresh passage." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {passages.map((p) => (
            <Card key={p.id} className="flex flex-col p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {sourceBadge(p.source)}
                  <span className="text-xs text-slate-400">{p.gradeBand} · L{p.level}</span>
                </div>
                <span className="text-xs text-slate-400">{p.wordCount} words</span>
              </div>
              <Link href={`/passages/${p.id}`}>
                <h3 className="font-semibold leading-snug text-slate-900 hover:text-indigo-600">{p.title}</h3>
              </Link>
              <p className="mt-1 flex-1 text-sm text-slate-500">{p.blurb}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.skillTargets.map((s) => (
                  <SkillPill key={s} skillId={s} />
                ))}
              </div>
              <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                <Button variant="primary" size="sm" onClick={() => setAssignPassage(p)}>
                  Assign
                </Button>
                <Link href={`/passages/${p.id}`}>
                  <Button variant="secondary" size="sm">
                    Open
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      <GenerateDialog open={genOpen} onClose={() => setGenOpen(false)} initialSkillId={skill} />

      {assignPassage && (
        <AssignDialog open={!!assignPassage} onClose={() => setAssignPassage(null)} passage={assignPassage} />
      )}
    </>
  );
}

function GenerateDialog({
  open,
  onClose,
  initialSkillId,
}: {
  open: boolean;
  onClose: () => void;
  initialSkillId: string;
}) {
  const { addPassage } = useData();
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [band, setBand] = useState<GradeBand>("6–8");
  const [words, setWords] = useState(150);
  const [selected, setSelected] = useState<Set<string>>(
    new Set(initialSkillId ? [initialSkillId] : ["closed-syllables"]),
  );
  const [pending, setPending] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function run() {
    if (selected.size === 0 || !topic.trim()) return;
    setPending(true);
    setNote(null);
    try {
      const result = await generatePassage({
        skillIds: [...selected],
        gradeBand: band,
        topic: topic.trim(),
        approxWords: words,
      });
      addPassage(result.passage);
      setNote(result.note);
      setPending(false);
      // Give the teacher a beat to read the provenance note, then open the new text.
      setTimeout(() => {
        onClose();
        router.push(`/passages/${result.passage.id}`);
      }, 1100);
    } catch {
      setPending(false);
      setNote("Something went wrong generating the passage. Please try again.");
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="✨ Generate a fresh passage"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={run} disabled={pending || selected.size === 0 || !topic.trim()}>
            {pending ? "Generating…" : "Generate"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
            Topic / interest
          </label>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. the history of skateboarding"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">Grade band</label>
            <select
              value={band}
              onChange={(e) => setBand(e.target.value as GradeBand)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              {BANDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
              Length: {words} words
            </label>
            <input
              type="range"
              min={80}
              max={280}
              step={10}
              value={words}
              onChange={(e) => setWords(Number(e.target.value))}
              className="mt-2.5 w-full accent-indigo-600"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400">
            Target skills ({selected.size})
          </label>
          <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto">
            {SKILLS.map((s) => {
              const on = selected.has(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => toggle(s.id)}
                  className={cx(
                    "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                    on
                      ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 text-slate-500 hover:bg-slate-50",
                  )}
                >
                  {s.shortName}
                </button>
              );
            })}
          </div>
        </div>

        {note && (
          <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-indigo-700">
            {note}
          </div>
        )}
        {!note && (
          <p className="text-xs text-slate-400">
            Generates with Claude when an API key is configured; otherwise produces a clearly-labeled
            offline draft so the workflow still works.
          </p>
        )}
      </div>
    </Modal>
  );
}
