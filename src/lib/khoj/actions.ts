"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { SelAssessmentType } from "./types";

/** Dismiss an Overview action-queue item. */
export async function dismissActionQueueItem(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("action_queue").update({ status: "dismissed" }).eq("id", id);
  if (error) throw error;
}

/** Partial save for the SEL Assessment Form — upserts on the
 * (student, grade, cycle, assessment_type) unique key so a student's
 * in-progress entry survives navigating away mid-form. */
export async function saveSelResponse(input: {
  studentId: string;
  gradeId: string;
  cycleLabel: string;
  assessmentType: SelAssessmentType;
  payload: Record<string, unknown>;
  submitted: boolean;
}) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("sel_responses").upsert(
    {
      student_id: input.studentId,
      grade_id: input.gradeId,
      cycle_label: input.cycleLabel,
      assessment_type: input.assessmentType,
      payload: input.payload,
      submitted: input.submitted,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "student_id,grade_id,cycle_label,assessment_type" }
  );
  if (error) throw error;
}

export async function getSelResponsesForRoster(gradeId: string, cycleLabel: string, assessmentType: SelAssessmentType) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("sel_responses")
    .select("*")
    .eq("grade_id", gradeId)
    .eq("cycle_label", cycleLabel)
    .eq("assessment_type", assessmentType);
  if (error) throw error;
  return data;
}

/** Records a new formative/summative assessment — the "+ New assessment"
 * flow. */
export async function createAssessment(input: {
  kind: "formative" | "summative";
  gradeId: string;
  subject: string;
  roundLabel: string;
  assessmentDate: string;
  averagePct: number;
  bracketBelowPct: number;
  bracketBasicPct: number;
  bracketProficientPct: number;
  bracketAdvancedPct: number;
}) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("assessments").insert({
    kind: input.kind,
    grade_id: input.gradeId,
    subject: input.subject,
    round_label: input.roundLabel,
    assessment_date: input.assessmentDate,
    average_pct: input.averagePct,
    bracket_below_pct: input.bracketBelowPct,
    bracket_basic_pct: input.bracketBasicPct,
    bracket_proficient_pct: input.bracketProficientPct,
    bracket_advanced_pct: input.bracketAdvancedPct,
  });
  if (error) throw error;
}

export async function deleteAssessment(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("assessments").delete().eq("id", id);
  if (error) throw error;
}

/** Records today's attendance for a grade — the "+ Take today's
 * attendance" flow. No confirm-on-delete in this pass, per the design
 * handoff's note flagging that as follow-up work. */
export async function createAttendanceRecord(input: {
  gradeId: string;
  recordDate: string;
  presentCount: number;
  totalCount: number;
}) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("attendance_records").insert({
    grade_id: input.gradeId,
    record_date: input.recordDate,
    present_count: input.presentCount,
    total_count: input.totalCount,
  });
  if (error) throw error;
}

export async function deleteAttendanceRecord(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("attendance_records").delete().eq("id", id);
  if (error) throw error;
}

/** Enrolls a new student — the "+ Enroll student" flow. */
export async function enrollStudent(input: {
  gradeId: string;
  rollNo: string;
  name: string;
  gender: "M" | "F" | "Other";
}) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("students").insert({
    grade_id: input.gradeId,
    roll_no: input.rollNo,
    name: input.name,
    gender: input.gender,
  });
  if (error) throw error;
}
