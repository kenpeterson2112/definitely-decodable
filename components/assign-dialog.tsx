"use client";

import { useState } from "react";
import type { Passage } from "@/lib/types";
import { useData } from "@/lib/store";
import { skillName } from "@/lib/scope";
import { cx } from "@/lib/util";
import { Avatar, Button, SkillPill } from "@/components/ui";
import { Modal } from "@/components/modal";

export function AssignDialog({
  open,
  onClose,
  passage,
  defaultStudentIds = [],
  skillId,
}: {
  open: boolean;
  onClose: () => void;
  passage: Passage;
  defaultStudentIds?: string[];
  skillId?: string;
}) {
  const { data, createAssignment } = useData();
  const [selected, setSelected] = useState<Set<string>>(new Set(defaultStudentIds));
  const [repeated, setRepeated] = useState(true);
  const [done, setDone] = useState(false);

  const target = skillId ?? passage.skillTargets[0];

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function fillGroup(ids: string[]) {
    setSelected(new Set(ids));
  }

  function assign() {
    if (selected.size === 0) return;
    createAssignment({
      passageId: passage.id,
      studentIds: [...selected],
      skillId: target,
      repeatedReading: repeated,
    });
    setDone(true);
    setTimeout(() => {
      setDone(false);
      onClose();
    }, 900);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Assign passage"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={assign} disabled={selected.size === 0 || done}>
            {done ? "Assigned ✓" : `Assign to ${selected.size || "…"}`}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-sm font-semibold text-slate-900">{passage.title}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            <SkillPill skillId={target} />
            <span>· {passage.gradeBand} · {passage.wordCount} words</span>
          </div>
        </div>

        {data.groups.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
              Quick-fill a group
            </p>
            <div className="flex flex-wrap gap-1.5">
              {data.groups.map((g) => (
                <button
                  key={g.id}
                  onClick={() => fillGroup(g.studentIds)}
                  className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:border-indigo-300 hover:text-indigo-700"
                >
                  {g.name} · {skillName(g.skillId)}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
            Students ({selected.size} selected)
          </p>
          <div className="grid max-h-56 grid-cols-1 gap-1 overflow-y-auto sm:grid-cols-2">
            {data.students.map((s) => {
              const on = selected.has(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => toggle(s.id)}
                  className={cx(
                    "flex items-center gap-2 rounded-lg border px-2 py-1.5 text-left transition-colors",
                    on ? "border-indigo-300 bg-indigo-50" : "border-slate-200 hover:bg-slate-50",
                  )}
                >
                  <Avatar name={s.name} hue={s.avatarHue} size={28} />
                  <span className="min-w-0 flex-1 truncate text-sm text-slate-700">{s.name}</span>
                  <span className="text-xs text-slate-400">Gr {s.grade}</span>
                  {on && <span className="text-indigo-600">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={repeated}
            onChange={(e) => setRepeated(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          Include repeated-reading practice (read 3×, track fluency gains)
        </label>
      </div>
    </Modal>
  );
}
