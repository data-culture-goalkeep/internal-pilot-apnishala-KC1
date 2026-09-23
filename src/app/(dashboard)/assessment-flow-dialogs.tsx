"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  createAssessmentWithObjectives,
  getAssessmentScores,
  saveAssessmentScores,
} from "@/lib/khoj/actions";
import { sortStudents, type StudentSortBy } from "@/lib/khoj/scope";
import type { Assessment, AssessmentObjective, AssessmentScore, ObjectiveCategory, Student } from "@/lib/khoj/types";
import { cn } from "@/lib/utils";

const SUBJECTS = ["Math", "Language", "EVS"];

type DraftObjective = { text: string; maxMarks: number };

function SortToggle({ value, onChange }: { value: StudentSortBy; onChange: (v: StudentSortBy) => void }) {
  return (
    <div className="flex shrink-0 items-center gap-1 text-xs">
      <span className="text-muted-foreground">Sort by</span>
      {(["roll", "name"] as const).map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            "rounded-md border px-2 py-1 font-medium",
            value === opt ? "border-accent-gold-strong bg-accent-gold-strong/15 text-accent-gold-strong-ink" : "border-border text-muted-foreground hover:text-foreground"
          )}
        >
          {opt === "roll" ? "Roll no." : "Name"}
        </button>
      ))}
    </div>
  );
}

function ObjectiveRows({
  rows,
  onChange,
  placeholder,
  max,
  addLabel,
}: {
  rows: DraftObjective[];
  onChange: (rows: DraftObjective[]) => void;
  placeholder: string;
  max: number;
  addLabel: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            className={cn("flex-1", !row.text.trim() && "border-destructive/60")}
            placeholder={placeholder}
            value={row.text}
            required
            onChange={(e) => {
              const next = [...rows];
              next[i] = { ...next[i], text: e.target.value };
              onChange(next);
            }}
          />
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              className="flex size-6 items-center justify-center rounded-md border border-border text-sm"
              onClick={() => {
                const next = [...rows];
                next[i] = { ...next[i], maxMarks: Math.max(1, next[i].maxMarks - 1) };
                onChange(next);
              }}
            >
              −
            </button>
            <span className="w-5 text-center text-sm font-semibold">{row.maxMarks}</span>
            <button
              type="button"
              className="flex size-6 items-center justify-center rounded-md border border-border text-sm"
              onClick={() => {
                const next = [...rows];
                next[i] = { ...next[i], maxMarks: Math.min(10, next[i].maxMarks + 1) };
                onChange(next);
              }}
            >
              +
            </button>
          </div>
          <button
            type="button"
            className="px-1 text-base text-destructive"
            onClick={() => onChange(rows.filter((_, j) => j !== i))}
          >
            ✕
          </button>
        </div>
      ))}
      {rows.length < max && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => onChange([...rows, { text: "", maxMarks: 5 }])}
        >
          {addLabel}
        </Button>
      )}
    </div>
  );
}

export function ConfigureAssessmentDialog({
  open,
  onOpenChange,
  kind,
  gradeId,
  gradeLabel,
  roundLabel,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: "formative" | "summative";
  gradeId: string;
  gradeLabel: string;
  roundLabel: string;
  onCreated: (assessment: Assessment, objectives: AssessmentObjective[]) => void;
}) {
  const [subject, setSubject] = React.useState(SUBJECTS[0]);
  const [date, setDate] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [formativeRows, setFormativeRows] = React.useState<DraftObjective[]>([{ text: "", maxMarks: 5 }]);
  const [oralRows, setOralRows] = React.useState<DraftObjective[]>([{ text: "", maxMarks: 5 }]);
  const [writtenRows, setWrittenRows] = React.useState<DraftObjective[]>([{ text: "", maxMarks: 5 }]);
  const [pending, setPending] = React.useState(false);

  // Every objective row that exists must have a label — no silently
  // dropping blank rows on submit. At least one objective is required.
  const activeRows = kind === "formative" ? formativeRows : [...oralRows, ...writtenRows];
  const hasBlankRow = activeRows.some((r) => !r.text.trim());
  const canSubmit = activeRows.length > 0 && !hasBlankRow;

  async function handleSubmit() {
    if (!canSubmit) return;
    setPending(true);
    try {
      const objectives: { text: string; maxMarks: number; category: ObjectiveCategory | null }[] =
        kind === "formative"
          ? formativeRows.map((r) => ({ ...r, category: null }))
          : [
              ...oralRows.map((r) => ({ ...r, category: "oral" as const })),
              ...writtenRows.map((r) => ({ ...r, category: "written" as const })),
            ];

      const { assessment, objectives: created } = await createAssessmentWithObjectives({
        kind,
        gradeId,
        subject,
        roundLabel,
        assessmentDate: date,
        objectives,
      });
      onOpenChange(false);
      onCreated(assessment, created);
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Configure {kind} assessment</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold">
            Subject
            <Select className="mt-1.5 w-full" value={subject} onChange={(e) => setSubject(e.target.value)}>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </label>
          <label className="text-sm font-semibold">
            Grade
            <div className="mt-1.5 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">Grade {gradeLabel}</div>
          </label>
          <label className="text-sm font-semibold">
            Date conducted
            <Input className="mt-1.5" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>

          {kind === "formative" ? (
            <div className="text-sm font-semibold">
              Objectives &amp; max marks
              <p className="mb-2 mt-1 text-xs font-normal text-muted-foreground">
                Enter up to 3 objectives for this assessment — no fixed competency list.
              </p>
              <ObjectiveRows
                rows={formativeRows}
                onChange={setFormativeRows}
                placeholder="e.g. SWBAT read 2 lines from the textbook"
                max={3}
                addLabel="+ Add objective"
              />
            </div>
          ) : (
            <div className="text-sm font-semibold">
              Objectives &amp; max marks
              <p className="mb-2 mt-1 text-xs font-normal text-muted-foreground">
                Up to 3 oral + 9 written objectives, entered by the teacher.
              </p>
              <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Oral (max 3)</div>
              <ObjectiveRows
                rows={oralRows}
                onChange={setOralRows}
                placeholder="e.g. Recite the poem with expression"
                max={3}
                addLabel="+ Add oral objective"
              />
              <div className="mb-1 mt-4 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Written (max 9)</div>
              <ObjectiveRows
                rows={writtenRows}
                onChange={setWrittenRows}
                placeholder="e.g. Answer the following questions"
                max={9}
                addLabel="+ Add written objective"
              />
            </div>
          )}
        </div>
        <DialogFooter className="items-center sm:justify-between">
          {hasBlankRow && <p className="text-xs text-destructive">Every objective needs a label.</p>}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={pending || !canSubmit} onClick={handleSubmit}>
              {pending ? "Creating…" : "Create & enter scores →"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ScoreEntryDialog({
  open,
  onOpenChange,
  assessment,
  objectives,
  students,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessment: Assessment | null;
  objectives: AssessmentObjective[];
  students: Student[];
  onSaved: () => Promise<void>;
}) {
  const [draft, setDraft] = React.useState<Record<string, string>>({});
  const [pending, setPending] = React.useState(false);
  const [sortBy, setSortBy] = React.useState<StudentSortBy>("roll");

  React.useEffect(() => {
    if (!open || !assessment) return;
    getAssessmentScores(assessment.id).then((scores: AssessmentScore[]) => {
      const next: Record<string, string> = {};
      for (const s of scores) next[`${s.objective_id}:${s.student_id}`] = String(s.score);
      setDraft(next);
    });
  }, [open, assessment]);

  const rosterStudents = React.useMemo(
    () => (assessment ? sortStudents(students.filter((s) => s.grade_id === assessment.grade_id), sortBy) : []),
    [students, assessment, sortBy]
  );

  const maxMarksByObjective = React.useMemo(() => new Map(objectives.map((o) => [o.id, o.max_marks])), [objectives]);

  function clampScore(key: string, raw: string) {
    if (raw === "") {
      setDraft((d) => ({ ...d, [key]: "" }));
      return;
    }
    const max = maxMarksByObjective.get(key.split(":")[0]) ?? Infinity;
    const n = Number(raw);
    const clamped = Number.isNaN(n) ? raw : String(Math.min(Math.max(n, 0), max));
    setDraft((d) => ({ ...d, [key]: clamped }));
  }

  async function handleSave() {
    if (!assessment) return;
    setPending(true);
    try {
      const entries = Object.entries(draft)
        .filter(([, v]) => v !== "")
        .map(([key, v]) => {
          const [objectiveId, studentId] = key.split(":");
          const max = maxMarksByObjective.get(objectiveId) ?? Infinity;
          return { objectiveId, studentId, score: Math.min(Math.max(Number(v), 0), max) };
        });
      await saveAssessmentScores(assessment.id, entries);
      // Optimistic: close the dialog as soon as the write itself succeeds,
      // rather than also waiting on the full dashboard-data reload that
      // follows — that reload updates the background views once it lands,
      // but shouldn't hold the dialog open.
      onOpenChange(false);
      void onSaved();
    } finally {
      setPending(false);
    }
  }

  if (!assessment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader className="flex-row items-start justify-between space-y-0">
          <div>
            <DialogTitle>Enter scores — {assessment.subject}</DialogTitle>
            <DialogDescription>
              {new Date(assessment.assessment_date).toLocaleDateString()} · {assessment.round_label}
            </DialogDescription>
          </div>
          <SortToggle value={sortBy} onChange={setSortBy} />
        </DialogHeader>
        {rosterStudents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No students enrolled in this grade yet.</p>
        ) : (
          <div className="max-h-[60vh] overflow-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted text-xs font-bold uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Roll</th>
                  <th className="px-3 py-2 text-left">Student</th>
                  {objectives.map((o, i) => (
                    <th key={o.id} className="min-w-28 px-3 py-2 text-left" title={o.objective_text}>
                      {o.category === "oral" ? "O-" : o.category === "written" ? "W-" : ""}Q{i + 1}
                      <div className="text-[10px] font-normal normal-case text-muted-foreground">out of {o.max_marks}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rosterStudents.map((stu) => (
                  <tr key={stu.id} className="border-t border-border">
                    <td className="px-3 py-2">{stu.roll_no}</td>
                    <td className="px-3 py-2 font-medium">{stu.name}</td>
                    {objectives.map((o) => {
                      const key = `${o.id}:${stu.id}`;
                      return (
                        <td key={o.id} className="px-3 py-2">
                          <Input
                            type="number"
                            min={0}
                            max={o.max_marks}
                            className="h-8 w-20"
                            value={draft[key] ?? ""}
                            onChange={(e) => clampScore(key, e.target.value)}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={pending || rosterStudents.length === 0} onClick={handleSave}>
            {pending ? "Saving…" : "Save scores"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
