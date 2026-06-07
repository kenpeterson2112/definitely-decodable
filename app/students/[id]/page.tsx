"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useData, useStudent } from "@/lib/store";
import {
  errorPatterns,
  growthDelta,
  series,
  sessionsForStudent,
} from "@/lib/analytics";
import { recommendPassages } from "@/lib/recommend";
import { DOMAINS, SKILLS, skillName } from "@/lib/scope";
import type { Passage } from "@/lib/types";
import { cx, gradeBandFor, relativeDate, statusStyle } from "@/lib/util";
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  MasteryBadge,
  PageHeader,
  ProgressBar,
  SectionTitle,
  SkillPill,
  TrendArrow,
} from "@/components/ui";
import { BarList, GrowthChart } from "@/components/charts";
import { AssignDialog } from "@/components/assign-dialog";

export default function StudentProfilePage() {
  const params = useParams<{ id: string }>();
  const { data } = useData();
  const student = useStudent(params.id);
  const [assignPassage, setAssignPassage] = useState<Passage | null>(null);

  const sessions = useMemo(
    () => (student ? sessionsForStudent(data, student.id) : []),
    [data, student],
  );
  const recs = useMemo(
    () => (student ? recommendPassages({ student, skillId: student.focusSkillId, data, limit: 3 }) : []),
    [student, data],
  );
  const errors = useMemo(() => errorPatterns(sessions), [sessions]);

  if (!student) {
    return <EmptyState title="Student not found" hint="They may have been removed from the roster." />;
  }

  const metrics = [
    { key: "accuracy" as const, label: "Decoding accuracy", value: `${student.accuracy}%`, color: "#4f46e5", domain: [50, 100] as [number, number], unit: "%" },
    { key: "wcpm" as const, label: "Fluency (WCPM)", value: `${student.wcpm}`, color: "#0d9488", domain: undefined, unit: "" },
    { key: "comprehension" as const, label: "Comprehension", value: `${student.comprehension}%`, color: "#d97706", domain: [40, 100] as [number, number], unit: "%" },
  ];

  return (
    <>
      <Link href="/students" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        ← All students
      </Link>

      <PageHeader
        title={student.name}
        subtitle={`Grade ${student.grade} · ${gradeBandFor(student.grade)} · ${sessions.length} readings logged`}
        actions={
          recs[0] && (
            <Button variant="primary" onClick={() => setAssignPassage(recs[0].passage)}>
              ✚ Reteach {skillName(student.focusSkillId)}
            </Button>
          )
        }
      />

      <div className="mb-6 flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
        <Avatar name={student.name} hue={student.avatarHue} size={52} />
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-500">Current focus</span>
          <SkillPill skillId={student.focusSkillId} />
          <span className="text-sm text-slate-400">·</span>
          <span className="text-sm text-slate-600">{SKILLS.find((s) => s.id === student.focusSkillId)?.focus}</span>
        </div>
      </div>

      {/* Metric cards with growth */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {metrics.map((m) => {
          const pts = series(sessions, m.key);
          const delta = growthDelta(sessions, m.key);
          return (
            <Card key={m.key} className="p-4">
              <div className="flex items-baseline justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{m.label}</p>
                <span className="text-xs font-semibold">
                  <TrendArrow value={delta} />
                </span>
              </div>
              <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{m.value}</p>
              <div className="mt-1">
                <GrowthChart points={pts} height={64} color={m.color} domain={m.domain} unit={m.unit} />
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Skill profile */}
        <div className="lg:col-span-2">
          <SectionTitle>Skill profile</SectionTitle>
          <Card className="p-4">
            {DOMAINS.map((domain) => (
              <div key={domain} className="mb-5 last:mb-0">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">{domain}</p>
                <div className="space-y-2.5">
                  {SKILLS.filter((s) => s.domain === domain).map((skill) => {
                    const m = student.skills[skill.id];
                    if (!m) return null;
                    const style = statusStyle(m.status);
                    return (
                      <div key={skill.id} className="flex items-center gap-3">
                        <div className="w-40 shrink-0 truncate text-sm text-slate-700" title={skill.name}>
                          {skill.shortName}
                        </div>
                        <ProgressBar value={m.mastery} barClass={style.bar} className="flex-1" />
                        <div className="w-9 shrink-0 text-right text-xs tabular-nums text-slate-500">{m.mastery}</div>
                        <div className="w-24 shrink-0 text-right">
                          <MasteryBadge status={m.status} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </Card>
        </div>

        {/* Error patterns */}
        <div>
          <SectionTitle>Error patterns</SectionTitle>
          <Card className="p-4">
            {errors.length === 0 ? (
              <p className="text-sm text-slate-400">No miscues recorded yet.</p>
            ) : (
              <>
                <BarList
                  items={errors.slice(0, 7).map((e) => ({
                    label: skillName(e.skillId),
                    value: e.count,
                    barClass: "bg-rose-400",
                  }))}
                />
                <p className="mt-3 text-xs text-slate-400">
                  Miscues grouped by the skill they implicate, across all readings.
                </p>
              </>
            )}
          </Card>
        </div>
      </div>

      {/* Recommendations */}
      <section className="mt-6">
        <SectionTitle action={<Link href={`/library?skill=${student.focusSkillId}`} className="text-xs font-medium text-indigo-600 hover:underline">More in library →</Link>}>
          Recommended next — {skillName(student.focusSkillId)}
        </SectionTitle>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {recs.map((rec) => (
            <Card key={rec.passage.id} className="flex flex-col p-4">
              <div className="flex items-center justify-between">
                <SkillPill skillId={student.focusSkillId} />
                <Badge tone="indigo">{rec.fit}% fit</Badge>
              </div>
              <Link href={`/passages/${rec.passage.id}?student=${student.id}`} className="mt-2">
                <p className="font-semibold text-slate-900 hover:text-indigo-600">{rec.passage.title}</p>
              </Link>
              <p className="mt-1 flex-1 text-sm text-slate-500">{rec.passage.blurb}</p>
              <p className="mt-2 text-xs capitalize text-slate-400">{rec.reason}</p>
              <div className="mt-3 flex gap-2">
                <Button variant="primary" size="sm" onClick={() => setAssignPassage(rec.passage)}>
                  Assign
                </Button>
                <Link href={`/passages/${rec.passage.id}?student=${student.id}`}>
                  <Button variant="secondary" size="sm">
                    Open
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Reading history */}
      <section className="mt-6">
        <SectionTitle>Reading history</SectionTitle>
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-2.5 font-medium">Date</th>
                <th className="px-4 py-2.5 font-medium">Passage</th>
                <th className="px-4 py-2.5 text-right font-medium">Acc.</th>
                <th className="px-4 py-2.5 text-right font-medium">WCPM</th>
                <th className="px-4 py-2.5 text-right font-medium">Compr.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[...sessions].reverse().map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 text-slate-500">{relativeDate(s.date)}</td>
                  <td className="px-4 py-2.5">
                    <Link href={`/passages/${s.passageId}`} className="text-slate-700 hover:text-indigo-600">
                      {data.passages.find((p) => p.id === s.passageId)?.title ?? "Passage"}
                    </Link>
                  </td>
                  <td className={cx("px-4 py-2.5 text-right tabular-nums", s.accuracy >= 95 ? "text-emerald-600" : s.accuracy >= 90 ? "text-amber-600" : "text-rose-600")}>
                    {s.accuracy}%
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-slate-600">{s.wcpm}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-slate-600">{s.comprehension}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      {assignPassage && (
        <AssignDialog
          open={!!assignPassage}
          onClose={() => setAssignPassage(null)}
          passage={assignPassage}
          defaultStudentIds={[student.id]}
          skillId={student.focusSkillId}
        />
      )}
    </>
  );
}
