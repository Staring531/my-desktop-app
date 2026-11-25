# Visual Validation: Personal Time

- Stage: 6 — Design-System and Visual Validation
- Date: 2026-11-25
- Status: Design-artifact checks recorded by the primary designer. This is not an independent review and not a runtime screenshot check.
- Package checked: `tokens/design-tokens.json`, `05-visual-design.md`, `06-interaction-specifications.md`, `04-wireframes.md`, `12-page-specifications.md`, `11-component-specifications.md`, `10-design-tokens.md`, `03-screen-inventory.md`, `02-user-flows.md`.
- Stage 4 was accepted by the user on 2026-11-25. Stage 5 is READY FOR USER REVIEW and was the package checked here. These checks do not accept Stage 5 and do not authorize application code.
- This file does not replace `docs/ui-ux/13-visual-validation.md`.
- No independent UI/UX review was run.

## Evidence

| Check | Expected | Observed | Status |
|---|---|---|---|
| Token file | Approved light theme. Semantic and component aliases resolve. | `meta.status` is APPROVED and `tokenBaselineApproved` is true. A local walk resolved 69 semantic and component aliases. None was missing and none cycled. | PASS |
| Raw values on pages | Pages use semantic or component tokens, with exceptions named. | `05-visual-design.md` names EX-PT-01 only: `primitive.size.rule` with `semantic.color.border-hairline`, because no semantic border-width exists. No other raw color, type size, or radius is introduced on a page. | PASS |
| Component reuse | S-01 through S-09 use PT-C01 through PT-C10. No new component. | `05-visual-design.md` paints every surface from those components. Confirmation stays PT-C10 in the column. | PASS |
| Primary actions | One primary button in each command region. | S-01 through S-06 have one region. S-07 keeps Show range quiet until both dates are present, and keeps Submit choice quiet until one returned instant is selected. S-09 has one primary for nickname and one for timezone. Logout stays quiet. | PASS |
| States | Ready, empty, in flight, rejection, success, cancel, logged out, destructive confirmation, skipped, generated choice, monthly preview, conflicts, continuation. | Sections 3 through 6 of `05-visual-design.md` and I-01 through I-17. In flight keeps the button label and adds no spinner. Success adds no toast. | PASS, with GAP-PT-01 below |
| AC coverage | AC-P01 through AC-P40 each have an interaction or a justified page limit. AC-L01 through AC-L13 have no surface. | Each AC-P id is named on an interaction in `06-interaction-specifications.md`. The page shows the returned body and does not recompute expansion, overlap, or clock labels. AC-L01 through AC-L13 have no destination. | PASS, except the entered doubled-time choice in GAP-PT-01 |
| Non-color status | Public, private, scheduled, skipped, and choice required are a mark plus the API word. | `05-visual-design.md` section 4. The accent is limited to a ready primary button, the focus ring, and the selected-row mark. Shared failures do not recolor one field border. | PASS |
| Motion | Reduced motion is the same as the specified motion. | `component.result.duration` is 0 ms. No entrance motion is specified. | PASS |
| Column | One 640 px task column. A narrower viewport keeps the stack and scrolls. | `component.page.content-max` and `component.page.inset` are cited. No breakpoint and no second column are added. | PASS |
| Destructive confirmation | Delete stays on S-08 or S-09 and sends nothing until the danger button. | I-12 and I-16. The first control reveals PT-C10. No dialog was added. | PASS |
| Scope | No search, sharing, team, other calendar, theme switch, mail layout, or initial range. | Those items are absent from the Stage 5 pages. Q-02, Q-03, and Q-04 stay open. | PASS |
| Contrast certification | Design-time ratios are not a certified audit. | The ratios in `10-design-tokens.md` remain design-time arithmetic. No rendered measurement was taken. | NOT CHECKED |
| Runtime screenshots | Deferred until coding is authorized. | No application code was run. | NOT CHECKED |
| Independent review | A separate read-only reviewer at the Design Review Gate. | Run on 2026-11-25. Findings are in `08-design-review.md`. | RECORDED |

## Recorded exceptions

- EX-PT-01, the 1 px region rule, is the only token-layer exception on a page.
- Enter in Description inserts a newline and does not activate Save. Enter in a single-line field still activates that region's primary button. This is recorded in `06-interaction-specifications.md` so a multiline description can contain a line break.

## GAP-PT-01

An entered local time that occurs twice is `save_rejected` until the save includes one chosen instant. The approved error body documents `monthTypes` and `missingDates` for a monthly rejection. It does not document two instants on that doubled-time rejection. The page is not allowed to compute those instants.

`05-visual-design.md` therefore paints PT-C06 only when the returned body already includes the instants. A generated `choice_required` row does include its two instants, and I-08 can submit one of them. An entered doubled time has no such body today, so the page can show `save_rejected` and cannot offer the choice.

AC-P15 is covered by that rejection. AC-P23, choosing one of the two entered instants, is not completable from the current page contract. On 2026-11-25 the user decided that completing AC-P23 needs a Technical Design change that returns those two instants. This check does not make that change. The page still shows `save_rejected` and paints a choice only when the body includes the instants.

## Plan alignment

The Implementation Plan was not edited. PT-023 builds the forms and renders the API body. It says presentation stays with this UI/UX stage. The approved screens, tokens, and states are that presentation. They are not written into PT-023 here. A readiness review can present the delta: the website task must follow `05-visual-design.md` and `06-interaction-specifications.md` when implementation is separately authorized. That delta is not applied in this file.

## Open items

- Q-02: the mail message is not designed. S-02 and S-06 submit a proof code.
- Q-03: no product title is painted. The document title remains the scaffold title.
- Q-04: From and To start empty. Show range does not send until both are typed.
- GAP-PT-01: the entered doubled-time choice has no returned instants to paint.
- Stage 5 remains READY FOR USER REVIEW. Stage 7 findings are in `08-design-review.md`. Re-review of the resolutions is pending.
