# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## What this app is

Khoj Dashboard — a school analytics app for teachers and leadership, built from the Claude Design handoff in `design_handoff_khoj_dashboard/` (an HTML prototype; reference only, not source). Built on the same infra/conventions as the sibling repo `data-culture-goalkeep/key-questions-interface` (Next.js/Tailwind/shadcn/Supabase/Vercel), as its own standalone repo/deploy.

No auth in this pass — internal pilot, same posture as key-questions-interface's Mockup Navigator (public reads, service-role writes via server actions).

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

Goalkeep brand tokens ported from `key-questions-interface`'s `globals.css` (`--gk-ink/yellow/coral/teal/blue/blue-deep`, `--radius` 8px / `--radius-card` 12px). New tokens added for this app: `--bracket-below/basic/proficient/advanced` (the 4-tier assessment bracket scale, reused for SJT answer options A–D) and `--sel-thrive/resist`. Don't inline hex/oklch values at chart call sites — extend these tokens instead.

### Open items from the design handoff (see `design_handoff_khoj_dashboard/README.md`)

- SJT competency-map scoring/normalization is a placeholder (`sjt_competency_scores.score_pct` is a generic field) — real calculation is separate follow-up work, per product decision.
- No confirm-on-delete for table row deletes yet (matches the prototype) — flagged as follow-up.
- Logo: using an emoji placeholder in the top bar; the handoff's `uploads/apni-shala-logo-cc-01.png` vs. a Goalkeep-branded mark needs a client decision.
- Leadership-role views for pages other than Overview weren't designed in the handoff — every other view currently shows the same content regardless of role.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
