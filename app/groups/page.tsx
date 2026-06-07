"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useData } from "@/lib/store";
import { suggestGroups } from "@/lib/analytics";
import { difficultyTarget } from "@/lib/recommend";
import { SKILL_BY_ID } from "@/lib/scope";
import type { Passage } from "@/lib/types";
import { gradeBandFor } from "@/lib/util";
import { Avatar, Badge, Button, Card, EmptyState, PageHeader, SectionTitle, SkillPill } from "@/components/ui";
import { AssignDialog } from "@/components/assign-dialog";

interface AssignContext {
  passage: Passage;
  studentIds: string[];
  skillId: string;
}

export default function GroupsPage() {
  const { data, createGroup, deleteGroup } = useData();
  const [assign, setAssign] = useState<AssignContext | null>(null);

  const existingSkillIds = useMemo(() => new Set(data.groups.map((g) => g.skillId)), [data.groups]);
  const suggestions = useMemo(
    () => suggestGroups(data).filter((g) => !existingSkillIds.has(g.skillId)),
    [data, existingSkillIds],
  );

  /** Best library passage for a shared-skill group, by grade band + difficulty fit. */
  function pickPassage(skillId: string, studentIds: string[]): Passage | undefined {
    const members = data.students.filter((s) => studentIds.includes(s.id));
    if (members.length === 0) return undefined;
    const avgMastery =
      members.reduce((sum, s) => sum + (s.skills[skillId]?.mastery ?? 50), 0) / members.length;
    const target = difficultyTarget(avgMastery);
    const band = gradeBandFor(Math.round(members.reduce((s, m) => s + m.grade, 0) / members.length));
    const pool = data.passages.filter((p) => p.skillTargets.includes(skillId));
    if (pool.length === 0) return undefined;
    return [...pool].sort((a, b) => {
      const ba = (a.gradeBand === band ? 0 : 1) + Math.abs(a.level - target) / 10;
      const bb = (b.gradeBand === band ? 0 : 1) + Math.abs(b.level - target) / 10;
      return ba - bb;
    })[0];
  }

  function studentsByIds(ids: string[]) {
    return data.students.filter((s) => ids.includes(s.id));
  }

  return (
    <>
      <PageHeader
        title="Groups"
        subtitle="Group readers by shared need, then assign the right text to the whole table at once."
      />

      {/* Suggested groups */}
      <section className="mb-8">
        <SectionTitle>Suggested by shared gap</SectionTitle>
        {suggestions.length === 0 ? (
          <EmptyState title="No new groupings suggested" hint="Every shared gap already has a group." />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {suggestions.map((g) => {
              const skill = SKILL_BY_ID[g.skillId];
              const passage = pickPassage(g.skillId, g.studentIds);
              return (
                <Card key={g.skillId} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <SkillPill skillId={g.skillId} />
                        <Badge tone="rose">{g.studentIds.length} share this gap</Badge>
                      </div>
                      <p className="mt-1.5 text-sm text-slate-500">{skill?.focus}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {studentsByIds(g.studentIds).map((s) => (
                      <Link
                        key={s.id}
                        href={`/students/${s.id}`}
                        className="flex items-center gap-1.5 rounded-full border border-slate-200 py-0.5 pl-0.5 pr-2 hover:border-indigo-300"
                      >
                        <Avatar name={s.name} hue={s.avatarHue} size={22} />
                        <span className="text-xs text-slate-600">{s.name.split(" ")[0]}</span>
                      </Link>
                    ))}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        createGroup({
                          name: `${skill?.shortName ?? "Skill"} Group`,
                          studentIds: g.studentIds,
                          skillId: g.skillId,
                          auto: true,
                        })
                      }
                    >
                      Create group
                    </Button>
                    {passage && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setAssign({ passage, studentIds: g.studentIds, skillId: g.skillId })}
                      >
                        Assign a text
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Existing groups */}
      <section>
        <SectionTitle>Your groups</SectionTitle>
        {data.groups.length === 0 ? (
          <EmptyState title="No groups yet" hint="Create one from a suggestion above." />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {data.groups.map((group) => {
              const members = studentsByIds(group.studentIds);
              const passage = pickPassage(group.skillId, group.studentIds);
              return (
                <Card key={group.id} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900">{group.name}</p>
                        {group.auto && <Badge tone="indigo">auto</Badge>}
                      </div>
                      <div className="mt-1.5">
                        <SkillPill skillId={group.skillId} />
                      </div>
                    </div>
                    <button
                      onClick={() => deleteGroup(group.id)}
                      className="text-xs text-slate-400 hover:text-rose-500"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {members.map((s) => (
                      <Link
                        key={s.id}
                        href={`/students/${s.id}`}
                        className="flex items-center gap-1.5 rounded-full border border-slate-200 py-0.5 pl-0.5 pr-2 hover:border-indigo-300"
                      >
                        <Avatar name={s.name} hue={s.avatarHue} size={22} />
                        <span className="text-xs text-slate-600">{s.name.split(" ")[0]}</span>
                      </Link>
                    ))}
                    {members.length === 0 && <p className="text-sm text-slate-400">No members.</p>}
                  </div>

                  {passage && (
                    <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 p-2.5">
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-wide text-slate-400">Suggested text</p>
                        <p className="truncate text-sm font-medium text-slate-700">{passage.title}</p>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setAssign({ passage, studentIds: group.studentIds, skillId: group.skillId })}
                      >
                        Assign
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {assign && (
        <AssignDialog
          open={!!assign}
          onClose={() => setAssign(null)}
          passage={assign.passage}
          defaultStudentIds={assign.studentIds}
          skillId={assign.skillId}
        />
      )}
    </>
  );
}
