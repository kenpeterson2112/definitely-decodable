"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  AppData,
  Assignment,
  AssignmentStatus,
  Group,
  Miscue,
  Passage,
  Session,
  SkillMastery,
  Student,
} from "./types";
import { buildSeedData } from "./seed";
import { clamp, statusFromMastery } from "./util";

const STORAGE_KEY = "dd:data:v3";

function genId(prefix: string): string {
  const rnd =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `${prefix}-${rnd}`;
}

export interface RecordSessionInput {
  studentId: string;
  passageId: string;
  accuracy: number;
  wcpm: number;
  comprehension: number;
  miscues: Miscue[];
  skillTargets: string[];
  notes?: string;
}

interface DataContextValue {
  data: AppData;
  recordSession: (input: RecordSessionInput) => Session;
  addPassage: (passage: Passage) => void;
  createGroup: (group: Omit<Group, "id">) => Group;
  updateGroup: (id: string, patch: Partial<Omit<Group, "id">>) => void;
  deleteGroup: (id: string) => void;
  createAssignment: (
    input: Omit<Assignment, "id" | "assignedAt" | "status"> & { status?: AssignmentStatus },
  ) => Assignment;
  updateAssignment: (id: string, patch: Partial<Omit<Assignment, "id">>) => void;
  resetData: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

/** Apply a recorded reading to a student's skill profile and headline metrics. */
function applySessionToStudent(student: Student, input: RecordSessionInput): Student {
  const skills: Record<string, SkillMastery> = { ...student.skills };

  for (const skillId of input.skillTargets) {
    const prev = skills[skillId];
    if (!prev) continue;
    // Weight the practiced skill toward the observed accuracy; reteaching lifts mastery.
    const next = clamp(Math.round(prev.mastery * 0.6 + input.accuracy * 0.4));
    skills[skillId] = {
      ...prev,
      mastery: next,
      accuracy: input.accuracy,
      status: statusFromMastery(next),
      trend: next - prev.mastery,
    };
  }

  // Refresh the focus skill to whatever is now lowest.
  const focusSkillId = Object.values(skills).reduce(
    (lowest, m) => (m.mastery < skills[lowest].mastery ? m.skillId : lowest),
    Object.keys(skills)[0],
  );

  return {
    ...student,
    skills,
    wcpm: input.wcpm,
    accuracy: input.accuracy,
    comprehension: input.comprehension,
    focusSkillId,
  };
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);
  const hydrated = data !== null;
  const skipNextWrite = useRef(true);

  // Hydrate from localStorage (or seed) after mount so server/client first paint match.
  useEffect(() => {
    let loaded: AppData | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) loaded = JSON.parse(raw) as AppData;
    } catch {
      loaded = null;
    }
    // Hydration from localStorage must happen after mount (no localStorage during SSR).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(loaded ?? buildSeedData());
  }, []);

  // Persist on change (but not on the initial hydration set).
  useEffect(() => {
    if (!data) return;
    if (skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* ignore quota / private-mode errors */
    }
  }, [data]);

  const recordSession = useCallback((input: RecordSessionInput): Session => {
    const session: Session = { ...input, id: genId("ses"), date: Date.now() };
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sessions: [...prev.sessions, session],
        students: prev.students.map((s) =>
          s.id === input.studentId ? applySessionToStudent(s, input) : s,
        ),
        // Any in-progress/assigned work on this passage for this student is now complete.
        assignments: prev.assignments.map((a) =>
          a.passageId === input.passageId && a.studentIds.includes(input.studentId) && a.status !== "complete"
            ? { ...a, status: "complete" as AssignmentStatus }
            : a,
        ),
      };
    });
    return session;
  }, []);

  const addPassage = useCallback((passage: Passage) => {
    setData((prev) => (prev ? { ...prev, passages: [passage, ...prev.passages] } : prev));
  }, []);

  const createGroup = useCallback((group: Omit<Group, "id">): Group => {
    const created: Group = { ...group, id: genId("grp") };
    setData((prev) => (prev ? { ...prev, groups: [...prev.groups, created] } : prev));
    return created;
  }, []);

  const updateGroup = useCallback((id: string, patch: Partial<Omit<Group, "id">>) => {
    setData((prev) =>
      prev ? { ...prev, groups: prev.groups.map((g) => (g.id === id ? { ...g, ...patch } : g)) } : prev,
    );
  }, []);

  const deleteGroup = useCallback((id: string) => {
    setData((prev) => (prev ? { ...prev, groups: prev.groups.filter((g) => g.id !== id) } : prev));
  }, []);

  const createAssignment = useCallback(
    (input: Omit<Assignment, "id" | "assignedAt" | "status"> & { status?: AssignmentStatus }): Assignment => {
      const created: Assignment = {
        ...input,
        id: genId("asg"),
        assignedAt: Date.now(),
        status: input.status ?? "assigned",
      };
      setData((prev) => (prev ? { ...prev, assignments: [created, ...prev.assignments] } : prev));
      return created;
    },
    [],
  );

  const updateAssignment = useCallback((id: string, patch: Partial<Omit<Assignment, "id">>) => {
    setData((prev) =>
      prev
        ? { ...prev, assignments: prev.assignments.map((a) => (a.id === id ? { ...a, ...patch } : a)) }
        : prev,
    );
  }, []);

  const resetData = useCallback(() => {
    skipNextWrite.current = false;
    setData(buildSeedData());
  }, []);

  const value = useMemo<DataContextValue | null>(() => {
    if (!data) return null;
    return {
      data,
      recordSession,
      addPassage,
      createGroup,
      updateGroup,
      deleteGroup,
      createAssignment,
      updateAssignment,
      resetData,
    };
  }, [
    data,
    recordSession,
    addPassage,
    createGroup,
    updateGroup,
    deleteGroup,
    createAssignment,
    updateAssignment,
    resetData,
  ]);

  return (
    <DataContext.Provider value={value}>
      {hydrated ? children : <BootSplash />}
    </DataContext.Provider>
  );
}

function BootSplash() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-slate-50">
      <div className="flex items-center gap-1 text-xl font-bold tracking-tight">
        <span className="text-slate-900">Definitely</span>
        <span className="text-indigo-600">Decodable</span>
      </div>
      <div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-indigo-500" />
      </div>
    </div>
  );
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside <DataProvider>");
  return ctx;
}

/** Convenience selectors. */
export function useStudent(id: string | undefined): Student | undefined {
  const { data } = useData();
  return data.students.find((s) => s.id === id);
}

export function usePassage(id: string | undefined): Passage | undefined {
  const { data } = useData();
  return data.passages.find((p) => p.id === id);
}
