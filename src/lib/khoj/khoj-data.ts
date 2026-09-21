"use server";

import { createClient } from "@/lib/supabase/server";
import type { KhojData } from "./types";

/** Single combined fetch for the whole dashboard, cached client-side by
 * KhojDataProvider on mount. Grade/"All" and Teacher/Leadership scoping is
 * applied client-side against this payload rather than refetched per view —
 * mirrors key-questions-interface's ProjectDataProvider pattern, appropriate
 * here since the full dataset for a single school is small. */
export async function getKhojData(): Promise<KhojData> {
  const supabase = await createClient();

  const [
    grades,
    students,
    assessments,
    objectives,
    coverageMonths,
    attendanceMonthly,
    attendanceRecords,
    studentAttendance,
    attendanceAlerts,
    selParameters,
    selScores,
    selDomains,
    sjtSituations,
    sjtResponses,
    sjtCompetencyScores,
    sjtCoverage,
    studentGrowth,
    actionQueue,
    bracketMovement,
    topMovers,
    overviewStats,
  ] = await Promise.all([
    supabase.from("grades").select("*").order("sort_order"),
    supabase.from("students").select("*").order("roll_no"),
    supabase.from("assessments").select("*").order("assessment_date", { ascending: false }),
    supabase.from("assessment_objectives").select("*"),
    supabase.from("assessment_coverage_months").select("*").order("sort_order"),
    supabase.from("attendance_monthly").select("*").order("sort_order"),
    supabase.from("attendance_records").select("*").order("record_date", { ascending: false }),
    supabase.from("student_attendance").select("*").order("sort_order"),
    supabase.from("attendance_alerts").select("*").eq("status", "open"),
    supabase.from("sel_parameters").select("*").order("sort_order"),
    supabase.from("sel_scores").select("*"),
    supabase.from("sel_domains").select("*").order("sort_order"),
    supabase.from("sjt_situations").select("*").order("sort_order"),
    supabase.from("sjt_responses").select("*"),
    supabase.from("sjt_competency_scores").select("*"),
    supabase.from("sjt_coverage").select("*"),
    supabase.from("student_growth").select("*"),
    supabase.from("action_queue").select("*").eq("status", "open"),
    supabase.from("bracket_movement").select("*"),
    supabase.from("top_movers").select("*"),
    supabase.from("overview_stats").select("*"),
  ]);

  const firstError = [
    grades, students, assessments, objectives, coverageMonths, attendanceMonthly,
    attendanceRecords, studentAttendance, attendanceAlerts, selParameters, selScores,
    selDomains, sjtSituations, sjtResponses, sjtCompetencyScores, sjtCoverage,
    studentGrowth, actionQueue, bracketMovement, topMovers, overviewStats,
  ].find((r) => r.error)?.error;
  if (firstError) throw firstError;

  return {
    grades: grades.data ?? [],
    students: students.data ?? [],
    assessments: assessments.data ?? [],
    objectives: objectives.data ?? [],
    coverageMonths: coverageMonths.data ?? [],
    attendanceMonthly: attendanceMonthly.data ?? [],
    attendanceRecords: attendanceRecords.data ?? [],
    studentAttendance: studentAttendance.data ?? [],
    attendanceAlerts: attendanceAlerts.data ?? [],
    selParameters: selParameters.data ?? [],
    selScores: selScores.data ?? [],
    selDomains: selDomains.data ?? [],
    sjtSituations: sjtSituations.data ?? [],
    sjtResponses: sjtResponses.data ?? [],
    sjtCompetencyScores: sjtCompetencyScores.data ?? [],
    sjtCoverage: sjtCoverage.data ?? [],
    studentGrowth: studentGrowth.data ?? [],
    actionQueue: actionQueue.data ?? [],
    bracketMovement: bracketMovement.data ?? [],
    topMovers: topMovers.data ?? [],
    overviewStats: overviewStats.data ?? [],
  };
}
