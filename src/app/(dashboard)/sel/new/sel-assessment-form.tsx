"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { KhojDataGate } from "@/lib/khoj/khoj-data-gate";
import { saveSelResponse } from "@/lib/khoj/actions";
import { isSjtEligible } from "@/lib/khoj/types";
import type { KhojData, SelAssessmentType, Student } from "@/lib/khoj/types";
import { cn } from "@/lib/utils";

const CYCLES = ["Cycle 1", "Cycle 2", "Cycle 3"];

type Step = "setup" | "roster" | "entry" | "summary";

export function SelAssessmentForm() {
  return <KhojDataGate>{(data) => <FormContent data={data} />}</KhojDataGate>;
}

function FormContent({ data }: { data: KhojData }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialGradeCode = searchParams.get("grade") ?? undefined;

  const [step, setStep] = React.useState<Step>("setup");
  const [gradeCode, setGradeCode] = React.useState(initialGradeCode ?? data.grades[0]?.code ?? "");
  const [selectedAssessmentType, setAssessmentType] = React.useState<SelAssessmentType>("observation");
  const [cycle, setCycle] = React.useState(CYCLES[0]);
  const [activeStudent, setActiveStudent] = React.useState<Student | null>(null);
  const [savedIds, setSavedIds] = React.useState<Set<string>>(new Set());
  const [toast, setToast] = React.useState<string | null>(null);

  const grade = data.grades.find((g) => g.code === gradeCode);
  const eligible = grade ? isSjtEligible(grade.code) : false;
  // Picking a lower grade auto-falls back to Observation, per the design
  // handoff — derived rather than synced via an effect, since it's a pure
  // function of (selectedAssessmentType, eligible).
  const assessmentType: SelAssessmentType = eligible ? selectedAssessmentType : "observation";

  React.useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2600);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const roster = grade ? data.students.filter((s) => s.grade_id === grade.id) : [];

  function openStudent(student: Student) {
    setActiveStudent(student);
    setStep("entry");
  }

  async function handleSave(payload: Record<string, unknown>, submitted: boolean) {
    if (!activeStudent || !grade) return;
    await saveSelResponse({
      studentId: activeStudent.id,
      gradeId: grade.id,
      cycleLabel: cycle,
      assessmentType,
      payload,
      submitted,
    });
    setSavedIds((prev) => new Set(prev).add(activeStudent.id));
    setToast(submitted ? "Scores saved — averages updated just now." : "Draft saved.");
    if (submitted) setStep("summary");
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Log SEL Data</h1>
        <Button variant="ghost" size="sm" onClick={() => router.push("/sel")}>
          Close
        </Button>
      </div>

      {step === "setup" && (
        <Card>
          <CardHeader>
            <CardTitle>Setup</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Grade
              <Select value={gradeCode} onChange={(e) => setGradeCode(e.target.value)}>
                {data.grades.map((g) => (
                  <option key={g.id} value={g.code}>
                    {g.label}
                  </option>
                ))}
              </Select>
            </label>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Assessment type</span>
              <div className="flex gap-2">
                <ToggleButton active={assessmentType === "observation"} onClick={() => setAssessmentType("observation")}>
                  Observation
                </ToggleButton>
                <ToggleButton
                  active={assessmentType === "sjt"}
                  disabled={!eligible}
                  onClick={() => eligible && setAssessmentType("sjt")}
                >
                  SJT
                </ToggleButton>
                <ToggleButton
                  active={assessmentType === "student_response"}
                  disabled={!eligible}
                  onClick={() => eligible && setAssessmentType("student_response")}
                >
                  Student Response
                </ToggleButton>
              </div>
              {!eligible && (
                <p className="text-xs text-muted-foreground">
                  SJT and Student Response are only available for Grades 6–10.
                </p>
              )}
            </div>

            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Cycle
              <Select value={cycle} onChange={(e) => setCycle(e.target.value)}>
                {CYCLES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </label>

            <Button className="w-fit" disabled={!grade} onClick={() => setStep("roster")}>
              Continue to roster
            </Button>
          </CardContent>
        </Card>
      )}

      {step === "roster" && grade && (
        <Card>
          <CardHeader>
            <CardTitle>
              {grade.label} roster — {cycle} · {assessmentType.replace("_", " ")}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border p-0">
            {roster.map((s) => (
              <button
                key={s.id}
                onClick={() => openStudent(s)}
                className="flex items-center justify-between px-5 py-3 text-left hover:bg-muted"
              >
                <span className="text-sm font-medium">
                  {s.roll_no} · {s.name}
                </span>
                {savedIds.has(s.id) ? (
                  <span className="text-xs font-medium text-gk-teal">Saved</span>
                ) : (
                  <span className="text-xs text-muted-foreground">Not started</span>
                )}
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {step === "entry" && activeStudent && grade && (
        <EntryStep
          data={data}
          student={activeStudent}
          assessmentType={assessmentType}
          onBack={() => setStep("roster")}
          onSave={handleSave}
        />
      )}

      {step === "summary" && activeStudent && (
        <Card>
          <CardHeader>
            <CardTitle>Saved — {activeStudent.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              {assessmentType.replace("_", " ")} responses for {cycle} were saved.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("roster")}>
                Back to roster
              </Button>
              <Button onClick={() => router.push("/sel")}>Done</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

function ToggleButton({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        active
          ? "border-accent-gold bg-accent-gold text-accent-gold-ink"
          : "border-border bg-background text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function EntryStep({
  data,
  student,
  assessmentType,
  onBack,
  onSave,
}: {
  data: KhojData;
  student: Student;
  assessmentType: SelAssessmentType;
  onBack: () => void;
  onSave: (payload: Record<string, unknown>, submitted: boolean) => Promise<void>;
}) {
  const [pending, setPending] = React.useState(false);

  if (assessmentType === "observation") {
    return (
      <ObservationEntry
        parameters={data.selParameters}
        student={student}
        onBack={onBack}
        onSubmit={async (payload) => {
          setPending(true);
          await onSave(payload, true);
          setPending(false);
        }}
        pending={pending}
      />
    );
  }
  if (assessmentType === "sjt") {
    return (
      <SjtEntry
        situations={data.sjtSituations}
        student={student}
        onBack={onBack}
        onSubmit={async (payload) => {
          setPending(true);
          await onSave(payload, true);
          setPending(false);
        }}
        pending={pending}
      />
    );
  }
  return (
    <StudentResponseEntry
      domains={data.selDomains}
      student={student}
      onBack={onBack}
      onSubmit={async (payload) => {
        setPending(true);
        await onSave(payload, true);
        setPending(false);
      }}
      pending={pending}
    />
  );
}

function ObservationEntry({
  parameters,
  student,
  onBack,
  onSubmit,
  pending,
}: {
  parameters: KhojData["selParameters"];
  student: Student;
  onBack: () => void;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
  pending: boolean;
}) {
  const [answers, setAnswers] = React.useState<Record<string, "thrive" | "resist">>({});
  const complete = parameters.every((p) => answers[p.id]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Observation — {student.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {parameters.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0">
            <span className="text-sm font-medium">{p.name}</span>
            <div className="flex gap-2">
              <ToggleButton active={answers[p.id] === "thrive"} onClick={() => setAnswers((a) => ({ ...a, [p.id]: "thrive" }))}>
                Thrive
              </ToggleButton>
              <ToggleButton active={answers[p.id] === "resist"} onClick={() => setAnswers((a) => ({ ...a, [p.id]: "resist" }))}>
                Resist
              </ToggleButton>
            </div>
          </div>
        ))}
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            Back to roster
          </Button>
          <Button disabled={!complete || pending} onClick={() => onSubmit(answers)}>
            {pending ? "Saving…" : "Save"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SjtEntry({
  situations,
  student,
  onBack,
  onSubmit,
  pending,
}: {
  situations: KhojData["sjtSituations"];
  student: Student;
  onBack: () => void;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
  pending: boolean;
}) {
  const [answers, setAnswers] = React.useState<Record<string, "A" | "B" | "C" | "D">>({});
  const complete = situations.every((s) => answers[s.id]);
  const options = ["A", "B", "C", "D"] as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Situational Judgment Test — {student.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {situations.map((situ, i) => (
          <div key={situ.id} className="flex flex-col gap-2 border-b border-border pb-4 last:border-0">
            <p className="text-sm font-medium">
              Story {i + 1}: {situ.title}
            </p>
            <p className="text-xs text-muted-foreground">What would you most likely do?</p>
            <div className="flex flex-wrap gap-2">
              {options.map((opt) => (
                <ToggleButton key={opt} active={answers[situ.id] === opt} onClick={() => setAnswers((a) => ({ ...a, [situ.id]: opt }))}>
                  Option {opt}
                </ToggleButton>
              ))}
            </div>
          </div>
        ))}
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            Back to roster
          </Button>
          <Button disabled={!complete || pending} onClick={() => onSubmit(answers)}>
            {pending ? "Saving…" : "Save"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

const LIKERT = [1, 2, 3, 4, 5];

function StudentResponseEntry({
  domains,
  student,
  onBack,
  onSubmit,
  pending,
}: {
  domains: KhojData["selDomains"];
  student: Student;
  onBack: () => void;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
  pending: boolean;
}) {
  const [answers, setAnswers] = React.useState<Record<string, number>>({});
  const complete = domains.every((d) => answers[d.id] != null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Response — {student.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {domains.map((d) => (
          <div key={d.id} className="flex flex-col gap-2 border-b border-border pb-4 last:border-0">
            <p className="text-sm font-medium">{d.name}</p>
            <div className="flex gap-2">
              {LIKERT.map((v) => (
                <ToggleButton key={v} active={answers[d.id] === v} onClick={() => setAnswers((a) => ({ ...a, [d.id]: v }))}>
                  {v}
                </ToggleButton>
              ))}
            </div>
          </div>
        ))}
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            Back to roster
          </Button>
          <Button disabled={!complete || pending} onClick={() => onSubmit(answers)}>
            {pending ? "Saving…" : "Save"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
