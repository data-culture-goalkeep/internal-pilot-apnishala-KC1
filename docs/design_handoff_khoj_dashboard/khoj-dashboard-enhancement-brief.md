# Khoj Dashboard — Enhancement Brief

## Context
This builds on the current "Apnishala KC-1 Redo" Claude Design artifact (Overview, Formative Assessments, Summative Assessments, SEL & Holistic Support, Attendance + Enrollment, Individual Student Growth). SEL domain taxonomy (Collaboration, Emotional Regulation, Responsible Decision-Making, Self-Awareness, Self-Regulation) is confirmed correct — sourced from the real Google Sheets used for data entry. Do not change this taxonomy.

## Changes to make

### 1. Grade-comparison charts for Formative and Summative
Currently Formative and Summative pages scope to one grade at a time via the grade selector, with no cross-grade view.
Add: a bar chart, one bar per grade, for:
- Formative — average score by grade (all grades visible at once)
- Summative — average score by grade (all grades visible at once)
Pattern to follow: match how Attendance already does this with its Grade / All-grades toggle — reuse that same toggle pattern here rather than inventing a new interaction.

### 2. Mastery-bracket distribution for Formative
Summative already shows "Bracket distribution by subject" (Adjust / Practice / Apply / Excel, stacked bar). Formative currently only shows raw class-average marks per objective — it has no bracket view.
Add: a stacked bar chart for Formative, same four brackets (Adjust / Practice / Apply / Excel), broken down by subject, styled consistently with the existing Summative bracket chart (same colors, same legend, same layout).

### 3. Situational Judgment Test (SJT) — move out of placeholder, add front-end charts
The SJT form itself is finalized and ready (as already designed in the Claude Design project). It is no longer a placeholder — the SJT section should get real visual components now.
Score normalization/calculation logic is still being finalized separately — do not build or guess at the underlying scoring formula. Design the charts against a generic "SJT score" or "competency score" placeholder value so the visuals are ready to wire up once the calculation logic is confirmed.

Add the following chart components to the SJT section:
- A **situation-by-situation response distribution** chart — for each situation, show the % of students who selected each answer option (bar or stacked bar per situation), similar in spirit to the response-distribution view already in the standalone SEL data-entry tool.
- A **competency-map summary chart** — since each answer option maps to a competency, show aggregate competency scores per domain (bar chart, one bar per competency/domain), once scores are computed. Use a placeholder/generic value for now.
- A **coverage indicator** — % of eligible students (Grades 6–10 only) who have completed the SJT, consistent with how coverage is shown elsewhere in the dashboard (e.g. Summative "Coverage, pre vs. post").
- Keep this section clearly labeled as using provisional/placeholder scoring logic until normalization is finalized — a small note under the section header is enough, similar to the existing "Grade 6+ observation methodology differs" flag style already used in Summative.

## Explicitly out of scope for this round
- Do not add per-tool raw paginated student list tables — the existing Individual Student Growth sortable table already serves this purpose.
- Do not fork SEL (Observation/Self-Report) into separate Pre/Post page sections — keep the current combined side-by-side view.
- Do not build or guess the SJT score normalization/calculation logic — charts should be wired to placeholder values only.
- Do not change the SEL domain taxonomy.

## Notes
- Use realistic values consistent with the existing dummy data patterns already in the artifact (some decline/no-change, not universal improvement).
- Keep chart colors and bracket-color logic consistent with what Summative already uses.
- Keep SJT chart styling consistent with the rest of the dashboard (same fonts, spacing, color logic) even though it's provisional.
