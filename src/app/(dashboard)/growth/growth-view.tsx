"use client";

import * as React from "react";
import { ArrowUpDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useKhojData } from "@/lib/khoj/khoj-data-provider";
import { KhojDataGate } from "@/lib/khoj/khoj-data-gate";
import { useGradeScope } from "@/lib/khoj/scope";
import type { KhojData } from "@/lib/khoj/types";

type SortKey = "name" | "subject" | "pre" | "post" | "delta";

export function GrowthView() {
  return <KhojDataGate>{(data) => <GrowthContent data={data} />}</KhojDataGate>;
}

function GrowthContent({ data }: { data: KhojData }) {
  const { gradeCode } = useKhojData();
  const { grade, students } = useGradeScope(data, gradeCode);
  const [sortKey, setSortKey] = React.useState<SortKey>("delta");
  const [sortDir, setSortDir] = React.useState<1 | -1>(-1);

  const studentIds = new Set(students.map((s) => s.id));
  const rows = data.studentGrowth
    .filter((g) => studentIds.has(g.student_id))
    .map((g) => {
      const student = data.students.find((s) => s.id === g.student_id)!;
      return {
        student,
        subject: g.subject,
        pre: g.pre_score,
        post: g.post_score,
        delta: Math.round((g.post_score - g.pre_score) * 10) / 10,
        gradeLabel: data.grades.find((gr) => gr.id === student.grade_id)?.label ?? "",
      };
    });

  const sorted = [...rows].sort((a, b) => {
    const dir = sortDir;
    switch (sortKey) {
      case "name":
        return a.student.name.localeCompare(b.student.name) * dir;
      case "subject":
        return a.subject.localeCompare(b.subject) * dir;
      case "pre":
        return (a.pre - b.pre) * dir;
      case "post":
        return (a.post - b.post) * dir;
      default:
        return (a.delta - b.delta) * dir;
    }
  });

  function toggleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === 1 ? -1 : 1));
    else {
      setSortKey(key);
      setSortDir(-1);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Individual Student Growth</h1>
        <p className="text-sm text-muted-foreground">
          {grade ? `Showing ${grade.label}` : "Showing all grades"} — sortable, pre vs. post score per subject.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Students</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHead label="Student" sortKey="name" active={sortKey} onSort={toggleSort} />
                <TableHead>Grade</TableHead>
                <SortableHead label="Subject" sortKey="subject" active={sortKey} onSort={toggleSort} />
                <SortableHead label="Pre" sortKey="pre" active={sortKey} onSort={toggleSort} />
                <SortableHead label="Post" sortKey="post" active={sortKey} onSort={toggleSort} />
                <SortableHead label="Delta" sortKey="delta" active={sortKey} onSort={toggleSort} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((r, i) => (
                <TableRow key={`${r.student.id}-${r.subject}-${i}`}>
                  <TableCell>{r.student.name}</TableCell>
                  <TableCell>{r.gradeLabel}</TableCell>
                  <TableCell>{r.subject}</TableCell>
                  <TableCell>{r.pre}%</TableCell>
                  <TableCell>{r.post}%</TableCell>
                  <TableCell className={r.delta >= 0 ? "text-gk-teal" : "text-destructive"}>
                    {r.delta >= 0 ? "+" : ""}
                    {r.delta}pp
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function SortableHead({
  label,
  sortKey,
  active,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  active: SortKey;
  onSort: (key: SortKey) => void;
}) {
  return (
    <TableHead>
      <button
        onClick={() => onSort(sortKey)}
        className={`flex items-center gap-1 ${active === sortKey ? "text-foreground" : ""}`}
      >
        {label}
        <ArrowUpDown className="size-3" />
      </button>
    </TableHead>
  );
}
