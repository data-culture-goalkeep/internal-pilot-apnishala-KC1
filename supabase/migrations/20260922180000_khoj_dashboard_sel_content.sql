-- Real content for the SEL Assessment Form, replacing placeholders that
-- didn't match the design handoff mockup: a per-item Observation bank
-- (grade-band-specific, with teacher guidance text), real SJT situations
-- with bilingual story + 4 lettered options (was generic "Option A/B/C/D"
-- placeholders), and a real Student Response statement bank with domain
-- codes. Also corrects `sel_domains` to the mockup's actual CASEL-style
-- taxonomy (Self Awareness / Self Management / Social Awareness /
-- Relationship Skills / Responsible Decision Making) — the previous seed
-- used a taxonomy taken from the design handoff README's summary, which
-- turned out not to match the actual prototype file.

-- Observation item bank ------------------------------------------------------

create table khoj_dashboard.sel_observation_items (
  id uuid primary key default gen_random_uuid(),
  code text not null, -- e.g. 'sa1' — matches the mockup's item ids, not unique across bands
  band text not null check (band in ('k3', 'g4')), -- k3 = LKG-3, g4 = Grade 4-10
  domain_id uuid not null references khoj_dashboard.sel_domains(id) on delete cascade,
  title text not null,
  guidance text, -- teacher-facing observational prompt; nullable per the mockup (some items have none)
  sort_order int not null
);
create index on khoj_dashboard.sel_observation_items(band, sort_order);

-- SJT situations: extend with real bilingual story + 4 options -------------

alter table khoj_dashboard.sjt_situations
  add column story_en text,
  add column story_hi text,
  add column options_en text[],
  add column options_hi text[];

-- Student Response statement bank -------------------------------------------

create table khoj_dashboard.sel_response_items (
  id uuid primary key default gen_random_uuid(),
  code text not null, -- e.g. 'SA1' — repeats across rows, not unique (mockup has 2 statements for some codes)
  domain_id uuid not null references khoj_dashboard.sel_domains(id) on delete cascade,
  statement_en text not null,
  statement_hi text not null,
  sort_order int not null
);
create index on khoj_dashboard.sel_response_items(sort_order);
