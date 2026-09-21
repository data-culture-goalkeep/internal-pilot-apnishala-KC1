-- Khoj Dashboard schema. Dedicated schema per this repo's convention
-- (mirrors key-questions-interface's kq_navigator / mockup_navigator split).
-- No auth/RLS boundary for this pass (internal pilot, no-auth dashboard,
-- same posture as that repo's Mockup Navigator): anon reads are public,
-- all writes go through server actions on the service-role client.

create schema if not exists khoj_dashboard;

grant usage on schema khoj_dashboard to anon, authenticated, service_role;
alter default privileges in schema khoj_dashboard grant select on tables to anon, authenticated;
alter default privileges in schema khoj_dashboard grant all on tables to service_role;
alter default privileges in schema khoj_dashboard grant usage, select on sequences to anon, authenticated, service_role;

-- Grades -----------------------------------------------------------------

create table khoj_dashboard.grades (
  id uuid primary key default gen_random_uuid(),
  code text not null unique, -- 'LKG','UKG','1'..'10'
  label text not null,
  sort_order int not null
);

-- Students / enrollment ---------------------------------------------------

create table khoj_dashboard.students (
  id uuid primary key default gen_random_uuid(),
  grade_id uuid not null references khoj_dashboard.grades(id) on delete cascade,
  roll_no text not null,
  name text not null,
  gender text not null check (gender in ('M', 'F', 'Other')),
  created_at timestamptz not null default now()
);
create index on khoj_dashboard.students(grade_id);

-- Formative / Summative assessments ---------------------------------------

create table khoj_dashboard.assessments (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('formative', 'summative')),
  grade_id uuid not null references khoj_dashboard.grades(id) on delete cascade,
  subject text not null,
  round_label text not null, -- e.g. 'Round 1', 'Pre', 'Post'
  assessment_date date not null,
  average_pct numeric(5,2) not null,
  previous_average_pct numeric(5,2), -- for delta-vs-previous-round display
  bracket_below_pct numeric(5,2) not null default 0,
  bracket_basic_pct numeric(5,2) not null default 0,
  bracket_proficient_pct numeric(5,2) not null default 0,
  bracket_advanced_pct numeric(5,2) not null default 0,
  created_at timestamptz not null default now()
);
create index on khoj_dashboard.assessments(kind, grade_id);
create index on khoj_dashboard.assessments(kind, subject);

create table khoj_dashboard.assessment_objectives (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references khoj_dashboard.assessments(id) on delete cascade,
  objective_text text not null,
  max_marks numeric(5,2) not null,
  class_average numeric(5,2) not null
);
create index on khoj_dashboard.assessment_objectives(assessment_id);

-- Coverage-by-month (formative/summative coverage chart) ------------------

create table khoj_dashboard.assessment_coverage_months (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('formative', 'summative')),
  grade_id uuid not null references khoj_dashboard.grades(id) on delete cascade,
  month_label text not null, -- e.g. 'Jun', 'Jul'
  coverage_pct numeric(5,2) not null,
  sort_order int not null
);
create index on khoj_dashboard.assessment_coverage_months(kind, grade_id);

-- Attendance + enrollment --------------------------------------------------

create table khoj_dashboard.attendance_monthly (
  id uuid primary key default gen_random_uuid(),
  grade_id uuid not null references khoj_dashboard.grades(id) on delete cascade,
  month_label text not null,
  attendance_pct numeric(5,2) not null,
  sort_order int not null
);
create index on khoj_dashboard.attendance_monthly(grade_id);

create table khoj_dashboard.attendance_records (
  id uuid primary key default gen_random_uuid(),
  grade_id uuid not null references khoj_dashboard.grades(id) on delete cascade,
  record_date date not null,
  present_count int not null,
  total_count int not null,
  created_at timestamptz not null default now()
);
create index on khoj_dashboard.attendance_records(grade_id, record_date desc);

create table khoj_dashboard.student_attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references khoj_dashboard.students(id) on delete cascade,
  month_label text not null,
  attendance_pct numeric(5,2) not null,
  sort_order int not null
);
create index on khoj_dashboard.student_attendance(student_id);

create table khoj_dashboard.attendance_alerts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references khoj_dashboard.students(id) on delete cascade,
  consecutive_days_missed int not null,
  status text not null default 'open' check (status in ('open', 'actioned')),
  created_at timestamptz not null default now()
);

-- SEL & Holistic (Observation + Self-Report) -------------------------------

create table khoj_dashboard.sel_parameters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order int not null
);

create table khoj_dashboard.sel_scores (
  id uuid primary key default gen_random_uuid(),
  grade_id uuid not null references khoj_dashboard.grades(id) on delete cascade,
  parameter_id uuid not null references khoj_dashboard.sel_parameters(id) on delete cascade,
  period_label text not null, -- cycle, e.g. 'Cycle 1'
  method text not null check (method in ('observation', 'self_report')),
  thrive_pct numeric(5,2) not null,
  resist_pct numeric(5,2) not null
);
create index on khoj_dashboard.sel_scores(grade_id, period_label);

-- Situational Judgement Test (SJT) — provisional scoring, per handoff -----

create table khoj_dashboard.sel_domains (
  id uuid primary key default gen_random_uuid(),
  name text not null unique, -- Collaboration, Emotional Regulation, Responsible Decision-Making, Self-Awareness, Self-Regulation
  sort_order int not null
);

create table khoj_dashboard.sjt_situations (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  sort_order int not null
);

create table khoj_dashboard.sjt_responses (
  id uuid primary key default gen_random_uuid(),
  situation_id uuid not null references khoj_dashboard.sjt_situations(id) on delete cascade,
  grade_id uuid references khoj_dashboard.grades(id) on delete cascade, -- null = All (grades 6-10 aggregate)
  option_a_pct numeric(5,2) not null default 0,
  option_b_pct numeric(5,2) not null default 0,
  option_c_pct numeric(5,2) not null default 0,
  option_d_pct numeric(5,2) not null default 0
);
create index on khoj_dashboard.sjt_responses(situation_id, grade_id);

create table khoj_dashboard.sjt_competency_scores (
  id uuid primary key default gen_random_uuid(),
  grade_id uuid references khoj_dashboard.grades(id) on delete cascade, -- null = All
  domain_id uuid not null references khoj_dashboard.sel_domains(id) on delete cascade,
  score_pct numeric(5,2) not null -- placeholder/generic score field; real competency-map calc is separate follow-up work
);
create index on khoj_dashboard.sjt_competency_scores(grade_id);

create table khoj_dashboard.sjt_coverage (
  id uuid primary key default gen_random_uuid(),
  grade_id uuid references khoj_dashboard.grades(id) on delete cascade, -- null = All (grades 6-10)
  coverage_pct numeric(5,2) not null
);

-- SEL Assessment Form data entry (Observation / SJT / Student Response) ---
-- Partial-save behavior needs a natural unique key per student/grade/cycle/
-- assessment-type, per the design handoff's "State Management" note.

create table khoj_dashboard.sel_responses (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references khoj_dashboard.students(id) on delete cascade,
  grade_id uuid not null references khoj_dashboard.grades(id) on delete cascade,
  cycle_label text not null,
  assessment_type text not null check (assessment_type in ('observation', 'sjt', 'student_response')),
  payload jsonb not null default '{}'::jsonb,
  submitted boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (student_id, grade_id, cycle_label, assessment_type)
);
create index on khoj_dashboard.sel_responses(grade_id, cycle_label, assessment_type);

-- Individual Student Growth -------------------------------------------------

create table khoj_dashboard.student_growth (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references khoj_dashboard.students(id) on delete cascade,
  subject text not null,
  pre_score numeric(5,2) not null,
  post_score numeric(5,2) not null
);
create index on khoj_dashboard.student_growth(student_id);

-- Overview -------------------------------------------------------------------

create table khoj_dashboard.action_queue (
  id uuid primary key default gen_random_uuid(),
  grade_id uuid references khoj_dashboard.grades(id) on delete cascade, -- null = org-wide (Leadership)
  category text not null, -- 'attendance' | 'formative' | 'summative' | 'sel'
  description text not null,
  status text not null default 'open' check (status in ('open', 'dismissed')),
  created_at timestamptz not null default now()
);
create index on khoj_dashboard.action_queue(grade_id, status);

create table khoj_dashboard.bracket_movement (
  id uuid primary key default gen_random_uuid(),
  grade_id uuid not null references khoj_dashboard.grades(id) on delete cascade,
  round_label text not null check (round_label in ('pre', 'post')),
  below_pct numeric(5,2) not null,
  basic_pct numeric(5,2) not null,
  proficient_pct numeric(5,2) not null,
  advanced_pct numeric(5,2) not null
);
create index on khoj_dashboard.bracket_movement(grade_id);

create table khoj_dashboard.top_movers (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references khoj_dashboard.students(id) on delete cascade,
  delta_pct numeric(5,2) not null,
  cycle_label text not null
);

create table khoj_dashboard.overview_stats (
  id uuid primary key default gen_random_uuid(),
  grade_id uuid references khoj_dashboard.grades(id) on delete cascade, -- null = org-wide (Leadership)
  enrollment_count int not null,
  boys_count int not null,
  girls_count int not null,
  attendance_this_month_pct numeric(5,2) not null,
  formative_coverage_pct numeric(5,2) not null,
  attendance_alert_threshold_pct numeric(5,2) not null default 85
);
