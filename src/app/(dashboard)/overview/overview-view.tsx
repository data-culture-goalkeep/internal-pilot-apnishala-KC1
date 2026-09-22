"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StackedBarChart } from "@/components/charts/stacked-bar-chart";
import { ChartLegend } from "@/components/charts/legend";
import { useKhojData } from "@/lib/khoj/khoj-data-provider";
import { KhojDataGate } from "@/lib/khoj/khoj-data-gate";
import { useGradeScope } from "@/lib/khoj/scope";
import { dismissActionQueueItem } from "@/lib/khoj/actions";
import type { KhojData } from "@/lib/khoj/types";
import { BRACKET_LABELS } from "@/lib/khoj/types";

const BRACKET_CLASSES = ["bg-bracket-below", "bg-bracket-basic", "bg-bracket-proficient", "bg-bracket-advanced"];

export function OverviewView() {
  return (
    <KhojDataGate>{(data) => <OverviewContent data={data} />}</KhojDataGate>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function OverviewContent({ data }: { data: KhojData }) {
  const { role, gradeCode, refresh } = useKhojData();
  const { grade } = useGradeScope(data, gradeCode);
  const isLeadership = role === "leadership";

  const stats = data.overviewStats.find((s) => (isLeadership ? s.grade_id === null : s.grade_id === (grade?.id ?? null)));
  const scopeLabel = isLeadership ? "All grades" : grade ? grade.label : "All grades";

  const actionItems = data.actionQueue.filter((a) =>
    isLeadership ? true : grade ? a.grade_id === grade.id : true
  );

  const bracketData = data.grades.map((g) => {
    const pre = data.bracketMovement.find((b) => b.grade_id === g.id && b.round_label === "pre");
    const post = data.bracketMovement.find((b) => b.grade_id === g.id && b.round_label === "post");
    return { g, pre, post };
  });

  const topMovers = data.topMovers
    .map((tm) => ({ tm, student: data.students.find((s) => s.id === tm.student_id) }))
    .filter((x) => x.student && (isLeadership || !grade || x.student.grade_id === grade.id))
    .sort((a, b) => b.tm.delta_pct - a.tm.delta_pct)
    .slice(0, 8);

  async function handleDismiss(id: string) {
    await dismissActionQueueItem(id);
    await refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-semibold">
          {isLeadership ? "Overview — School-wide" : `Overview — ${scopeLabel}`}
        </h1>
        <p className="text-sm text-muted-foreground">What needs attention today, and where the numbers stand.</p>
      </div>

      {stats && stats.attendance_this_month_pct < stats.attendance_alert_threshold_pct && (
        <div className="rounded-lg border border-bracket-basic/40 bg-bracket-basic/10 px-4 py-3 text-sm">
          <span className="font-semibold">Threshold alert — </span>
          {scopeLabel} attendance dropped to {stats.attendance_this_month_pct}% — below the{" "}
          {stats.attendance_alert_threshold_pct}% watch line.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Enrollment" dotClassName="bg-gk-blue-deep" value={`${stats?.enrollment_count ?? 0} students`}
          sub={stats ? `${stats.boys_count} boys · ${stats.girls_count} girls` : undefined} />
        <StatCard label="Attendance this month" dotClassName="bg-gk-teal" value={`${stats?.attendance_this_month_pct ?? 0}%`}
          sub={stats && stats.attendance_this_month_pct < stats.attendance_alert_threshold_pct ? "Below target range" : "On target"}
          subClassName={stats && stats.attendance_this_month_pct < stats.attendance_alert_threshold_pct ? "text-destructive" : "text-muted-foreground"} />
        <StatCard label="Formative coverage" dotClassName="bg-gk-blue" value={`${stats?.formative_coverage_pct ?? 0}%`}
          sub="Target: TBD with Khoj team" />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Action queue</CardTitle>
          <span className="text-sm text-muted-foreground">{actionItems.length} open</span>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border p-0">
          {actionItems.length === 0 && (
            <p className="px-5 py-4 text-sm text-muted-foreground">Nothing needs attention right now.</p>
          )}
          {actionItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="flex items-start gap-2.5">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-destructive" />
                <div>
                  <p className="text-sm font-medium">{item.description}</p>
                  <p className="text-xs capitalize text-muted-foreground">
                    {(item.grade_id ? data.grades.find((g) => g.id === item.grade_id)?.label : "School-wide")} · {item.category} · Open
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleDismiss(item.id)}>
                Mark actioned
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bracket movement — pre → post</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <ChartLegend items={BRACKET_LABELS.map((label, i) => ({ label, className: BRACKET_CLASSES[i] }))} />
          <div className="flex gap-8 overflow-x-auto pb-1">
            {bracketData.map(({ g, pre, post }) => (
              <div key={g.id} className="flex flex-col items-center gap-2">
                <StackedBarChart
                  height={150}
                  data={[
                    {
                      label: "Pre",
                      segments: pre
                        ? [
                            { key: "b", value: pre.below_pct, className: "bg-bracket-below", label: "Below Basic" },
                            { key: "ba", value: pre.basic_pct, className: "bg-bracket-basic", label: "Basic" },
                            { key: "p", value: pre.proficient_pct, className: "bg-bracket-proficient", label: "Proficient" },
                            { key: "a", value: pre.advanced_pct, className: "bg-bracket-advanced", label: "Advanced" },
                          ]
                        : [],
                    },
                    {
                      label: "Post",
                      segments: post
                        ? [
                            { key: "b", value: post.below_pct, className: "bg-bracket-below", label: "Below Basic" },
                            { key: "ba", value: post.basic_pct, className: "bg-bracket-basic", label: "Basic" },
                            { key: "p", value: post.proficient_pct, className: "bg-bracket-proficient", label: "Proficient" },
                            { key: "a", value: post.advanced_pct, className: "bg-bracket-advanced", label: "Advanced" },
                          ]
                        : [],
                    },
                  ]}
                />
                <span className="text-xs font-medium text-muted-foreground">{g.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top movers this cycle</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border p-0">
          {topMovers.map(({ tm, student }) => (
            <div key={tm.student_id} className="flex items-center justify-between gap-3 px-5 py-2.5">
              <div className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-full bg-gk-blue-deep/10 text-xs font-semibold text-gk-blue-deep">
                  {initials(student!.name)}
                </span>
                <div>
                  <p className="text-sm font-medium">{student!.name}</p>
                  <p className="text-xs text-muted-foreground">{data.grades.find((g) => g.id === student!.grade_id)?.label}</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-gk-teal">+{tm.delta_pct}pp</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  subClassName = "text-muted-foreground",
  dotClassName,
}: {
  label: string;
  value: string;
  sub?: string;
  subClassName?: string;
  dotClassName: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <span className={`size-2 rounded-full ${dotClassName}`} />
          {label}
        </div>
        <p className="font-heading text-3xl font-semibold">{value}</p>
        {sub && <p className={`text-sm ${subClassName}`}>{sub}</p>}
      </CardContent>
    </Card>
  );
}
