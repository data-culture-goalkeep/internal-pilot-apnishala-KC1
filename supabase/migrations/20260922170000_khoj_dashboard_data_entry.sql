-- Extends the schema to support the mockup's actual data-entry flows:
-- full student profile fields, per-year grade history, per-objective
-- per-student assessment scores, and a real per-student daily attendance
-- roster. Additive only — existing aggregate tables (attendance_records,
-- student_attendance, overview_stats, etc.) are untouched and keep feeding
-- the existing charts.

-- Students: full "Enroll student" field set -------------------------------

alter table khoj_dashboard.students
  add column date_of_birth date,
  add column section text,
  add column father_name text,
  add column mother_name text,
  add column social_category text not null default 'General'
    check (social_category in ('General', 'OBC', 'SC', 'ST', 'EWS')),
  add column minority_group text not null default 'None'
    check (minority_group in ('None', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Other')),
  add column bpl_beneficiary boolean not null default false,
  add column cwsn boolean not null default false,
  add column impairment_type text,
  add column repeater_this_year boolean not null default false,
  add column student_pen text,
  add column aadhaar_number text,
  add column apaar_id text,
  add column mobile_number text,
  add column address text;

create table khoj_dashboard.student_grade_history (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references khoj_dashboard.students(id) on delete cascade,
  academic_year text not null, -- e.g. 'AY 2026-27'
  grade_id uuid references khoj_dashboard.grades(id) on delete set null,
  unique (student_id, academic_year)
);
create index on khoj_dashboard.student_grade_history(student_id);

-- Assessments: per-student, per-objective scores ---------------------------
-- assessment_objectives.class_average becomes derived (computed from these
-- rows) rather than a stored input, but the column stays for now as a
-- cached/last-written value — the score-entry flow recomputes and rewrites
-- it (and the assessment's average_pct / bracket_*_pct) after every save.

alter table khoj_dashboard.assessment_objectives
  add column category text check (category in ('oral', 'written'));

create table khoj_dashboard.assessment_scores (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references khoj_dashboard.assessments(id) on delete cascade,
  objective_id uuid not null references khoj_dashboard.assessment_objectives(id) on delete cascade,
  student_id uuid not null references khoj_dashboard.students(id) on delete cascade,
  score numeric(5,2) not null,
  unique (objective_id, student_id)
);
create index on khoj_dashboard.assessment_scores(assessment_id);
create index on khoj_dashboard.assessment_scores(student_id);

-- Attendance: real per-student daily roster ---------------------------------

create table khoj_dashboard.attendance_daily (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references khoj_dashboard.students(id) on delete cascade,
  record_date date not null,
  present boolean not null,
  created_at timestamptz not null default now(),
  unique (student_id, record_date)
);
create index on khoj_dashboard.attendance_daily(student_id, record_date desc);
