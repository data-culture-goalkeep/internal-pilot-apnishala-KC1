"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { BarChart } from "@/components/charts/bar-chart";
import { ChartLegend } from "@/components/charts/legend";
import { useKhojData } from "@/lib/khoj/khoj-data-provider";
import { KhojDataGate } from "@/lib/khoj/khoj-data-gate";
import { useGradeScope } from "@/lib/khoj/scope";
import { deleteAttendanceRecord } from "@/lib/khoj/actions";
import type { KhojData } from "@/lib/khoj/types";

export function AttendanceView() {
  return <KhojDataGate>{(data) => <AttendanceContent data={data} />}</KhojDataGate>;
}

function AttendanceContent({ data }: { data: KhojData }) {
  const { gradeCode, refresh } = useKhojData();
  const { grade, students } = useGradeScope(data, gradeCode);

  const months = Array.from(new Set(data.attendanceMonthly.map((a) => a.month_label)));
  const allGradesAvgByMonth = new Map(
    months.map((m) => {
      const rows = data.attendanceMonthly.filter((a) => a.month_label === m);
      return [m, rows.length ? rows.reduce((s, r) => s + r.attendance_pct, 0) / rows.length : 0];
    })
  );
  const chartData = months.map((m) => {
    const gradeRow = grade ? data.attendanceMonthly.find((a) => a.month_label === m && a.grade_id === grade.id) : undefined;
    return {
      label: m,
      value: grade ? gradeRow?.attendance_pct ?? 0 : allGradesAvgByMonth.get(m) ?? 0,
      compareValue: grade ? Math.round((allGradesAvgByMonth.get(m) ?? 0) * 10) / 10 : undefined,
    };
  });

  const alerts = data.attendanceAlerts.filter((a) => {
    const stu = data.students.find((s) => s.id === a.student_id);
    return stu && (!grade || stu.grade_id === grade.id);
  });

  const records = data.attendanceRecords
    .filter((r) => !grade || r.grade_id === grade.id)
    .sort((a, b) => (a.record_date < b.record_date ? 1 : -1))
    .slice(0, 8);

  async function handleDelete(id: string) {
    await deleteAttendanceRecord(id);
    await refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Attendance + Enrollment</h1>
          <p className="text-sm text-muted-foreground">
            {grade ? `Showing ${grade.label}` : "Pick a grade to enroll a student or take today's attendance."}
          </p>
        </div>
        {grade && (
          <div className="flex gap-2">
            <Button variant="outline">+ Enroll student</Button>
            <Button>+ Take today&apos;s attendance</Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Average attendance % by month</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {grade && (
            <ChartLegend
              items={[
                { label: grade.label, className: "bg-gk-blue-deep" },
                { label: "All grades", className: "bg-gk-blue-deep/25" },
              ]}
            />
          )}
          <BarChart data={chartData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>7+ consecutive teaching days missed</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border p-0">
          {alerts.length === 0 && <p className="px-5 py-4 text-sm text-muted-foreground">No students currently flagged.</p>}
          {alerts.map((a) => {
            const stu = data.students.find((s) => s.id === a.student_id)!;
            return (
              <div key={a.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div>
                  <p className="text-sm font-medium">{stu.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {data.grades.find((g) => g.id === stu.grade_id)?.label} · {a.consecutive_days_missed} days missed
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Follow up
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendance records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Present / Total</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{new Date(r.record_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {r.present_count} / {r.total_count}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All students</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Gender</TableHead>
                {months.map((m) => (
                  <TableHead key={m}>{m}</TableHead>
                ))}
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.roll_no}</TableCell>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.gender}</TableCell>
                  {months.map((m) => {
                    const rec = data.studentAttendance.find((sa) => sa.student_id === s.id && sa.month_label === m);
                    return <TableCell key={m}>{rec ? `${rec.attendance_pct}%` : "—"}</TableCell>;
                  })}
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
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
