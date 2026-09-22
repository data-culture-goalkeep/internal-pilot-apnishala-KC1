"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { ObjectiveCategory, SelAssessmentType, SocialCategory, MinorityGroup } from "./types";

/** Score -> bracket cutoffs. Not specified anywhere in the design handoff
 * (its bracket-distribution charts use placeholder/random data, not a real
 * score->bracket mapping) — these are a reasonable default assumption made
 * for this pass, not a spec'd value; revisit if the client gives real
 * cutoffs. */
const BRACKET_CUTOFFS = { basic: 50, proficient: 70, advanced: 85 };

function bracketOf(pct: number): "below" | "basic" | "proficient" | "advanced" {
  if (pct >= BRACKET_CUTOFFS.advanced) return "advanced";
  if (pct >= BRACKET_CUTOFFS.proficient) return "proficient";
  if (pct >= BRACKET_CUTOFFS.basic) return "basic";
  return "below";
}

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

/** Step 1 of "+ New assessment" — "Configure formative/summative
 * assessment" in the mockup: creates the assessment row (starting at 0%
 * average / all-below bracket, since no scores exist yet) plus its
 * objective rows (formative: single list; summative: oral/written
 * category split), then the caller immediately opens the score-entry grid
 * for the returned assessment. */
export async function createAssessmentWithObjectives(input: {
  kind: "formative" | "summative";
  gradeId: string;
  subject: string;
  roundLabel: string;
  assessmentDate: string;
  objectives: { text: string; maxMarks: number; category: ObjectiveCategory | null }[];
}) {
  const supabase = createAdminClient();
  const { data: assessment, error: asmErr } = await supabase
    .from("assessments")
    .insert({
      kind: input.kind,
      grade_id: input.gradeId,
      subject: input.subject,
      round_label: input.roundLabel,
      assessment_date: input.assessmentDate,
      average_pct: 0,
      bracket_below_pct: 100,
      bracket_basic_pct: 0,
      bracket_proficient_pct: 0,
      bracket_advanced_pct: 0,
    })
    .select()
    .single();
  if (asmErr) throw asmErr;

  const { data: objectives, error: objErr } = await supabase
    .from("assessment_objectives")
    .insert(
      input.objectives.map((o) => ({
        assessment_id: assessment.id,
        objective_text: o.text,
        max_marks: o.maxMarks,
        class_average: 0,
        category: o.category,
      }))
    )
    .select();
  if (objErr) throw objErr;

  return { assessment, objectives };
}

export async function getAssessmentObjectives(assessmentId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("assessment_objectives")
    .select("*")
    .eq("assessment_id", assessmentId);
  if (error) throw error;
  return data;
}

export async function getAssessmentScores(assessmentId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("assessment_scores")
    .select("*")
    .eq("assessment_id", assessmentId);
  if (error) throw error;
  return data;
}

/** Step 2 of "+ New assessment" (or "Enter/edit scores" on an existing
 * one) — per-student, per-objective score grid. Upserts the raw scores,
 * then recomputes the assessment's average_pct/bracket split and each
 * objective's class_average from them (matching the mockup's `pctOf()`:
 * there is no separately-stored "average" input, it's always derived). */
export async function saveAssessmentScores(
  assessmentId: string,
  entries: { objectiveId: string; studentId: string; score: number }[]
) {
  const supabase = createAdminClient();

  const { error: upsertErr } = await supabase.from("assessment_scores").upsert(
    entries.map((e) => ({
      assessment_id: assessmentId,
      objective_id: e.objectiveId,
      student_id: e.studentId,
      score: e.score,
    })),
    { onConflict: "objective_id,student_id" }
  );
  if (upsertErr) throw upsertErr;

  const { data: objectives, error: objErr } = await supabase
    .from("assessment_objectives")
    .select("*")
    .eq("assessment_id", assessmentId);
  if (objErr) throw objErr;

  const { data: scores, error: scoresErr } = await supabase
    .from("assessment_scores")
    .select("*")
    .eq("assessment_id", assessmentId);
  if (scoresErr) throw scoresErr;

  const maxMarksByObjective = new Map(objectives!.map((o) => [o.id, o.max_marks]));
  const scoresByStudent = new Map<string, number>();
  const maxByStudent = new Map<string, number>();
  for (const s of scores!) {
    scoresByStudent.set(s.student_id, (scoresByStudent.get(s.student_id) ?? 0) + Number(s.score));
    maxByStudent.set(s.student_id, (maxByStudent.get(s.student_id) ?? 0) + Number(maxMarksByObjective.get(s.objective_id) ?? 0));
  }

  const studentPcts = Array.from(scoresByStudent.keys()).map((studentId) => {
    const max = maxByStudent.get(studentId) ?? 0;
    return max > 0 ? (scoresByStudent.get(studentId)! / max) * 100 : 0;
  });

  const averagePct = studentPcts.length ? studentPcts.reduce((a, b) => a + b, 0) / studentPcts.length : 0;
  const brackets = { below: 0, basic: 0, proficient: 0, advanced: 0 };
  for (const pct of studentPcts) brackets[bracketOf(pct)]++;
  const n = studentPcts.length || 1;

  const { error: updateErr } = await supabase
    .from("assessments")
    .update({
      average_pct: Math.round(averagePct * 10) / 10,
      bracket_below_pct: Math.round((brackets.below / n) * 1000) / 10,
      bracket_basic_pct: Math.round((brackets.basic / n) * 1000) / 10,
      bracket_proficient_pct: Math.round((brackets.proficient / n) * 1000) / 10,
      bracket_advanced_pct: Math.round((brackets.advanced / n) * 1000) / 10,
    })
    .eq("id", assessmentId);
  if (updateErr) throw updateErr;

  for (const obj of objectives!) {
    const objScores = scores!.filter((s) => s.objective_id === obj.id);
    const avg = objScores.length ? objScores.reduce((a, b) => a + Number(b.score), 0) / objScores.length : 0;
    const { error } = await supabase
      .from("assessment_objectives")
      .update({ class_average: Math.round(avg * 10) / 10 })
      .eq("id", obj.id);
    if (error) throw error;
  }
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

export type StudentFormInput = {
  gradeId: string;
  rollNo: string;
  name: string;
  gender: "M" | "F" | "Other";
  dateOfBirth: string | null;
  section: string | null;
  fatherName: string | null;
  motherName: string | null;
  socialCategory: SocialCategory;
  minorityGroup: MinorityGroup;
  bplBeneficiary: boolean;
  cwsn: boolean;
  impairmentType: string | null;
  repeaterThisYear: boolean;
  studentPen: string | null;
  aadhaarNumber: string | null;
  apaarId: string | null;
  mobileNumber: string | null;
  address: string | null;
  /** academic_year -> grade_id, for the Grade History sub-table. */
  gradeHistory: Record<string, string | null>;
};

function studentRow(input: StudentFormInput) {
  return {
    grade_id: input.gradeId,
    roll_no: input.rollNo,
    name: input.name,
    gender: input.gender,
    date_of_birth: input.dateOfBirth,
    section: input.section,
    father_name: input.fatherName,
    mother_name: input.motherName,
    social_category: input.socialCategory,
    minority_group: input.minorityGroup,
    bpl_beneficiary: input.bplBeneficiary,
    cwsn: input.cwsn,
    impairment_type: input.cwsn ? input.impairmentType : null,
    repeater_this_year: input.repeaterThisYear,
    student_pen: input.studentPen,
    aadhaar_number: input.aadhaarNumber,
    apaar_id: input.apaarId,
    mobile_number: input.mobileNumber,
    address: input.address,
  };
}

async function saveGradeHistory(supabase: ReturnType<typeof createAdminClient>, studentId: string, gradeHistory: Record<string, string | null>) {
  const rows = Object.entries(gradeHistory).map(([academicYear, gradeId]) => ({
    student_id: studentId,
    academic_year: academicYear,
    grade_id: gradeId,
  }));
  if (!rows.length) return;
  const { error } = await supabase.from("student_grade_history").upsert(rows, { onConflict: "student_id,academic_year" });
  if (error) throw error;
}

/** Enrolls a new student — the "+ Enroll student" flow, full field set. */
export async function enrollStudent(input: StudentFormInput) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("students").insert(studentRow(input)).select().single();
  if (error) throw error;
  await saveGradeHistory(supabase, data.id, input.gradeHistory);
}

/** Edits an existing student's info — the "Edit student info" flow. */
export async function updateStudent(id: string, input: StudentFormInput) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("students").update(studentRow(input)).eq("id", id);
  if (error) throw error;
  await saveGradeHistory(supabase, id, input.gradeHistory);
}

export async function getStudentGradeHistory(studentId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("student_grade_history").select("*").eq("student_id", studentId);
  if (error) throw error;
  return data;
}

/** "Take attendance" — writes one attendance_daily row per student for the
 * date, updates each student's consecutive-days-missed alert, and bumps
 * the existing grade-level aggregates (attendance_records / _monthly) with
 * a simple blended running average, matching the mockup's own heuristic
 * rather than a full recompute-from-raw-data pass. */
export async function submitAttendanceRoster(input: {
  gradeId: string;
  recordDate: string;
  entries: { studentId: string; present: boolean }[];
}) {
  const supabase = createAdminClient();

  const { error: dailyErr } = await supabase.from("attendance_daily").upsert(
    input.entries.map((e) => ({ student_id: e.studentId, record_date: input.recordDate, present: e.present })),
    { onConflict: "student_id,record_date" }
  );
  if (dailyErr) throw dailyErr;

  const presentCount = input.entries.filter((e) => e.present).length;
  const totalCount = input.entries.length;

  const { error: recordErr } = await supabase.from("attendance_records").insert({
    grade_id: input.gradeId,
    record_date: input.recordDate,
    present_count: presentCount,
    total_count: totalCount,
  });
  if (recordErr) throw recordErr;

  const todayPct = totalCount > 0 ? (presentCount / totalCount) * 100 : 0;
  const { data: latestMonthly } = await supabase
    .from("attendance_monthly")
    .select("*")
    .eq("grade_id", input.gradeId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (latestMonthly) {
    const blended = (Number(latestMonthly.attendance_pct) + todayPct) / 2;
    await supabase
      .from("attendance_monthly")
      .update({ attendance_pct: Math.round(blended * 10) / 10 })
      .eq("id", latestMonthly.id);
  }

  for (const e of input.entries) {
    const { data: alert } = await supabase
      .from("attendance_alerts")
      .select("*")
      .eq("student_id", e.studentId)
      .maybeSingle();
    if (e.present) {
      if (alert) await supabase.from("attendance_alerts").delete().eq("id", alert.id);
    } else {
      const nextCount = (alert?.consecutive_days_missed ?? 0) + 1;
      if (alert) {
        await supabase.from("attendance_alerts").update({ consecutive_days_missed: nextCount, status: "open" }).eq("id", alert.id);
      } else {
        await supabase.from("attendance_alerts").insert({ student_id: e.studentId, consecutive_days_missed: nextCount, status: "open" });
      }
    }
  }
}
