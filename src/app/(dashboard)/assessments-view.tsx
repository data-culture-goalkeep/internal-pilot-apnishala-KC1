"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { BarChart } from "@/components/charts/bar-chart";
import { StackedBarChart } from "@/components/charts/stacked-bar-chart";
import { ChartLegend } from "@/components/charts/legend";
import { useKhojData } from "@/lib/khoj/khoj-data-provider";
import { KhojDataGate } from "@/lib/khoj/khoj-data-gate";
import { useGradeScope } from "@/lib/khoj/scope";
import { deleteAssessment } from "@/lib/khoj/actions";
import { ConfigureAssessmentDialog, ScoreEntryDialog } from "./assessment-flow-dialogs";
import type { Assessment, AssessmentKind, AssessmentObjective, KhojData } from "@/lib/khoj/types";
import { BRACKET_LABELS } from "@/lib/khoj/types";

const BRACKET_CLASSES = ["bg-bracket-below", "bg-bracket-basic", "bg-bracket-proficient", "bg-bracket-advanced"];

export function AssessmentsView({ kind }: { kind: AssessmentKind }) {
  return <KhojDataGate>{(data) => <AssessmentsContent kind={kind} data={data} />}</KhojDataGate>;
}

function AssessmentsContent({ kind, data }: { kind: AssessmentKind; data: KhojData }) {
  const { gradeCode, refresh } = useKhojData();
  const { grade, isAll } = useGradeScope(data, gradeCode);
  const [configureOpen, setConfigureOpen] = React.useState(false);
  const [scoreEntry, setScoreEntry] = React.useState<{ assessment: Assessment; objectives: AssessmentObjective[] } | null>(null);

  const title = kind === "formative" ? "Formative Assessments" : "Summative Assessments";
  const rounds = kind === "formative" ? ["Round 1", "Round 2"] : ["Pre", "Post"];
  const latestRound = rounds[rounds.length - 1];

  const kindAssessments = data.assessments.filter((a) => a.kind === kind);

  // Average score by grade (only shown when grade = "All").
  const avgByGrade = data.grades.map((g) => {
    const rows = kindAssessments.filter((a) => a.grade_id === g.id && a.round_label === latestRound);
    const avg = rows.length ? rows.reduce((s, r) => s + r.average_pct, 0) / rows.length : 0;
    return { label: g.code, value: Math.round(avg * 10) / 10 };
  });

  const scopedAssessments = grade ? kindAssessments.filter((a) => a.grade_id === grade.id) : kindAssessments;

  // Coverage by month — aggregates across grades when "All" is selected.
  const months = Array.from(
    new Set(
      data.coverageMonths.filter((c) => c.kind === kind && (!grade || c.grade_id === grade.id)).map((c) => c.month_label)
    )
  );
  const coverageByMonth = months.map((month) => {
    const rows = data.coverageMonths.filter((c) => c.kind === kind && c.month_label === month && (!grade || c.grade_id === grade.id));
    const avg = rows.length ? rows.reduce((s, r) => s + r.coverage_pct, 0) / rows.length : 0;
    return { label: month, value: Math.round(avg * 10) / 10 };
  });

  const latestAssessment = grade
    ? scopedAssessments
        .filter((a) => a.round_label === latestRound)
        .sort((a, b) => (a.assessment_date < b.assessment_date ? 1 : -1))[0]
    : undefined;

  // Bracket distribution by subject — most recent round per subject, scoped to grade (or averaged across "All").
  const subjects = Array.from(new Set(kindAssessments.map((a) => a.subject)));
  const bracketBySubject = subjects.map((subject) => {
    const rows = kindAssessments.filter(
      (a) => a.subject === subject && a.round_label === latestRound && (!grade || a.grade_id === grade.id)
    );
    const avgField = (f: "bracket_below_pct" | "bracket_basic_pct" | "bracket_proficient_pct" | "bracket_advanced_pct") =>
      rows.length ? rows.reduce((s, r) => s + r[f], 0) / rows.length : 0;
    return {
      label: subject,
      segments: [
        { key: "b", value: avgField("bracket_below_pct"), className: "bg-bracket-below", label: "Below Basic" },
        { key: "ba", value: avgField("bracket_basic_pct"), className: "bg-bracket-basic", label: "Basic" },
        { key: "p", value: avgField("bracket_proficient_pct"), className: "bg-bracket-proficient", label: "Proficient" },
        { key: "a", value: avgField("bracket_advanced_pct"), className: "bg-bracket-advanced", label: "Advanced" },
      ],
    };
  });

  const objectives = latestAssessment ? data.objectives.filter((o) => o.assessment_id === latestAssessment.id) : [];

  const recentlyAdded = [...scopedAssessments].sort((a, b) => (a.assessment_date < b.assessment_date ? 1 : -1)).slice(0, 8);

  async function handleDelete(id: string) {
    await deleteAssessment(id);
    await refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">
            {grade ? `Showing ${grade.label}` : "Pick a grade to log or review a specific assessment."}
          </p>
        </div>
        {grade ? (
          <Button onClick={() => setConfigureOpen(true)}>+ New assessment</Button>
        ) : (
          <span className="max-w-56 text-right text-xs text-muted-foreground">
            Select a specific grade to add a new assessment.
          </span>
        )}
      </div>

      {isAll && (
        <Card>
          <CardHeader>
            <CardTitle>Average score by grade — {latestRound}</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={avgByGrade} />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Coverage{kind === "summative" ? ", pre vs. post" : " by month"}</CardTitle>
            {kind === "summative" && (
              <CardDescription>Note: Grade 6+ observation methodology differs from Grade &lt;6.</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <BarChart data={coverageByMonth} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest assessment</CardTitle>
          </CardHeader>
          <CardContent>
            {latestAssessment ? (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">
                  {latestAssessment.subject} · {latestAssessment.round_label} ·{" "}
                  {new Date(latestAssessment.assessment_date).toLocaleDateString()}
                </p>
                <p className="font-heading text-3xl font-semibold">{latestAssessment.average_pct}%</p>
                {latestAssessment.previous_average_pct != null && (
                  <p className="text-sm text-gk-teal">
                    {latestAssessment.average_pct >= latestAssessment.previous_average_pct ? "+" : ""}
                    {Math.round((latestAssessment.average_pct - latestAssessment.previous_average_pct) * 10) / 10}pp vs.
                    previous round
                  </p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-1 w-fit"
                  onClick={() =>
                    setScoreEntry({
                      assessment: latestAssessment,
                      objectives: data.objectives.filter((o) => o.assessment_id === latestAssessment.id),
                    })
                  }
                >
                  Enter/edit scores
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Pick a specific grade to see its latest assessment.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bracket distribution by subject — {kind === "formative" ? "Formative" : "Summative"}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <ChartLegend items={BRACKET_LABELS.map((label, i) => ({ label, className: BRACKET_CLASSES[i] }))} />
          <StackedBarChart data={bracketBySubject} />
        </CardContent>
      </Card>

      {kind === "formative" && (
        <Card>
          <CardHeader>
            <CardTitle>Objectives assessed — latest formative</CardTitle>
          </CardHeader>
          <CardContent>
            {objectives.length === 0 ? (
              <p className="text-sm text-muted-foreground">Pick a specific grade to see objective-level detail.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Objective</TableHead>
                    <TableHead>Max marks</TableHead>
                    <TableHead>Class average</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {objectives.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell>{o.objective_text}</TableCell>
                      <TableCell>{o.max_marks}</TableCell>
                      <TableCell>{o.class_average}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recently added</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Round</TableHead>
                <TableHead>Average</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentlyAdded.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{new Date(a.assessment_date).toLocaleDateString()}</TableCell>
                  <TableCell>{a.subject}</TableCell>
                  <TableCell>{a.round_label}</TableCell>
                  <TableCell>{a.average_pct}%</TableCell>
                  <TableCell className="flex justify-end gap-1 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setScoreEntry({ assessment: a, objectives: data.objectives.filter((o) => o.assessment_id === a.id) })}
                    >
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(a.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {grade && (
        <ConfigureAssessmentDialog
          open={configureOpen}
          onOpenChange={setConfigureOpen}
          kind={kind}
          gradeId={grade.id}
          gradeLabel={grade.label}
          roundLabel={latestRound}
          onCreated={async (assessment, objectives) => {
            await refresh();
            setScoreEntry({ assessment, objectives });
          }}
        />
      )}
      <ScoreEntryDialog
        open={!!scoreEntry}
        onOpenChange={(open) => !open && setScoreEntry(null)}
        assessment={scoreEntry?.assessment ?? null}
        objectives={scoreEntry?.objectives ?? []}
        students={data.students}
        onSaved={refresh}
      />
    </div>
  );
}
