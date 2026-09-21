# Handoff: Khoj Dashboard (Teacher/Leadership Analytics + SEL Logging)

## Overview
Khoj Dashboard is a school analytics tool for teachers and school leadership covering Formative Assessments, Summative Assessments, SEL & Holistic Support (including a Situational Judgment Test module), Attendance + Enrollment, and Individual Student Growth. A companion SEL Assessment Form handles data entry for three SEL instruments (Observation, SJT, Student Response) through one unified flow.

## About the Design Files
The files in this bundle (`Khoj Dashboard.dc.html`, `SEL Assessment Form.dc.html`) are **design references built in HTML** — interactive prototypes showing intended layout, content, and behavior. They are not production code to copy in. **Recreate these designs inside the target codebase's existing Next.js/Supabase environment** (see "Target Infrastructure" below), using its established component library, data layer, and conventions — do not port raw HTML/inline styles.

## Target Infrastructure
Build this in the **same repo/infra as `data-culture-goalkeep/key-questions-interface`**:
- **Framework**: Next.js 16 (App Router), React 19, TypeScript.
- **Styling**: Tailwind CSS v4 + shadcn/ui (`radix-ui`, `class-variance-authority`, `tailwind-merge`). Use existing shadcn primitives (Card, Button, Select, Dialog, Table, etc.) rather than hand-rolled markup.
- **Design tokens**: defined in `src/app/globals.css`. Goalkeep brand primitives: `--gk-ink #313032`, `--gk-yellow #E9E626`, `--gk-coral #EA9D93`, `--gk-teal #81C2B2`, `--gk-blue #4E72B8`, `--gk-blue-deep #17479E`. Semantic tokens (`--background`, `--card`, `--muted`, `--border`, etc.) derive from these — use the Tailwind utilities they expose (`bg-card`, `text-muted-foreground`, `border-border`...), not new hex values. A "stage" color language (`--stage-reach/input/output/outcome/impact`) exists for results-chain concepts — not directly applicable here but shows the pattern for domain-specific color-coding (could inspire how SEL domains or assessment brackets get distinct accent colors, done as new semantic tokens in the same file, not ad hoc oklch values).
- **Radius**: buttons/inputs use `--radius` (8px); cards use a fixed `--radius-card` (12px) — follow this split rather than one radius scale.
- **Backend**: Supabase (Postgres, Auth, Row-Level Security) in a dedicated schema (this repo's convention: e.g. `kq_navigator` — use a new schema, e.g. `khoj_dashboard`, for this app's tables). Migrations live in `supabase/migrations/`.
- **Hosting**: Vercel, with PR preview deployments.
- **Fonts**: Inter (sans, via `--font-inter`) is the base; the target repo also wires up Fraunces as a `--font-display` for select hero/H1 moments only. The prototype uses Manrope for headings — either keep Manrope as an added `--font-heading` variable or substitute the repo's existing heading font; confirm with design lead before introducing a third typeface.
- Read `CLAUDE.md` and `AGENTS.md` at the repo root before starting — they document working conventions for this codebase in detail.

## Fidelity
**High-fidelity.** Layouts, copy, chart structures, empty states, and interaction flows are final; colors/typography should be re-mapped onto the target repo's existing Goalkeep design tokens rather than copied literally (the prototype's neutral oklch grays and Manrope/Inter pairing were a generic placeholder system, not the brand system).

## Screens / Views — Khoj Dashboard.dc.html

Shared shell: top bar (logo/home link, Teacher/Leadership role switch, grade selector with an "All" pseudo-grade), left nav (Overview, Formative Assessments, Summative Assessments, SEL & Holistic, Individual Growth, Attendance + Enrollment). A specific grade filters every page's data; "All" switches most pages to a cross-grade aggregate.

### 1. Overview
- **Teacher view**: greeting header, threshold-alert banner (conditional), 3 stat cards, an "Action queue" list (open items with a dismiss/action button, status dot), a bracket-movement chart (pre→post, stacked-bar per grade) and a "Top movers this cycle" list (initials avatar, name, grade, delta).
- **Leadership view**: org-wide KPI cards, same bracket-movement and top-movers modules scoped org-wide.

### 2. Formative Assessments
- Header with "+ New assessment" button (hidden when grade = All, replaced by a hint to pick a grade).
- **New, when grade = All**: "Average score by grade" bar chart — one bar per grade (LKG/3/5 in the dummy data), 0–100% axis, same axis/tick styling as the existing Coverage chart.
- Two-card grid (per specific grade): "Coverage by month" bar chart (also aggregates across grades when "All" is selected) + "Latest assessment" card (subject, date, round label, average %, delta vs. previous round, "Enter/edit scores" button).
- **New**: "Bracket distribution by subject — Formative" stacked bar chart, one bar per subject, 4 segments (Below Basic/Basic/Proficient/Advanced), same colors/legend/layout as the Summative bracket chart below.
- "Objectives assessed — latest formative" table (objective text, max marks, class average).
- "Recently added" table (date, subject, avg, edit/delete).

### 3. Summative Assessments
- Header with "+ New assessment" button (same All-grade gating as Formative).
- **New, when grade = All**: "Average score by grade" bar chart, identical structure to Formative's.
- Two-card grid: "Coverage, pre vs. post" bar chart (with a small note flagging that Grade 6+ observation methodology differs) + "Latest assessment" card (same shape as Formative's).
- "Bracket distribution by subject" stacked bar chart — 4 brackets, one bar per subject, legend to the right.
- "Recently added" table.

### 4. SEL & Holistic Support
- Header with "+ Log SEL data" button → links to `SEL Assessment Form.dc.html` (hidden when grade = All).
- "Observation Tool + Self-Report, combined" card: a period selector, then one row per SEL parameter with two stacked mini-bars (Observation vs. Self-Report), each bar split into "Thrive" / "Resist" segments.
- **New — Situational Judgment Test subsection** (was a placeholder):
  - Small "provisional scoring" note under the subsection header (matches the existing "Grade 6+ observation methodology differs" note style) — flags that competency-map/normalization logic is not final and all values below are placeholders.
  - Two-card row: "Coverage — Grades 6–10" (big % + horizontal progress bar) and "Competency-map summary" (bar chart, one bar per SEL domain: Collaboration, Emotional Regulation, Responsible Decision-Making, Self-Awareness, Self-Regulation — do not alter this taxonomy).
  - "Response distribution by situation" card: one horizontal stacked bar per situation, segments = % of students picking each answer option (A–D), shared legend below.

### 5. Attendance + Enrollment
- Header with "+ Enroll student" / "+ Take today's attendance" buttons (hidden when grade = All).
- "Average attendance % by month" chart: for a specific grade, shows that grade's bars plus a lighter "All grades" overlay bar per month (this dual-bar-per-month pattern is the "Grade vs. All-grades" reference pattern reused for the new Formative/Summative comparison charts, though those are one-bar-per-grade rather than overlretlaid dual bars — see note below).
- "7+ consecutive teaching days missed" list with per-student action button.
- "Attendance records" table (date, present/total, edit/delete).
- "All students" table: roll, name, gender, per-month attendance %, edit action.

> Note on the "reuse the toggle pattern" ask: Attendance's existing pattern is the grade selector itself (a page-level control with an "All" option) driving what a chart shows — specific grade vs. cross-grade. The new Formative/Summative "Average score by grade" charts reuse that exact mechanism (they render only when "All" is selected) rather than introducing a second, separate toggle control.

### 6. Individual Student Growth
(Unchanged in this round — sortable student table.) Out of scope: do not add new raw paginated list tables anywhere else; this table already serves that purpose.

## Screens / Views — SEL Assessment Form.dc.html
Single entry point (opened from all 4 dashboard "Log SEL data" actions):
1. **Setup screen**: Grade dropdown (all grades) → Assessment-type toggle (Observation always enabled; SJT and Student Response only enabled for Grades 6–10, disabled + hinted otherwise, and picking a lower grade auto-falls back to Observation) → Cycle toggle.
2. **Student roster** for the selected grade/cycle.
3. **Mode-specific entry**: vertical question list (Observation), stories-then-questions (SJT), domain-grouped Likert (Student Response). Partial saves persist per student/grade/cycle/assessment-type combination.
4. **Mode-specific summary** view after submission.

## Interactions & Behavior
- Grade selector ("All" + per-grade buttons) is global state; drives every page's data scope and several conditional UI blocks (buttons hidden, hint text shown, charts swapped for cross-grade aggregates).
- Role switch (Teacher/Leadership) changes the Overview page content entirely; does not affect other pages in this prototype (leadership-specific views for other tabs were not designed — confirm before build whether Leadership needs distinct Formative/Summative/etc. views or just Overview).
- All "+ New assessment" / "+ Take attendance" / "+ Enroll student" / "+ Log SEL data" buttons open a modal or route to the SEL form; disabled with an explanatory inline hint when grade = All.
- Delete actions on table rows are immediate (no confirm dialog in the prototype) — flag for confirm-on-delete when building for real data.
- Toast notifications confirm saves ("Scores saved — averages updated just now.", etc.), auto-dismiss ~2.6s.

## State Management
Prototype keeps everything in one client component's local state (grade, tab, role, modal, per-kind assessment maps, roster/attendance logs). For the real build:
- Server-side data per grade/subject/cycle from Supabase (assessments, scores, attendance logs, SEL responses, SJT responses) — grade/"All" scoping should become real query filters/aggregates, not client-side maps.
- SJT scoring/normalization is explicitly **not** part of this handoff — wire the new SJT charts to a placeholder/generic score field and leave the real competency-mapping calculation for separate follow-up work (per product decision).
- SEL Assessment Form's partial-save behavior (per student/grade/cycle/assessment-type) implies a natural unique-constraint key for a `sel_responses` (or similar) table — draft/save state per that composite key.

## Design Tokens
Do not carry over the prototype's literal token values — re-express everything through the target repo's `src/app/globals.css` tokens:
- Brand colors: `--gk-ink`, `--gk-yellow`, `--gk-coral`, `--gk-teal`, `--gk-blue`, `--gk-blue-deep` (see hexes above).
- Semantic surfaces: `--background` (`--bg-canvas` #F7F6F6), `--card` (white), `--border` (`--border-subtle` #E8E6E6), `--muted-foreground` (`--ink-secondary` #5B6472).
- Destructive/danger: `--destructive` (#C23934) — use for delete buttons/error states instead of the prototype's red oklch.
- Radius: 8px (`--radius`) for buttons/inputs, 12px (`--radius-card`) for cards.
- Bracket/competency chart colors: the prototype uses 4 fixed hues for Below Basic/Basic/Proficient/Advanced and reuses them for SJT answer options — when rebuilding, define these as new named chart tokens (following the existing `--chart-1..5` / `--stage-*` pattern) instead of inlining hex/oklch values at each chart.

## Assets
- Logo: `uploads/apni-shala-logo-cc-01.png` (referenced in the prototype's top bar) — confirm with the client whether this or the target repo's existing `public/goalkeep-logo.png` should appear, since Khoj Dashboard is a client-branded product built on Goalkeep's infrastructure.
- All chart "imagery" is CSS-drawn (bars/segments); no other image assets are used.

## Files
- `Khoj Dashboard.dc.html` — main dashboard (Overview, Formative, Summative, SEL & Holistic incl. SJT, Attendance + Enrollment, Individual Growth).
- `SEL Assessment Form.dc.html` — unified SEL data-entry flow.
- `khoj-dashboard-enhancement-brief.md` — the enhancement brief this round of changes was built from (grade-comparison charts, Formative bracket chart, SJT charts).
