"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { HorizontalStackedBar } from "@/components/charts/horizontal-stacked-bar";
import { BarChart } from "@/components/charts/bar-chart";
import { ProgressBar } from "@/components/charts/progress-bar";
import { ChartLegend } from "@/components/charts/legend";
import { useKhojData } from "@/lib/khoj/khoj-data-provider";
import { KhojDataGate } from "@/lib/khoj/khoj-data-gate";
import { useGradeScope } from "@/lib/khoj/scope";
import { isSjtEligible } from "@/lib/khoj/types";
import type { KhojData } from "@/lib/khoj/types";

export function SelView() {
  return <KhojDataGate>{(data) => <SelContent data={data} />}</KhojDataGate>;
}

function SelContent({ data }: { data: KhojData }) {
  const { gradeCode } = useKhojData();
  const { grade, isAll } = useGradeScope(data, gradeCode);
  const [period, setPeriod] = React.useState("Cycle 1");

  const periods = Array.from(new Set(data.selScores.map((s) => s.period_label)));

  const combinedRows = data.selParameters.map((p) => {
    const obs = data.selScores.find(
      (s) => s.parameter_id === p.id && s.method === "observation" && s.period_label === period && (!grade || s.grade_id === grade.id)
    );
    const self = data.selScores.find(
      (s) => s.parameter_id === p.id && s.method === "self_report" && s.period_label === period && (!grade || s.grade_id === grade.id)
    );
    return { param: p, obs, self };
  });

  const sjtEligible = isAll || (grade && isSjtEligible(grade.code));
  const sjtGradeId = grade && isSjtEligible(grade.code) ? grade.id : null;

  const coverage = data.sjtCoverage.find((c) => c.grade_id === (isAll ? null : sjtGradeId));
  const competencyByDomain = data.selDomains.map((d) => {
    const row = data.sjtCompetencyScores.find(
      (c) => c.domain_id === d.id && c.grade_id === (isAll ? null : sjtGradeId)
    );
    return { label: d.name, value: row?.score_pct ?? 0 };
  });

  const responseDistribution = data.sjtSituations.map((situ) => {
    const row = data.sjtResponses.find((r) => r.situation_id === situ.id && r.grade_id === (isAll ? null : sjtGradeId));
    return {
      label: situ.title,
      segments: row
        ? [
            { key: "a", value: row.option_a_pct, className: "bg-bracket-below", label: "Option A" },
            { key: "b", value: row.option_b_pct, className: "bg-bracket-basic", label: "Option B" },
            { key: "c", value: row.option_c_pct, className: "bg-bracket-proficient", label: "Option C" },
            { key: "d", value: row.option_d_pct, className: "bg-bracket-advanced", label: "Option D" },
          ]
        : [],
    };
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold">SEL &amp; Holistic Support</h1>
          <p className="text-sm text-muted-foreground">
            {grade ? `Showing ${grade.label}` : "Pick a grade to log SEL data."}
          </p>
        </div>
        {grade && (
          <Button asChild>
            <Link href={`/sel/new?grade=${grade.code}`}>+ Log SEL data</Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Observation Tool + Self-Report, combined</CardTitle>
          <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
            {periods.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ChartLegend
            items={[
              { label: "Thrive", className: "bg-sel-thrive" },
              { label: "Resist", className: "bg-sel-resist" },
            ]}
          />
          {combinedRows.map(({ param, obs, self }) => (
            <div key={param.id} className="flex flex-col gap-1.5">
              <p className="text-sm font-medium">{param.name}</p>
              <HorizontalStackedBar
                rows={[
                  {
                    label: "Observation",
                    segments: obs
                      ? [
                          { key: "t", value: obs.thrive_pct, className: "bg-sel-thrive", label: "Thrive" },
                          { key: "r", value: obs.resist_pct, className: "bg-sel-resist", label: "Resist" },
                        ]
                      : [],
                  },
                  {
                    label: "Self-Report",
                    segments: self
                      ? [
                          { key: "t", value: self.thrive_pct, className: "bg-sel-thrive", label: "Thrive" },
                          { key: "r", value: self.resist_pct, className: "bg-sel-resist", label: "Resist" },
                        ]
                      : [],
                  },
                ]}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div>
        <h2 className="font-heading text-lg font-semibold">Situational Judgment Test</h2>
        <p className="text-xs text-muted-foreground">
          Provisional scoring — competency-map/normalization logic is not final; all values below are placeholders.
        </p>
      </div>

      {!sjtEligible ? (
        <Card>
          <CardContent className="text-sm text-muted-foreground">
            SJT is only collected for Grades 6–10. Select a grade in that range, or &quot;All&quot;, to see SJT data.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Coverage — Grades 6–10</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <p className="font-heading text-3xl font-semibold">{coverage?.coverage_pct ?? 0}%</p>
                <ProgressBar value={coverage?.coverage_pct ?? 0} className="bg-gk-blue-deep" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Competency-map summary</CardTitle>
                <CardDescription>By SEL domain</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart data={competencyByDomain} barClassName="bg-gk-teal" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Response distribution by situation</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <HorizontalStackedBar rows={responseDistribution} />
              <ChartLegend
                items={[
                  { label: "Option A", className: "bg-bracket-below" },
                  { label: "Option B", className: "bg-bracket-basic" },
                  { label: "Option C", className: "bg-bracket-proficient" },
                  { label: "Option D", className: "bg-bracket-advanced" },
                ]}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
