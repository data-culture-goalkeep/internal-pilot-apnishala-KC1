# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## What this app is

Khoj Dashboard — a school analytics app for teachers and leadership, built from the Claude Design handoff in `design_handoff_khoj_dashboard/` (an HTML prototype; reference only, not source). Built on the same infra/conventions as the sibling repo `data-culture-goalkeep/key-questions-interface` (Next.js/Tailwind/shadcn/Supabase/Vercel), as its own standalone repo/deploy.

No auth in this pass — internal pilot, same posture as key-questions-interface's Mockup Navigator (public reads, service-role writes via server actions).

## Git workflow

`main` is the only long-lived branch and is the repo's default. All work happens on a `feature/*` branch, with a PR opened into `main` at the end of each round of work — never push directly to `main`. Claude never merges a PR itself; the repo owner merges, or explicitly tells Claude to. Note in each PR description whether it's expected to affect the Vercel preview/production deploy (e.g. env var changes, new routes).

## Architecture

**Data cache**: `src/app/(dashboard)/layout.tsx` renders `<KhojDataProvider>` (`src/lib/khoj/khoj-data-provider.tsx`), which calls the single combined server action `getKhojData()` (`src/lib/khoj/khoj-data.ts`) on mount and caches the whole dataset in React context — every view reads from `useKhojData()` / `KhojDataGate` rather than issuing its own Supabase query. The full dataset for one school is small enough that this is simpler than key-questions-interface's `refresh()`/sequence-number machinery; if that changes, port the pattern.

**Grade/role scoping**: `gradeCode` ("All" or a grade code) and `role` (`teacher`/`leadership`) live in `KhojDataProvider`, driving the top bar's controls and every view's filtering via `useGradeScope()` (`src/lib/khoj/scope.ts`). "All" switches most pages to a cross-grade aggregate rather than hiding data — see each view for its specific aggregate behavior (README in `design_handoff_khoj_dashboard/` has the authoritative per-screen spec).

**Mutations**: server actions in `src/lib/khoj/actions.ts` (`"use server"`), using the service-role client (`src/lib/supabase/admin.ts`) — no RLS boundary in this pass, so these are the only write path. Callers `await refresh()` from `useKhojData()` after a mutation.

**Charts**: hand-rolled CSS bar/stacked-bar/progress components in `src/components/charts/` (no charting library) — themed via the bracket/SEL chart tokens in `globals.css`, not inline hex values.

### Supabase specifics

- All three client constructors (`src/lib/supabase/{client,server,admin}.ts`) pass `db: { schema: "khoj_dashboard" }` — shares the Goalkeep Supabase project used by `key-questions-interface`, in its own schema (same split as that repo's `kq_navigator`/`mockup_navigator`).
- Migrations live in `supabase/migrations/`, timestamp-prefixed. If `supabase db push` is unreliable (same issue key-questions-interface hit), apply the SQL directly via the Supabase Management API while keeping the `.sql` file committed.
- After applying a migration, `khoj_dashboard` needs to be added to the hosted project's exposed Data API schemas (Settings → API) — `supabase/config.toml` only governs local `supabase start`.
- `npm run seed` (`scripts/seed.ts`) populates dummy grades/students/assessments/attendance/SEL/SJT data with the service-role client.

### Design tokens

Priority is visual fidelity to the design handoff mockup (`design_handoff_khoj_dashboard/*.dc.html`), not a strict remap onto Goalkeep's existing brand tokens — where the mockup's actual `oklch()` values differ from Goalkeep's palette (e.g. the gold/mustard accent, the bracket scale), the mockup wins and is kept as `oklch()` verbatim in `globals.css` (Tailwind v4 / evergreen browsers handle `oklch()` natively, so there's no lossy hex conversion). Goalkeep brand tokens (`--gk-ink/yellow/coral/teal/blue/blue-deep`) are still ported and still used in places that don't conflict with the mockup. `--radius` 8px / `--radius-card` 14px (mockup's card radius, not Goalkeep's 12px).

Khoj-specific tokens: `--bracket-below/basic/proficient/advanced` (the 4-tier assessment bracket scale — red/amber/light-green/deep-green per the mockup, reused verbatim for SJT answer options A–D — **not** `--gk-blue-deep`, that was a bug from an earlier pass), `--sel-thrive/resist`, `--accent-gold`/`--accent-gold-strong` (+ `-ink` variants — selected grade pill and primary buttons), `--nav-active-bg/ink/dot`, `--status-positive/negative/neutral`, `--alert-bg/border/ink` (threshold banners). Don't inline hex/oklch values at call sites — extend these tokens instead.

`--font-heading` is **Manrope** (via `next/font/google` in `src/app/layout.tsx`), matching the mockup — used for headings, the top-bar wordmark, nav active state, and big stat/KPI numerics. `--font-sans` (Inter) is everything else. There is no separate display/serif font (an earlier pass added Fraunces for hero moments; removed — it didn't match the mockup, which uses Manrope for headings throughout, not a serif).

### Open items from the design handoff (see `design_handoff_khoj_dashboard/README.md`)

- SJT competency-map scoring/normalization is a placeholder (`sjt_competency_scores.score_pct` is a generic field) — real calculation is separate follow-up work, per product decision.
- No confirm-on-delete for table row deletes yet (matches the prototype) — flagged as follow-up.
- Leadership-role views for pages other than Overview weren't designed in the handoff — every other view currently shows the same content regardless of role.

Resolved: the top bar uses the client's actual Apnishala logo (`public/apnishala-logo.png`), not a Goalkeep mark or placeholder.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
