"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useData } from "@/lib/store";
import {
  classAverages,
  classMetricTrend,
  recentSessions,
  series,
  sessionsForStudent,
  skillGapCounts,
  studentsNeedingAttention,
} from "@/lib/analytics";
import { recommendForStudent } from "@/lib/recommend";
import { skillName } from "@/lib/scope";
import { relativeDate } from "@/lib/util";
import { Avatar, Badge, Card, PageHeader, SectionTitle, SkillPill, Stat } from "@/components/ui";
import { BarList, GrowthChart, Sparkline } from "@/components/charts";

export default function DashboardPage() {
  const { data } = useData();

  const averages = useMemo(() => classAverages(data), [data]);
  const attention = useMemo(() => studentsNeedingAttention(data, 5), [data]);
  const gaps = useMemo(
    () => skillGapCounts(data).filter((g) => g.studentIds.length > 0).slice(0, 6),
    [data],
  );
  const recent = useMemo(() => recentSessions(data, 6), [data]);
  const trend = useMemo(() => classMetricTrend(data, "accuracy"), [data]);

  const passageTitle = (id: string) => data.passages.find((p) => p.id === id)?.title ?? "Passage";

  return (
    <>
      <PageHeader
        title="Class Dashboard"
        subtitle="Where your readers are today — and exactly what to do next."
      />

      {/* Headline metrics */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="p-4">
          <Stat label="Readers" value={data.students.length} sub="active this term" />
        </Card>
        <Card className="p-4">
          <Stat label="Avg accuracy" value={`${averages.accuracy}%`} accent="text-indigo-600" sub="decoding, all skills" />
        </Card>
        <Card className="p-4">
          <Stat label="Avg fluency" value={averages.wcpm} sub="words correct / min" />
        </Card>
        <Card className="p-4">
          <Stat label="Avg comprehension" value={`${averages.comprehension}%`} sub="question accuracy" />
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          <section>
            <SectionTitle action={<Link href="/students" className="text-xs font-medium text-indigo-600 hover:underline">All students →</Link>}>
              Needs attention
            </SectionTitle>
            <Card className="divide-y divide-slate-100">
              {attention.map(({ student, gapCount }) => {
                const rec = recommendForStudent(student, data);
                const acc = series(sessionsForStudent(data, student.id), "accuracy").map((p) => p.value);
                return (
                  <div key={student.id} className="flex items-center gap-3 p-3.5">
                    <Link href={`/students/${student.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                      <Avatar name={student.name} hue={student.avatarHue} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{student.name}</p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <SkillPill skillId={student.focusSkillId} />
                          {gapCount > 0 && <Badge tone="rose">{gapCount} gaps</Badge>}
                        </div>
                      </div>
                    </Link>
                    <div className="hidden sm:block">
                      <Sparkline values={acc} className="text-indigo-400" />
                    </div>
                    {rec && (
                      <Link
                        href={`/passages/${rec.passage.id}`}
                        className="hidden shrink-0 text-right md:block"
                        title={rec.reason}
                      >
                        <p className="text-xs text-slate-400">Recommended</p>
                        <p className="max-w-[150px] truncate text-sm font-medium text-indigo-600 hover:underline">
                          {rec.passage.title}
                        </p>
                      </Link>
                    )}
                  </div>
                );
              })}
            </Card>
          </section>

          <section>
            <SectionTitle>Recent readings</SectionTitle>
            <Card className="divide-y divide-slate-100">
              {recent.map((s) => {
                const student = data.students.find((st) => st.id === s.studentId);
                if (!student) return null;
                return (
                  <div key={s.id} className="flex items-center gap-3 p-3.5">
                    <Avatar name={student.name} hue={student.avatarHue} size={32} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-slate-700">
                        <span className="font-medium text-slate-900">{student.name}</span> read{" "}
                        <Link href={`/passages/${s.passageId}`} className="font-medium text-indigo-600 hover:underline">
                          {passageTitle(s.passageId)}
                        </Link>
                      </p>
                      <p className="text-xs text-slate-400">{relativeDate(s.date)} · {s.wcpm} wcpm</p>
                    </div>
                    <Badge tone={s.accuracy >= 95 ? "emerald" : s.accuracy >= 90 ? "amber" : "rose"}>
                      {s.accuracy}%
                    </Badge>
                  </div>
                );
              })}
            </Card>
          </section>
        </div>

        {/* Right rail */}
        <div className="space-y-6">
          <Card className="p-4">
            <SectionTitle>Class accuracy trend</SectionTitle>
            <GrowthChart points={trend} domain={[60, 100]} unit="%" color="#4f46e5" />
            <p className="mt-2 text-xs text-slate-400">Average decoding accuracy by week.</p>
          </Card>

          <Card className="p-4">
            <SectionTitle action={<Link href="/groups" className="text-xs font-medium text-indigo-600 hover:underline">Group →</Link>}>
              Top skill gaps
            </SectionTitle>
            <BarList
              items={gaps.map((g) => ({
                label: skillName(g.skillId),
                value: g.studentIds.length,
                barClass: "bg-rose-400",
              }))}
            />
            <p className="mt-3 text-xs text-slate-400">Students currently showing a gap, by skill.</p>
          </Card>
        </div>
      </div>
    </>
  );
}
