"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitAttendanceRoster } from "@/lib/khoj/actions";
import { sortStudents, type StudentSortBy } from "@/lib/khoj/scope";
import type { Grade, Student } from "@/lib/khoj/types";

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

export function TakeAttendanceDialog({
  open,
  onOpenChange,
  grade,
  students,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grade: Grade;
  students: Student[];
  onSaved: () => Promise<void>;
}) {
  const [date, setDate] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [present, setPresent] = React.useState<Record<string, boolean>>({});
  const [pending, setPending] = React.useState(false);
  const [sortBy, setSortBy] = React.useState<StudentSortBy>("roll");

  // Reset the roster synchronously on the closed->open transition (React's
  // recommended "adjust state when a prop changes" pattern, using state
  // rather than a ref since refs can't be read/written during render)
  // rather than in an effect.
  const [wasOpen, setWasOpen] = React.useState(false);
  if (open !== wasOpen) {
    setWasOpen(open);
  }
  if (open && !wasOpen) {
    setPresent(Object.fromEntries(students.map((s) => [s.id, true])));
  }

  const roster = React.useMemo(() => sortStudents(students, sortBy), [students, sortBy]);

  async function handleSubmit() {
    setPending(true);
    try {
      await submitAttendanceRoster({
        gradeId: grade.id,
        recordDate: date,
        entries: roster.map((s) => ({ studentId: s.id, present: present[s.id] ?? true })),
      });
      // Optimistic: close as soon as the write succeeds; the background
      // views pick up the refreshed data once it lands rather than holding
      // the dialog open for it.
      onOpenChange(false);
      void onSaved();
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Take attendance — Grade {grade.label}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex items-end justify-between gap-3">
            <label className="flex flex-col gap-1.5 text-sm font-semibold">
              Date
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-fit" />
            </label>
            <SortToggle value={sortBy} onChange={setSortBy} />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPresent(Object.fromEntries(roster.map((s) => [s.id, true])))}
            >
              Mark all present
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPresent(Object.fromEntries(roster.map((s) => [s.id, false])))}
            >
              Mark all absent
            </Button>
          </div>

          {roster.length === 0 ? (
            <p className="text-sm text-muted-foreground">No students enrolled in this grade yet.</p>
          ) : (
            <div className="max-h-[50vh] overflow-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left">Roll</th>
                    <th className="px-3 py-2 text-left">Grade</th>
                    <th className="px-3 py-2 text-left">Student</th>
                    <th className="px-3 py-2 text-left">Present today</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map((stu) => {
                    const isPresent = present[stu.id] ?? true;
                    return (
                      <tr key={stu.id} className="border-t border-border">
                        <td className="px-3 py-2">{stu.roll_no}</td>
                        <td className="px-3 py-2">{grade.code}</td>
                        <td className="px-3 py-2 font-medium">{stu.name}</td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            className={cn(
                              "rounded-md border px-3 py-1 text-xs font-semibold",
                              isPresent
                                ? "border-status-positive/50 bg-status-positive/15 text-status-positive"
                                : "border-status-negative/50 bg-status-negative/15 text-status-negative"
                            )}
                            onClick={() => setPresent((p) => ({ ...p, [stu.id]: !isPresent }))}
                          >
                            {isPresent ? "Present" : "Absent"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={pending || roster.length === 0} onClick={handleSubmit}>
            {pending ? "Submitting…" : "Submit attendance"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
