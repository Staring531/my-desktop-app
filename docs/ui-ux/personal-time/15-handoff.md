# UI/UX Handoff: Personal Time

- Stage: 9 — Handoff
- Date: 2026-11-25
- Status: On 2026-11-26 the user explicitly superseded the Agenda visual direction and authorized a PRD-driven redesign of `apps/website`. The earlier Agenda approval is historical for Web presentation. The current direction is documented in `05-visual-design.md` and remains a working draft until visual review. This does not authorize deployment, a production host, a mail provider, or changes to the PRD or Technical Design.
- Package: `docs/ui-ux/personal-time/`. This file replaces the Direction L handoff that was prepared earlier the same day. It does not replace `docs/ui-ux/14-handoff.md`.
- Plan: The approved Agenda delta is applied to PT-023 in `docs/technical/personal-time/10-implementation-plan.md`.
- English files are canonical. Where a translation lags, follow the English file.

## 1. Prior design artifacts (historical where they prescribe Agenda visuals)

| Document | Role |
|---|---|
| `01-information-architecture.md` | Accepted structure and paths. |
| `02-user-flows.md` | Accepted flows. AC-P14, AC-P23, and AC-P36 are tracked gaps. |
| `03-screen-inventory.md` | S-01 through S-09. |
| `04-wireframes.md` | Accepted Agenda low-fidelity structure. |
| `05-visual-design.md` | Accepted Agenda painting. |
| `06-interaction-specifications.md` | I-01 through I-17. |
| `09-visual-references.md` | Agenda is the accepted direction. Direction L remains historical. |
| `10-design-tokens-agenda.md` and `tokens/design-tokens.json` | Approved Agenda token baseline, `visualDirection` `agenda`. |
| `11-component-specifications.md` | PT-C01 through PT-C10, aligned to the Agenda painting. |
| `12-page-specifications.md` | Page composition. |
| `13-visual-validation.md` | Agenda design-artifact checks. Contrast was not measured. Runtime screenshots were not taken. |
| `08-design-review.md` | UX-PT-AGENDA-001 through UX-PT-AGENDA-010 are resolved. The Direction L review remains historical. |
| `previews/gate1-agenda.html` | Approved visual authority page. |
| `14-implementation-readiness.md` | The readiness check the user approved. |

## 2. Earlier Agenda decisions (superseded for Web presentation)

These bind presentation after a separate implementation authorization. They do not authorize that work now.

- One light column. Content width is `component.page.content-max`, with the Agenda page padding. Below `component.page.stack-below`, an S-07 tool row and occurrence row become one column. The title and the quiet action stay on one line. No theme switch, navigation rail, month grid, search, sharing, team, or another person's Calendar.
- Header quiet links are first in tab order.
- Use the Agenda token file. Map it to plain CSS custom properties. Do not add a token compiler or a styling dependency. Do not reuse `docs/ui-ux/tokens/design-tokens.json` or the desktop components.
- Pages use semantic or component tokens. EX-PT-01 is the hairline width. EX-PT-02 is status words in the facts column.
- One ready primary button per command region. Logout is quiet. Create Save stays quiet until one repetition option is selected. The non-repeating option sends `none`. Show range stays quiet until both dates are typed. Submit choice stays quiet until one returned instant is selected.
- A command in flight shows `waiting` in `semantic.color.text-meta`, keeps the button label, and does not send again.
- A page that stays shows the string `ok` and no second success sentence. S-02 and S-06 open S-04 on `ok`. S-04 opens S-07 on `ok`. A guarded path without a session paints S-04 and `logged_out`.
- Enter in Description inserts a newline and does not activate Save. Enter in a single-line field activates that region's primary button.
- The S-07 wash and bar follow focus inside an occurrence. They do not select an instant or change Save or Delete.
- Start and End are the typed civil date and clock, sent as entered. From and To start empty. S-07 prints returned `start` and `end` and does not invent a weekday.
- Delete sends nothing until the primary Delete button inside PT-C10. Cancel sends nothing. There is no danger hue.
- Shared failures show the `result` string in `semantic.color.text-primary`. A field border does not change.
- The task title is the surface name. Q-03 remains open, so the scaffold document title stays. Q-02 remains open: the mail message is not designed. Q-04 remains open: no first calendar range is chosen.
- Keep the approved API routes, the session cookie, and the JSON `result`. Do not switch the website to the bearer API client.

## 3. Tracked product and technical limitations

- GAP-PT-01 stays open. An entered doubled local time is `save_rejected`. The page paints a choice only when the returned body already includes the two instants. Completing AC-P23 needs a Technical Design change. That change was not made.
- AC-P14 and AC-P36 stay open. A timezone clock label distinct from the returned `start` and `end` needs a Technical Design change. That change was not made.

## 4. Still not authorized

Deployment, a production host, a mail provider, dependency installation beyond the existing website, and edits to the PRD or the Technical Design. Contrast measurement remains open.

## 5. Superseding Web design authorization — 2026-11-26

The user authorized replacing Agenda rather than polishing it, and directed the Web UI to be redesigned from `docs/product/06-prd-personal-time.md`. This authorization supersedes the Agenda-only presentation constraints in Sections 1 and 2 above, including the one-column page, no navigation rail, no elevated cards, Agenda colors, and Agenda component painting.

The current implementation draft uses a responsive Personal Time workspace: deep-indigo navigation, bright content surfaces, event cards, grouped event editing, and a split-screen authentication frame. These are presentation decisions only. The first-delivery feature boundary, screen flows, API routes, request payloads, session handling, recurrence rules, conflict semantics, and timezone behavior remain governed by the approved PRD and technical design.

The user authorized Web redesign only. Electron Desktop files and product behavior are outside this work.
