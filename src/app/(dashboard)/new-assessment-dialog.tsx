"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createAssessment } from "@/lib/khoj/actions";
import type { AssessmentKind } from "@/lib/khoj/types";

export function NewAssessmentDialog({
  open,
  onOpenChange,
  kind,
  gradeId,
  roundLabel,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: AssessmentKind;
  gradeId: string;
  roundLabel: string;
  onSaved: () => Promise<void>;
}) {
  const [subject, setSubject] = React.useState("Math");
  const [averagePct, setAveragePct] = React.useState("70");
  const [pending, setPending] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      const avg = Number(averagePct);
      await createAssessment({
        kind,
        gradeId,
        subject,
        roundLabel,
        assessmentDate: new Date().toISOString().slice(0, 10),
        averagePct: avg,
        bracketBelowPct: 15,
        bracketBasicPct: 25,
        bracketProficientPct: 35,
        bracketAdvancedPct: 25,
      });
      await onSaved();
      onOpenChange(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New {kind} assessment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Subject
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} required />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Average score (%)
            <Input
              type="number"
              min={0}
              max={100}
              value={averagePct}
              onChange={(e) => setAveragePct(e.target.value)}
              required
            />
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
