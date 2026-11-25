# Implementation Readiness: Personal Time

- Stage: 8 — Implementation Readiness and User Approval
- Date: 2026-11-25
- Status: APPROVED by the user on 2026-11-25. This approval accepts the personal-time UI package and the presentation delta below. It does not authorize application code. The applied delta is in PT-023. The handoff is `15-handoff.md`.
- Package: `docs/ui-ux/personal-time/`. This file does not replace `docs/ui-ux/14-handoff.md`.
- English files are canonical.

## 1. What is ready to review

The personal-time UI package contains the accepted structure, Direction L, the approved token baseline, the accepted wireframes, the Stage 5 visual and interaction specifications, the Stage 6 validation, and the Stage 7 review with its re-reviews. The open items below are tracked. They are not silent defaults.

| Check | Result |
|---|---|
| AC-P01 through AC-P40 | Each id is named on a flow and an interaction. The page shows the returned body and does not recompute expansion, overlap, clock labels, or a proof outcome. |
| AC-P23 entered doubled time | Tracked as GAP-PT-01. The page shows `save_rejected` and paints a choice only when the body already includes the two instants. The user decided on 2026-11-25 that completing the choice needs a Technical Design change. That change was not made. |
| AC-L01 through AC-L13 | No destination. |
| Technical contracts | The page sends the approved API routes, uses the session cookie, and reads the JSON `result`. It does not use the bearer API client. |
| Tokens and components | Pages use semantic or component tokens. EX-PT-01 is the only named raw exception. Components are PT-C01 through PT-C10. |
| States | Ready, `waiting`, shared failures, staying `ok`, navigation on verify and recovery completion, guarded S-04 with `logged_out`, empty range, skipped, generated choice, conflicts, continuation, monthly preview, and in-flow delete confirmation are specified. |
| Findings | UX-PT-REV-002 through UX-PT-REV-012 are resolved in the design text or were translation alignment. UX-PT-REV-001 remains the tracked gap. |
| Accessibility | DEC-079 sets no accessibility standard. Labels, a focus ring, and non-color status words are specified. Contrast figures are design-time arithmetic, not a certified audit. |
| Runtime screenshots | Not checked. They belong to Coding and Testing after separate authorization. |

## 2. Decisions that would bind an implementation

These bind presentation only after the user approves this package. They do not bind it now.

- One light column, `component.page.content-max` inside `component.page.inset`. No theme switch, navigation rail, month grid, search, sharing, team, or another person's Calendar.
- The task title is the surface name. Q-03 is open, so no product title replaces the scaffold document title.
- Q-04 is open. From and To start empty, and Show range does not send until both are typed.
- Q-02 is open. The mail message is not designed. S-02 and S-06 submit a proof code.
- A command in flight shows `waiting`, keeps the button label, and does not send again. `waiting` is not an API result.
- A page that stays shows the string `ok` and no second success sentence. S-02 and S-06 open S-04 on `ok`. S-04 opens S-07 on `ok`. A guarded path without a session paints S-04 and `logged_out`.
- Create Save is quiet until one repetition option is selected. The non-repeating option sends `none`.
- Start and End are the typed civil date and clock, sent as entered.
- Delete sends nothing until the danger button in PT-C10. Cancel sends nothing.
- Shared failures show the `result` string and do not say which value was taken.

## 3. Approved plan delta

Applied on 2026-11-25 to PT-023 in `docs/technical/personal-time/10-implementation-plan.md`. The earlier sentence that left presentation with a later UI/UX stage is replaced by the following:

- When implementation is separately authorized, the website forms follow this personal-time UI package: S-01 through S-09, the approved tokens, PT-C01 through PT-C10, and I-01 through I-17.
- Do not reuse `docs/ui-ux/tokens/design-tokens.json` or the desktop components.
- Map tokens to plain CSS custom properties. Do not add a token compiler or a styling dependency as part of adopting the package.
- Keep the approved API routes, the session cookie, and the JSON `result`. Do not switch the website to the bearer API client.
- Do not invent the two instants for an entered doubled time. Until a Technical Design change returns them, show `save_rejected` and paint a choice only from instants present in the body.
- Do not choose a product title, a mail layout, or the first calendar range while Q-02, Q-03, and Q-04 are open.

The user approved this file and this delta on 2026-11-25. That approval accepts the UI package as the presentation baseline. It does not authorize application code. Stage 9 is `15-handoff.md`.
