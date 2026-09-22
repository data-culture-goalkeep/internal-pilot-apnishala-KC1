export type Grade = {
  id: string;
  code: string;
  label: string;
  sort_order: number;
};

export type Role = "teacher" | "leadership";

export type SocialCategory = "General" | "OBC" | "SC" | "ST" | "EWS";
export type MinorityGroup = "None" | "Muslim" | "Christian" | "Sikh" | "Buddhist" | "Other";

export type Student = {
  id: string;
  grade_id: string;
  roll_no: string;
  name: string;
  gender: "M" | "F" | "Other";
  date_of_birth: string | null;
  section: string | null;
  father_name: string | null;
  mother_name: string | null;
  social_category: SocialCategory;
  minority_group: MinorityGroup;
  bpl_beneficiary: boolean;
  cwsn: boolean;
  impairment_type: string | null;
  repeater_this_year: boolean;
  student_pen: string | null;
  aadhaar_number: string | null;
  apaar_id: string | null;
  mobile_number: string | null;
  address: string | null;
};

export type StudentGradeHistory = {
  id: string;
  student_id: string;
  academic_year: string;
  grade_id: string | null;
};

export type AssessmentKind = "formative" | "summative";

export type Assessment = {
  id: string;
  kind: AssessmentKind;
  grade_id: string;
  subject: string;
  round_label: string;
  assessment_date: string;
  average_pct: number;
  previous_average_pct: number | null;
  bracket_below_pct: number;
  bracket_basic_pct: number;
  bracket_proficient_pct: number;
  bracket_advanced_pct: number;
};

export type ObjectiveCategory = "oral" | "written";

export type AssessmentObjective = {
  id: string;
  assessment_id: string;
  objective_text: string;
  max_marks: number;
  class_average: number;
  category: ObjectiveCategory | null;
};

export type AssessmentScore = {
  id: string;
  assessment_id: string;
  objective_id: string;
  student_id: string;
  score: number;
};

export type CoverageMonth = {
  id: string;
  kind: AssessmentKind;
  grade_id: string;
  month_label: string;
  coverage_pct: number;
  sort_order: number;
};

export type AttendanceMonthly = {
  id: string;
  grade_id: string;
  month_label: string;
  attendance_pct: number;
  sort_order: number;
};

export type AttendanceRecord = {
  id: string;
  grade_id: string;
  record_date: string;
  present_count: number;
  total_count: number;
};

export type StudentAttendance = {
  student_id: string;
  month_label: string;
  attendance_pct: number;
  sort_order: number;
};

export type AttendanceDaily = {
  id: string;
  student_id: string;
  record_date: string;
  present: boolean;
};

export type AttendanceAlert = {
  id: string;
  student_id: string;
  consecutive_days_missed: number;
  status: "open" | "actioned";
};

export type SelParameter = { id: string; name: string; sort_order: number };

export type SelScore = {
  grade_id: string;
  parameter_id: string;
  period_label: string;
  method: "observation" | "self_report";
  thrive_pct: number;
  resist_pct: number;
};

export type SelDomain = { id: string; name: string; sort_order: number };

export type SjtSituation = { id: string; title: string; sort_order: number };

export type SjtResponse = {
  situation_id: string;
  grade_id: string | null;
  option_a_pct: number;
  option_b_pct: number;
  option_c_pct: number;
  option_d_pct: number;
};

export type SjtCompetencyScore = {
  grade_id: string | null;
  domain_id: string;
  score_pct: number;
};

export type SjtCoverage = { grade_id: string | null; coverage_pct: number };

export type SelAssessmentType = "observation" | "sjt" | "student_response";

export type SelResponse = {
  id: string;
  student_id: string;
  grade_id: string;
  cycle_label: string;
  assessment_type: SelAssessmentType;
  payload: Record<string, unknown>;
  submitted: boolean;
  updated_at: string;
};

export type StudentGrowth = {
  student_id: string;
  subject: string;
  pre_score: number;
  post_score: number;
};

export type ActionQueueItem = {
  id: string;
  grade_id: string | null;
  category: string;
  description: string;
  status: "open" | "dismissed";
};

export type BracketMovement = {
  grade_id: string;
  round_label: "pre" | "post";
  below_pct: number;
  basic_pct: number;
  proficient_pct: number;
  advanced_pct: number;
};

export type TopMover = {
  student_id: string;
  delta_pct: number;
  cycle_label: string;
};

export type OverviewStats = {
  grade_id: string | null;
  enrollment_count: number;
  boys_count: number;
  girls_count: number;
  attendance_this_month_pct: number;
  formative_coverage_pct: number;
  attendance_alert_threshold_pct: number;
};

/** Everything the dashboard shell fetches in one combined server action —
 * grade/"All" scoping happens client-side against this cached payload
 * (mirrors key-questions-interface's ProjectDataProvider approach, but this
 * dataset is small enough not to warrant per-view Supabase round-trips). */
export type KhojData = {
  grades: Grade[];
  students: Student[];
  assessments: Assessment[];
  objectives: AssessmentObjective[];
  coverageMonths: CoverageMonth[];
  attendanceMonthly: AttendanceMonthly[];
  attendanceRecords: AttendanceRecord[];
  studentAttendance: StudentAttendance[];
  attendanceAlerts: AttendanceAlert[];
  selParameters: SelParameter[];
  selScores: SelScore[];
  selDomains: SelDomain[];
  sjtSituations: SjtSituation[];
  sjtResponses: SjtResponse[];
  sjtCompetencyScores: SjtCompetencyScore[];
  sjtCoverage: SjtCoverage[];
  studentGrowth: StudentGrowth[];
  actionQueue: ActionQueueItem[];
  bracketMovement: BracketMovement[];
  topMovers: TopMover[];
  overviewStats: OverviewStats[];
};

export const BRACKET_LABELS = ["Below Basic", "Basic", "Proficient", "Advanced"] as const;

export const SEL_DOMAINS_TAXONOMY = [
  "Collaboration",
  "Emotional Regulation",
  "Responsible Decision-Making",
  "Self-Awareness",
  "Self-Regulation",
] as const;

/** Grades 6-10 are the only ones eligible for SJT / Student Response, per
 * the SEL Assessment Form's grade-gating rule. */
export function isSjtEligible(gradeCode: string) {
  const n = Number(gradeCode);
  return Number.isFinite(n) && n >= 6 && n <= 10;
}
