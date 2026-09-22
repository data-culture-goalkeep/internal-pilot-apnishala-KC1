/**
 * Seeds dummy/dev data for the Khoj Dashboard into the khoj_dashboard schema.
 * Run with `npm run seed` (needs .env.local per .env.example, with a
 * SUPABASE_SERVICE_ROLE_KEY that can write to khoj_dashboard).
 */
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { db: { schema: "khoj_dashboard" } }
);

const GRADE_DEFS = [
  { code: "LKG", label: "LKG" },
  { code: "UKG", label: "UKG" },
  ...Array.from({ length: 10 }, (_, i) => ({ code: String(i + 1), label: `Grade ${i + 1}` })),
];

const SUBJECTS = ["Math", "Language", "EVS"];
const FORMATIVE_MONTHS = ["Jun", "Jul", "Aug", "Sep", "Oct"];
const SEL_PARAMETERS = [
  "Self-Awareness",
  "Emotional Regulation",
  "Collaboration",
  "Empathy",
  "Responsible Decision-Making",
];
const SEL_DOMAINS = [
  "Collaboration",
  "Emotional Regulation",
  "Responsible Decision-Making",
  "Self-Awareness",
  "Self-Regulation",
];
const SJT_SITUATIONS = [
  "A classmate is being left out of a group activity",
  "You disagree with a friend's plan for a shared project",
  "You made a mistake that affected your team",
  "A friend asks you to copy their homework",
];
const FIRST_NAMES = ["Aarav", "Diya", "Vihaan", "Ananya", "Ishaan", "Myra", "Kabir", "Saanvi", "Arjun", "Riya", "Reyansh", "Aadhya", "Vivaan", "Anika", "Shaurya"];
const LAST_NAMES = ["Sharma", "Patel", "Kumar", "Singh", "Gupta", "Rao", "Nair", "Mehta", "Joshi", "Verma"];
const SECTIONS = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
const SOCIAL_CATEGORIES = ["General", "OBC", "SC", "ST", "EWS"];
const MINORITY_GROUPS = ["None", "None", "None", "Muslim", "Christian", "Sikh", "Buddhist", "Other"];
const IMPAIRMENT_TYPES = ["Visual", "Hearing", "Locomotor", "Speech and language"];

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function pick<T>(arr: readonly T[], seed: number) {
  return arr[seed % arr.length];
}
function rand(min: number, max: number, seed: number) {
  const x = Math.sin(seed) * 10000;
  const frac = x - Math.floor(x);
  return Math.round((min + frac * (max - min)) * 10) / 10;
}
function bracketSplit(seed: number) {
  const below = Math.max(2, rand(5, 20, seed));
  const basic = Math.max(5, rand(15, 30, seed + 1));
  const proficient = Math.max(10, rand(25, 40, seed + 2));
  const advanced = Math.max(100 - below - basic - proficient, 5);
  return { below, basic, proficient, advanced };
}

async function main() {
  console.log("Seeding khoj_dashboard...");

  // Grades ------------------------------------------------------------
  const { data: grades, error: gradesErr } = await supabase
    .from("grades")
    .upsert(
      GRADE_DEFS.map((g, i) => ({ code: g.code, label: g.label, sort_order: i })),
      { onConflict: "code" }
    )
    .select();
  if (gradesErr) throw gradesErr;

  // Students ------------------------------------------------------------
  await supabase.from("students").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const studentRows = [];
  let s = 0;
  for (const g of grades!) {
    const count = 30 + (s % 15);
    for (let i = 0; i < count; i++) {
      s++;
      const isCwsn = s % 20 === 0;
      studentRows.push({
        grade_id: g.id,
        roll_no: String(i + 1).padStart(2, "0"),
        name: `${pick(FIRST_NAMES, s)} ${pick(LAST_NAMES, s + 3)}`,
        gender: s % 2 === 0 ? "M" : "F",
        date_of_birth: `${2008 + (s % 12)}-${String((s % 12) + 1).padStart(2, "0")}-${String((s % 27) + 1).padStart(2, "0")}`,
        section: pick(SECTIONS, s),
        father_name: `${pick(FIRST_NAMES, s + 5)} ${pick(LAST_NAMES, s)}`,
        mother_name: `${pick(FIRST_NAMES, s + 8)} ${pick(LAST_NAMES, s)}`,
        social_category: pick(SOCIAL_CATEGORIES, s),
        minority_group: pick(MINORITY_GROUPS, s),
        bpl_beneficiary: s % 9 === 0,
        cwsn: isCwsn,
        impairment_type: isCwsn ? pick(IMPAIRMENT_TYPES, s) : null,
        repeater_this_year: s % 25 === 0,
        student_pen: `PEN${String(100000 + s)}`,
        aadhaar_number: `${String(s).padStart(4, "0")}${String(s * 7).padStart(4, "0")}${String(s * 13).padStart(4, "0")}`,
        apaar_id: `APAAR${String(200000 + s)}`,
        mobile_number: `9${String(800000000 + s * 37).slice(0, 9)}`,
        address: `${(s % 40) + 1}, ${pick(LAST_NAMES, s)} Colony, Pune`,
      });
    }
  }
  const { data: students, error: studentsErr } = await supabase
    .from("students")
    .insert(studentRows)
    .select();
  if (studentsErr) throw studentsErr;

  // Grade history: current year + previous 2 (mostly today's grade) -----
  await supabase.from("student_grade_history").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const AY_LABELS = ["AY 2026-27", "AY 2025-26", "AY 2024-25"];
  const gradeHistoryRows = students!.flatMap((stu) =>
    AY_LABELS.map((ay) => ({ student_id: stu.id, academic_year: ay, grade_id: stu.grade_id }))
  );
  for (const batch of chunk(gradeHistoryRows, 1000)) {
    const { error } = await supabase.from("student_grade_history").insert(batch);
    if (error) throw error;
  }

  // Assessments (formative + summative) ---------------------------------
  await supabase.from("assessments").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const assessmentRows = [];
  let a = 0;
  for (const g of grades!) {
    for (const subject of SUBJECTS) {
      for (const kind of ["formative", "summative"] as const) {
        const rounds = kind === "formative" ? ["Round 1", "Round 2"] : ["Pre", "Post"];
        let prevAvg: number | null = null;
        for (const round of rounds) {
          a++;
          const avg = rand(45, 85, a);
          const brackets = bracketSplit(a);
          assessmentRows.push({
            kind,
            grade_id: g.id,
            subject,
            round_label: round,
            assessment_date: `2026-0${(a % 5) + 4}-15`,
            average_pct: avg,
            previous_average_pct: prevAvg,
            bracket_below_pct: brackets.below,
            bracket_basic_pct: brackets.basic,
            bracket_proficient_pct: brackets.proficient,
            bracket_advanced_pct: brackets.advanced,
          });
          prevAvg = avg;
        }
      }
    }
  }
  const { data: assessments, error: assessmentsErr } = await supabase
    .from("assessments")
    .insert(assessmentRows)
    .select();
  if (assessmentsErr) throw assessmentsErr;

  // Objectives for latest formative assessment per grade/subject --------
  const objectiveRows = [];
  for (const asm of assessments!.filter((x) => x.kind === "formative" && x.round_label === "Round 2")) {
    for (let i = 0; i < 3; i++) {
      objectiveRows.push({
        assessment_id: asm.id,
        objective_text: `${asm.subject} objective ${i + 1}`,
        max_marks: 10,
        class_average: rand(4, 9, i + asm.average_pct),
      });
    }
  }
  let objectives: { id: string; assessment_id: string; max_marks: number }[] = [];
  if (objectiveRows.length) {
    await supabase.from("assessment_objectives").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    const { data, error } = await supabase.from("assessment_objectives").insert(objectiveRows).select();
    if (error) throw error;
    objectives = data!;
  }

  // Per-student, per-objective scores for those same formative assessments —
  // gives the score-entry grid real data to show immediately.
  await supabase.from("assessment_scores").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const objectivesByAssessment = new Map<string, typeof objectives>();
  for (const obj of objectives) {
    const list = objectivesByAssessment.get(obj.assessment_id) ?? [];
    list.push(obj);
    objectivesByAssessment.set(obj.assessment_id, list);
  }
  const scoreRows: { assessment_id: string; objective_id: string; student_id: string; score: number }[] = [];
  let sq = 0;
  for (const asm of assessments!.filter((x) => x.kind === "formative" && x.round_label === "Round 2")) {
    const objs = objectivesByAssessment.get(asm.id) ?? [];
    const gradeStudents = students!.filter((stu) => stu.grade_id === asm.grade_id);
    for (const stu of gradeStudents) {
      for (const obj of objs) {
        sq++;
        scoreRows.push({
          assessment_id: asm.id,
          objective_id: obj.id,
          student_id: stu.id,
          score: Math.min(obj.max_marks, rand(2, obj.max_marks, sq)),
        });
      }
    }
  }
  for (const batch of chunk(scoreRows, 1000)) {
    const { error } = await supabase.from("assessment_scores").insert(batch);
    if (error) throw error;
  }

  // Coverage by month -----------------------------------------------------
  await supabase.from("assessment_coverage_months").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const coverageRows: { kind: "formative" | "summative"; grade_id: string; month_label: string; coverage_pct: number; sort_order: number }[] = [];
  let c = 0;
  for (const g of grades!) {
    for (const kind of ["formative", "summative"] as const) {
      FORMATIVE_MONTHS.forEach((month, idx) => {
        c++;
        coverageRows.push({
          kind,
          grade_id: g.id,
          month_label: month,
          coverage_pct: rand(40, 95, c),
          sort_order: idx,
        });
      });
    }
  }
  await supabase.from("assessment_coverage_months").insert(coverageRows).then(({ error }) => { if (error) throw error; });

  // Attendance --------------------------------------------------------------
  await supabase.from("attendance_monthly").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("attendance_records").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("student_attendance").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("attendance_alerts").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  const attendanceMonthlyRows: { grade_id: string; month_label: string; attendance_pct: number; sort_order: number }[] = [];
  let att = 0;
  for (const g of grades!) {
    FORMATIVE_MONTHS.forEach((month, idx) => {
      att++;
      attendanceMonthlyRows.push({
        grade_id: g.id,
        month_label: month,
        attendance_pct: rand(65, 96, att),
        sort_order: idx,
      });
    });
  }
  await supabase.from("attendance_monthly").insert(attendanceMonthlyRows).then(({ error }) => { if (error) throw error; });

  const attendanceRecordRows = [];
  let ar = 0;
  for (const g of grades!) {
    for (let d = 1; d <= 5; d++) {
      ar++;
      const total = 30 + (ar % 15);
      attendanceRecordRows.push({
        grade_id: g.id,
        record_date: `2026-09-${String(d).padStart(2, "0")}`,
        present_count: Math.round(total * (rand(0.7, 0.97, ar) / 1)),
        total_count: total,
      });
    }
  }
  await supabase.from("attendance_records").insert(attendanceRecordRows).then(({ error }) => { if (error) throw error; });

  // Per-student daily roster — real backing data for "Take attendance" ------
  await supabase.from("attendance_daily").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const attendanceDailyRows: { student_id: string; record_date: string; present: boolean }[] = [];
  let ad = 0;
  for (const stu of students!) {
    for (let d = 1; d <= 5; d++) {
      ad++;
      attendanceDailyRows.push({
        student_id: stu.id,
        record_date: `2026-09-${String(d).padStart(2, "0")}`,
        present: rand(0, 1, ad) > 0.12,
      });
    }
  }
  for (const batch of chunk(attendanceDailyRows, 1000)) {
    const { error } = await supabase.from("attendance_daily").insert(batch);
    if (error) throw error;
  }

  const studentAttendanceRows: { student_id: string; month_label: string; attendance_pct: number; sort_order: number }[] = [];
  let sa = 0;
  for (const stu of students!) {
    FORMATIVE_MONTHS.forEach((month, idx) => {
      sa++;
      studentAttendanceRows.push({
        student_id: stu.id,
        month_label: month,
        attendance_pct: rand(55, 99, sa),
        sort_order: idx,
      });
    });
  }
  await supabase.from("student_attendance").insert(studentAttendanceRows).then(({ error }) => { if (error) throw error; });

  const alertRows = students!
    .filter((_, i) => i % 12 === 0)
    .map((stu, i) => ({
      student_id: stu.id,
      consecutive_days_missed: 7 + (i % 5),
      status: "open" as const,
    }));
  await supabase.from("attendance_alerts").insert(alertRows).then(({ error }) => { if (error) throw error; });

  // SEL parameters + scores --------------------------------------------------
  await supabase.from("sel_parameters").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const { data: selParams, error: selParamsErr } = await supabase
    .from("sel_parameters")
    .insert(SEL_PARAMETERS.map((name, i) => ({ name, sort_order: i })))
    .select();
  if (selParamsErr) throw selParamsErr;

  await supabase.from("sel_scores").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const selScoreRows = [];
  let sc = 0;
  for (const g of grades!) {
    for (const p of selParams!) {
      for (const method of ["observation", "self_report"] as const) {
        sc++;
        const thrive = rand(45, 85, sc);
        selScoreRows.push({
          grade_id: g.id,
          parameter_id: p.id,
          period_label: "Cycle 1",
          method,
          thrive_pct: thrive,
          resist_pct: 100 - thrive,
        });
      }
    }
  }
  await supabase.from("sel_scores").insert(selScoreRows).then(({ error }) => { if (error) throw error; });

  // SJT (grades 6-10) --------------------------------------------------------
  await supabase.from("sel_domains").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const { data: domains, error: domainsErr } = await supabase
    .from("sel_domains")
    .insert(SEL_DOMAINS.map((name, i) => ({ name, sort_order: i })))
    .select();
  if (domainsErr) throw domainsErr;

  await supabase.from("sjt_situations").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const { data: situations, error: situationsErr } = await supabase
    .from("sjt_situations")
    .insert(SJT_SITUATIONS.map((title, i) => ({ title, sort_order: i })))
    .select();
  if (situationsErr) throw situationsErr;

  const sjtGrades = grades!.filter((g) => Number(g.code) >= 6 && Number(g.code) <= 10);

  await supabase.from("sjt_responses").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const sjtResponseRows: {
    situation_id: string;
    grade_id: string | null;
    option_a_pct: number;
    option_b_pct: number;
    option_c_pct: number;
    option_d_pct: number;
  }[] = [];
  let sj = 0;
  for (const situ of situations!) {
    for (const g of [...sjtGrades, null]) {
      sj++;
      const a1 = rand(10, 40, sj);
      const b1 = rand(10, 40, sj + 1);
      const c1 = rand(10, 30, sj + 2);
      const d1 = Math.max(100 - a1 - b1 - c1, 5);
      sjtResponseRows.push({
        situation_id: situ.id,
        grade_id: g?.id ?? null,
        option_a_pct: a1,
        option_b_pct: b1,
        option_c_pct: c1,
        option_d_pct: d1,
      });
    }
  }
  await supabase.from("sjt_responses").insert(sjtResponseRows).then(({ error }) => { if (error) throw error; });

  await supabase.from("sjt_competency_scores").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const competencyRows: { grade_id: string | null; domain_id: string; score_pct: number }[] = [];
  let cs = 0;
  for (const g of [...sjtGrades, null]) {
    for (const d of domains!) {
      cs++;
      competencyRows.push({ grade_id: g?.id ?? null, domain_id: d.id, score_pct: rand(40, 85, cs) });
    }
  }
  await supabase.from("sjt_competency_scores").insert(competencyRows).then(({ error }) => { if (error) throw error; });

  await supabase.from("sjt_coverage").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const coverageRowsSjt: { grade_id: string | null; coverage_pct: number }[] = [];
  let cv = 0;
  for (const g of [...sjtGrades, null]) {
    cv++;
    coverageRowsSjt.push({ grade_id: g?.id ?? null, coverage_pct: rand(35, 80, cv) });
  }
  await supabase.from("sjt_coverage").insert(coverageRowsSjt).then(({ error }) => { if (error) throw error; });

  // Individual growth ---------------------------------------------------------
  await supabase.from("student_growth").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const growthRows = [];
  let sg = 0;
  for (const stu of students!) {
    for (const subject of SUBJECTS) {
      sg++;
      const pre = rand(30, 70, sg);
      growthRows.push({
        student_id: stu.id,
        subject,
        pre_score: pre,
        post_score: Math.min(100, pre + rand(2, 25, sg + 1)),
      });
    }
  }
  await supabase.from("student_growth").insert(growthRows).then(({ error }) => { if (error) throw error; });

  // Overview: action queue, bracket movement, top movers, stats -------------
  await supabase.from("action_queue").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const actionRows = [
    ...grades!.map((g) => ({
      grade_id: g.id,
      category: "attendance",
      description: `${alertRows.filter((r) => students!.find((s) => s.id === r.student_id)?.grade_id === g.id).length} students in ${g.label} have missed 7+ consecutive teaching days`,
      status: "open" as const,
    })).filter((_, i) => i % 3 === 0),
    { grade_id: null, category: "formative", description: "3 grades have formative coverage below target", status: "open" as const },
  ];
  await supabase.from("action_queue").insert(actionRows).then(({ error }) => { if (error) throw error; });

  await supabase.from("bracket_movement").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const bracketMovementRows = [];
  let bm = 0;
  for (const g of grades!) {
    for (const round of ["pre", "post"] as const) {
      bm++;
      const b = bracketSplit(bm + (round === "post" ? 50 : 0));
      bracketMovementRows.push({
        grade_id: g.id,
        round_label: round,
        below_pct: b.below,
        basic_pct: b.basic,
        proficient_pct: b.proficient,
        advanced_pct: b.advanced,
      });
    }
  }
  await supabase.from("bracket_movement").insert(bracketMovementRows).then(({ error }) => { if (error) throw error; });

  await supabase.from("top_movers").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const topMoverRows = students!
    .filter((_, i) => i % 8 === 0)
    .slice(0, 20)
    .map((stu, i) => ({ student_id: stu.id, delta_pct: rand(8, 30, i), cycle_label: "Round 2" }));
  await supabase.from("top_movers").insert(topMoverRows).then(({ error }) => { if (error) throw error; });

  await supabase.from("overview_stats").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const statsRows = [];
  let ov = 0;
  for (const g of [...grades!, null]) {
    ov++;
    const gradeStudents = g ? students!.filter((s) => s.grade_id === g.id) : students!;
    const boys = gradeStudents.filter((s) => s.gender === "M").length;
    statsRows.push({
      grade_id: g?.id ?? null,
      enrollment_count: gradeStudents.length,
      boys_count: boys,
      girls_count: gradeStudents.length - boys,
      attendance_this_month_pct: rand(65, 95, ov),
      formative_coverage_pct: rand(50, 90, ov + 1),
      attendance_alert_threshold_pct: 85,
    });
  }
  await supabase.from("overview_stats").insert(statsRows).then(({ error }) => { if (error) throw error; });

  console.log(`Seeded ${grades!.length} grades, ${students!.length} students, ${assessments!.length} assessments.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
