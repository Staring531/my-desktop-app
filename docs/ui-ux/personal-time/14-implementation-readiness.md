# Implementation Readiness: Personal Time

- Stage: 8 — Implementation Readiness and User Approval
- Date: 2026-11-25
- Status: APPROVED by the user on 2026-11-25. This approval accepts the Agenda package and applies the presentation delta in section 3 to PT-023. It does not authorize an edit to `apps/website`. Later the same day the user authorized applying the handoff. That application is recorded in `15-handoff.md`.
- Earlier approval: the user approved the Direction L package and its presentation delta on 2026-11-25. The Agenda approval above replaces that presentation source in PT-023.
- Package: the accepted Agenda structure, tokens, wireframes, page specifications, painting, interactions, Stage 6 validation, and Stage 7 review in `docs/ui-ux/personal-time/`.
- English files are canonical. This file does not replace `docs/ui-ux/14-handoff.md`.

## 1. Checks

| Check | Result |
|---|---|
| AC-P01 through AC-P40 | Each id is on a flow. AC-P14, AC-P23, and AC-P36 are tracked gaps. The other ids are on an interaction. The page shows the returned body and does not recompute expansion, overlap, a clock label, or a proof outcome. |
| AC-P23 | GAP-PT-01. The page shows `save_rejected` and paints a choice only when the body already includes the two instants. Completing the choice needs a Technical Design change. That change was not made. |
| AC-P14 and AC-P36 | S-07 prints the returned `start` and `end`. The Calendar body has no separate clock-label field. A timezone clock label needs a Technical Design change. That change was not made. |
| AC-L01 through AC-L13 | No destination. |
| Technical contracts | The page sends the approved API routes, uses the session cookie, and reads the JSON `result`. It does not use the bearer API client. |
| Tokens and components | `tokens/design-tokens.json` is APPROVED, `visualDirection` is `agenda`, and 155 aliases resolve. Pages cite semantic or component tokens. EX-PT-01 is the hairline width. EX-PT-02 is status words in the facts column. Components are PT-C01 through PT-C10. |
| States | Ready, `waiting`, shared failures in `semantic.color.text-primary`, staying `ok`, navigation on verify and recovery completion, guarded S-04 with `logged_out`, empty range, skipped, generated choice, focus wash on an S-07 occurrence, conflicts, continuation, monthly preview, and in-flow delete confirmation are specified. |
| Findings | UX-PT-AGENDA-001 through UX-PT-AGENDA-010 are resolved. The follow-up re-review returned no findings. The Direction L findings remain historical. |
| Accessibility | DEC-079 sets no accessibility standard. Labels, a focus ring, visual tab order, and status words are specified. Contrast was not measured. |
| Runtime screenshots | Checked on 2026-11-25 after the later authorization. Register, Log in, Event, Calendar, and Account use the Agenda column, header links, and accent. A failure stays the `result` word in the primary text color. Contrast was not measured. |

## 2. Presentation this approval would accept

- One light column, `component.page.content-max` wide, with the Agenda page padding. Below `component.page.stack-below`, an S-07 tool row and occurrence row become one column. The title and the quiet action stay on one line. No theme switch, navigation rail, month grid, search, sharing, team, or another person's Calendar.
- Header quiet links are first in tab order. Focus starts at the first control in that order.
- The task title is the surface name. Q-03 stays open, so the scaffold document title stays.
- Q-04 stays open. From and To start empty. Show range stays quiet until both dates are typed.
- Q-02 stays open. The mail message is not designed. S-02 and S-06 submit a proof code.
- A command in flight shows `waiting` in `semantic.color.text-meta`, keeps the button label, and does not send again.
- A page that stays shows the string `ok` and no second success sentence. S-02 and S-06 open S-04 on `ok`. S-04 opens S-07 on `ok`. A guarded path without a session paints S-04 and `logged_out`.
- Create Save is quiet until one repetition option is selected. The non-repeating option sends `none`.
- Start and End are the typed civil date and clock, sent as entered.
- Delete sends nothing until the primary Delete button inside PT-C10. Cancel sends nothing. There is no danger hue.
- Shared failures show the `result` string in `semantic.color.text-primary`. A field border does not change.
- S-07 prints returned `start` and `end` strings. It does not format a separate clock label and does not invent a weekday.

## 3. Applied plan delta

Applied on 2026-11-25 to PT-023 of `docs/technical/personal-time/10-implementation-plan.md` after the user approved this file. The presentation source is the Agenda package handed off in `15-handoff.md`.

- Presentation follows `05-visual-design.md`, `06-interaction-specifications.md`, `11-component-specifications.md`, `04-wireframes.md`, `12-page-specifications.md`, and `tokens/design-tokens.json` with `visualDirection` `agenda`.
- Map those Agenda tokens to plain CSS custom properties. Do not add a token compiler or a styling dependency. Do not reuse `docs/ui-ux/tokens/design-tokens.json`.
- Keep the approved API routes, the session cookie, and the JSON `result`. Do not switch the website to the bearer API client.
- Confirming Delete uses the primary face inside PT-C10.
- Do not invent the two instants for an entered doubled time. Show `save_rejected` and paint a choice only from instants present in the body.
- Print returned `start` and `end` on S-07. Do not format a separate timezone clock label until a Technical Design change returns one.
- Do not choose a product title, a mail layout, or the first calendar range while Q-02, Q-03, and Q-04 are open.

This approval does not authorize an edit to `apps/website`. The handoff is `15-handoff.md`.

## 4. Previously applied Direction L delta

Applied on 2026-11-25 to PT-023 before the Agenda approval. It told the website forms to follow the Direction L package then recorded in `15-handoff.md`. The Agenda approval replaces that presentation source. After the later authorization, `apps/website/app/globals.css` matches the Agenda tokens.
