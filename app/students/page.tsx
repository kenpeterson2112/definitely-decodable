"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useData } from "@/lib/store";
import { sessionsForStudent, series, statusCounts } from "@/lib/analytics";
import { SKILLS } from "@/lib/scope";
import { cx, gradeBandFor } from "@/lib/util";
import type { Student } from "@/lib/types";
import { Avatar, Card, EmptyState, PageHeader, SkillPill } from "@/components/ui";
import { Sparkline } from "@/components/charts";

type SortKey = "attention" | "name" | "accuracy";

export default function StudentsPage() {
  const { data } = useData();
  const [search, setSearch] = useState("");
  const [gapSkill, setGapSkill] = useState<string>("");
  const [sort, setSort] = useState<SortKey>("attention");

  const students = useMemo(() => {
    let list = [...data.students];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q));
    }
    if (gapSkill) {
      list = list.filter((s) => s.skills[gapSkill]?.status === "gap");
    }
    list.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "accuracy") return a.accuracy - b.accuracy;
      const ga = Object.values(a.skills).filter((m) => m.status === "gap").length;
      const gb = Object.values(b.skills).filter((m) => m.status === "gap").length;
      return gb - ga || a.accuracy - b.accuracy;
    });
    return list;
  }, [data.students, search, gapSkill, sort]);

  return (
    <>
      <PageHeader
        title="Students"
        subtitle={`${data.students.length} readers · grades ${Math.min(...data.students.map((s) => s.grade))}–${Math.max(
          ...data.students.map((s) => s.grade),
        )}`}
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search students…"
          className="w-full max-w-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 sm:w-auto"
        />
        <select
          value={gapSkill}
          onChange={(e) => setGapSkill(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <option value="">Any skill gap</option>
          {SKILLS.map((s) => (
            <option key={s.id} value={s.id}>
              Gap: {s.shortName}
            </option>
          ))}
        </select>
        <div className="ml-auto flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-0.5 text-xs">
          {(["attention", "accuracy", "name"] as SortKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setSort(k)}
              className={cx(
                "rounded-md px-2.5 py-1 font-medium capitalize transition-colors",
                sort === k ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:text-slate-700",
              )}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {students.length === 0 ? (
        <EmptyState title="No students match" hint="Try clearing the filters." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {students.map((s) => (
            <StudentCard key={s.id} student={s} data={data} />
          ))}
        </div>
      )}
    </>
  );
}

function StudentCard({ student, data }: { student: Student; data: ReturnType<typeof useData>["data"] }) {
  const counts = statusCounts(student);
  const acc = series(sessionsForStudent(data, student.id), "accuracy").map((p) => p.value);

  return (
    <Link href={`/students/${student.id}`}>
      <Card className="p-4 transition-shadow hover:shadow-md">
        <div className="flex items-start gap-3">
          <Avatar name={student.name} hue={student.avatarHue} size={44} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-slate-900">{student.name}</p>
            <p className="text-xs text-slate-400">
              Grade {student.grade} · {gradeBandFor(student.grade)}
            </p>
          </div>
          <Sparkline values={acc} width={64} height={24} className="text-indigo-400" />
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-slate-400">Focus</span>
          <SkillPill skillId={student.focusSkillId} />
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center">
          <div>
            <p className="text-base font-bold tabular-nums text-slate-900">{student.accuracy}%</p>
            <p className="text-[10px] uppercase tracking-wide text-slate-400">Accuracy</p>
          </div>
          <div>
            <p className="text-base font-bold tabular-nums text-slate-900">{student.wcpm}</p>
            <p className="text-[10px] uppercase tracking-wide text-slate-400">WCPM</p>
          </div>
          <div>
            <p className="text-base font-bold tabular-nums text-slate-900">{student.comprehension}%</p>
            <p className="text-[10px] uppercase tracking-wide text-slate-400">Compr.</p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            {counts.gap} gaps
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            {counts.developing} developing
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {counts.secure} secure
          </span>
        </div>
      </Card>
    </Link>
  );
}
