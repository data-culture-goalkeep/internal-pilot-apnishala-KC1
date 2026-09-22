"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { KhojDataGate } from "@/lib/khoj/khoj-data-gate";
import { saveSelResponse } from "@/lib/khoj/actions";
import { isSjtEligible, observationBandForGrade } from "@/lib/khoj/types";
import type { KhojData, SelAssessmentType, SelObservationItem, SelResponseItem, SjtSituation, Student } from "@/lib/khoj/types";
import { cn } from "@/lib/utils";

const CYCLES = ["Pre", "Post"];

type Step = "setup" | "roster" | "entry";
type Lang = "en" | "hi";

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

  async function handleSave(payload: Record<string, unknown>) {
    if (!activeStudent || !grade) return;
    await saveSelResponse({
      studentId: activeStudent.id,
      gradeId: grade.id,
      cycleLabel: cycle,
      assessmentType,
      payload,
      submitted: true,
    });
    setSavedIds((prev) => new Set(prev).add(activeStudent.id));
    setToast("Entry saved.");
    // Straight back to the roster — no interim per-student summary screen —
    // so the teacher can immediately pick the next student.
    setStep("roster");
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
          grade={grade}
          assessmentType={assessmentType}
          onBack={() => setStep("roster")}
          onSave={handleSave}
        />
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

/** 1-4 rubric scale, used by both Observation and Student Response. */
function RatingButtons({ value, onChange }: { value: number | undefined; onChange: (v: number) => void }) {
  return (
    <div className="flex shrink-0 gap-1.5">
      {[1, 2, 3, 4].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={cn(
            "flex size-8 items-center justify-center rounded-md border text-sm font-semibold transition-colors",
            value === n ? "border-accent-gold-strong bg-accent-gold-strong text-accent-gold-strong-ink" : "border-border bg-background text-muted-foreground hover:text-foreground"
          )}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function LangToggle({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  return (
    <div className="flex shrink-0 gap-1">
      <ToggleButton active={lang === "en"} onClick={() => onChange("en")}>
        EN
      </ToggleButton>
      <ToggleButton active={lang === "hi"} onClick={() => onChange("hi")}>
        हिं
      </ToggleButton>
    </div>
  );
}

/** Groups items that carry a `domain_id`, preserving first-seen order —
 * matches the mockup's domain-block seed ordering. */
function groupByDomain<T extends { domain_id: string }>(items: T[], domains: KhojData["selDomains"]) {
  const domainName = new Map(domains.map((d) => [d.id, d.name]));
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const name = domainName.get(item.domain_id) ?? "Other";
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name)!.push(item);
  }
  return Array.from(groups.entries());
}

function EntryStep({
  data,
  student,
  grade,
  assessmentType,
  onBack,
  onSave,
}: {
  data: KhojData;
  student: Student;
  grade: KhojData["grades"][number];
  assessmentType: SelAssessmentType;
  onBack: () => void;
  onSave: (payload: Record<string, unknown>) => Promise<void>;
}) {
  const [pending, setPending] = React.useState(false);

  async function submit(payload: Record<string, unknown>) {
    setPending(true);
    await onSave(payload);
    setPending(false);
  }

  if (assessmentType === "observation") {
    const band = observationBandForGrade(grade.code);
    const items = data.selObservationItems.filter((i) => i.band === band);
    return <ObservationEntry items={items} domains={data.selDomains} student={student} onBack={onBack} onSubmit={submit} pending={pending} />;
  }
  if (assessmentType === "sjt") {
    return <SjtEntry situations={data.sjtSituations} student={student} onBack={onBack} onSubmit={submit} pending={pending} />;
  }
  return <StudentResponseEntry items={data.selResponseItems} domains={data.selDomains} student={student} onBack={onBack} onSubmit={submit} pending={pending} />;
}

function ObservationEntry({
  items,
  domains,
  student,
  onBack,
  onSubmit,
  pending,
}: {
  items: SelObservationItem[];
  domains: KhojData["selDomains"];
  student: Student;
  onBack: () => void;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
  pending: boolean;
}) {
  const [answers, setAnswers] = React.useState<Record<string, number>>({});
  const complete = items.every((i) => answers[i.id] != null);
  const groups = groupByDomain(items, domains);
  let counter = 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Observation — {student.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {groups.map(([domainName, groupItems]) => (
          <div key={domainName} className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold">{domainName}</span>
              <span className="text-xs text-muted-foreground">
                {groupItems.filter((i) => answers[i.id] != null).length} / {groupItems.length}
              </span>
            </div>
            {groupItems.map((item) => {
              counter++;
              return (
                <div key={item.id} className="flex items-start justify-between gap-4 rounded-lg border border-border p-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-muted-foreground">{String(counter).padStart(2, "0")}</span>
                    <span className="text-sm font-medium">{item.title}</span>
                    {item.guidance && <p className="text-xs text-muted-foreground">{item.guidance}</p>}
                  </div>
                  <RatingButtons value={answers[item.id]} onChange={(v) => setAnswers((a) => ({ ...a, [item.id]: v }))} />
                </div>
              );
            })}
          </div>
        ))}
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            Back to roster
          </Button>
          <Button disabled={!complete || pending} onClick={() => onSubmit(answers)}>
            {pending ? "Saving…" : "Save entry"}
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
  situations: SjtSituation[];
  student: Student;
  onBack: () => void;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
  pending: boolean;
}) {
  const [answers, setAnswers] = React.useState<Record<string, "A" | "B" | "C" | "D">>({});
  const [lang, setLang] = React.useState<Lang>("en");
  const complete = situations.every((s) => answers[s.id]);
  const letters = ["A", "B", "C", "D"] as const;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Situational Judgment Test — {student.name}</CardTitle>
        <LangToggle lang={lang} onChange={setLang} />
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {situations.map((situ, i) => {
          const story = lang === "en" ? situ.story_en : situ.story_hi;
          const options = lang === "en" ? situ.options_en : situ.options_hi;
          return (
            <div key={situ.id} className="flex flex-col gap-2 border-b border-border pb-4 last:border-0">
              <p className={cn("text-sm font-medium", lang === "hi" && "font-devanagari")}>
                Situation {i + 1}: {story}
              </p>
              <div className="flex flex-col gap-1.5">
                {letters.map((letter, idx) => (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => setAnswers((a) => ({ ...a, [situ.id]: letter }))}
                    className={cn(
                      "flex items-start gap-2 rounded-lg border p-2 text-left text-sm transition-colors",
                      answers[situ.id] === letter
                        ? "border-accent-gold-strong bg-accent-gold-strong/10"
                        : "border-border hover:bg-muted",
                      lang === "hi" && "font-devanagari"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                        answers[situ.id] === letter ? "border-accent-gold-strong bg-accent-gold-strong text-accent-gold-strong-ink" : "border-border"
                      )}
                    >
                      {letter}
                    </span>
                    {options[idx]}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            Back to roster
          </Button>
          <Button disabled={!complete || pending} onClick={() => onSubmit(answers)}>
            {pending ? "Saving…" : "Save entry"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StudentResponseEntry({
  items,
  domains,
  student,
  onBack,
  onSubmit,
  pending,
}: {
  items: SelResponseItem[];
  domains: KhojData["selDomains"];
  student: Student;
  onBack: () => void;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
  pending: boolean;
}) {
  const [answers, setAnswers] = React.useState<Record<string, number>>({});
  const [lang, setLang] = React.useState<Lang>("en");
  const complete = items.every((i) => answers[i.id] != null);
  const groups = groupByDomain(items, domains);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Student Response — {student.name}</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">1 = Not like me · 4 = Very much like me</p>
        </div>
        <LangToggle lang={lang} onChange={setLang} />
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {groups.map(([domainName, groupItems]) => (
          <div key={domainName} className="flex flex-col gap-3">
            <span className="text-sm font-semibold">{domainName}</span>
            {groupItems.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-4 rounded-lg border border-border p-3">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs font-semibold text-muted-foreground">{item.code}</span>
                  <span className={cn("text-sm font-medium", lang === "hi" && "font-devanagari")}>
                    {lang === "en" ? item.statement_en : item.statement_hi}
                  </span>
                </div>
                <RatingButtons value={answers[item.id]} onChange={(v) => setAnswers((a) => ({ ...a, [item.id]: v }))} />
              </div>
            ))}
          </div>
        ))}
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            Back to roster
          </Button>
          <Button disabled={!complete || pending} onClick={() => onSubmit(answers)}>
            {pending ? "Saving…" : "Save entry"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
