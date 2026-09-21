# Khoj Dashboard

School analytics for teachers and school leadership — Formative/Summative Assessments, SEL & Holistic Support (incl. a Situational Judgment Test module), Attendance + Enrollment, and Individual Student Growth — plus a companion SEL Assessment Form for data entry.

Built from the Claude Design handoff in `design_handoff_khoj_dashboard/` (vendored for reference), rebuilt on Goalkeep's standard stack rather than the prototype's raw HTML.

## Stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript
- Tailwind CSS v4, hand-rolled shadcn-style primitives in `src/components/ui/`
- Supabase (Postgres) in a dedicated `khoj_dashboard` schema, on the same shared Goalkeep Supabase project as `key-questions-interface`
- Vercel hosting, `bom1` region (matches the Supabase project's `ap-south-1`)

See `CLAUDE.md` for architecture details.

## Commands

```bash
npm run dev      # start dev server
npm run build    # production build
npm run lint     # eslint
npx tsc --noEmit # typecheck
npm run seed     # seed dummy data (needs .env.local, see .env.example)
```

## Setup

1. Copy `.env.example` to `.env.local` and fill in Supabase credentials (same project as `key-questions-interface`).
2. Apply `supabase/migrations/20260921120000_khoj_dashboard_schema.sql` to that project (via `supabase db push` or the Management API, per `CLAUDE.md`), and add `khoj_dashboard` to the project's exposed API schemas (Settings → API → Data API).
3. `npm run seed` to populate dummy data.
4. `npm run dev`.
