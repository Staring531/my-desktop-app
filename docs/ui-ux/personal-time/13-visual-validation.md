# Visual Validation: Personal Time

- Stage: 6 — Design-System and Visual Validation
- Date: 2026-11-25
- Status: Historical Agenda design-artifact checks recorded by the primary designer on 2026-11-25. They validate only the Agenda painting that was superseded for Web presentation on 2026-11-26. They are not evidence of validation for the current modern-workspace draft, are not an independent review, and are not runtime screenshot checks.
- Historical package checked: `previews/gate1-agenda.html`, the former Agenda version of `tokens/design-tokens.json`, the former `05-visual-design.md`, `06-interaction-specifications.md`, `11-component-specifications.md`, `04-wireframes.md`, `12-page-specifications.md`.
- Source page: the approved Agenda page. Editorial is an approved page and is not the comparison source.
- This file does not replace `docs/ui-ux/13-visual-validation.md`.

## Evidence

| Check | Expected | Observed | Status |
|---|---|---|---|
| Token file | Approved Agenda baseline. Aliases resolve. | `meta.status` is APPROVED, `visualDirection` is `agenda`, and `tokenBaselineApproved` is true. A local walk resolved 155 tokens after Stage 7 added `semantic.font.facts-line` and `component.row.facts-line` for the 16 px facts line already stored as `primitive.font.line-facts`. None was missing and none cycled. Canvas resolves to `#f3f1ec`. Accent resolves to `#9a3412`. | PASS |
| Gate 1 page | The painting uses the page's column, header, tool row, day label, facts words, selected row, and stack. | The page is one 760 px column on `#f3f1ec`, title 22/28 weight 650, quiet links on the same line, tool grid `1fr 1fr auto`, day label from the returned date, facts column 132 px with words, selected wash `#f3e6dc` and a 3 px accent bar, stack at 640 px. `05-visual-design.md` cites the tokens that resolve to those values. The banner `#efeae2` stays off the token baseline and off the painting. | PASS |
| Token citations | Pages and the component contract cite tokens that exist. | After the alignment below, `05-visual-design.md` cites 56 tokens, `11-component-specifications.md` cites 25, and the wireframe, page, and interaction files cite only existing tokens. | PASS |
| Raw values | Pages use semantic or component tokens. Named exceptions stay named. | EX-PT-01 pairs `component.field.border-width` with `semantic.color.border-hairline`. EX-PT-02 uses words in the facts column. `04-wireframes.md` and `12-page-specifications.md` also say "640 px", which is the resolved value of `component.page.stack-below`. No new color, type size, or radius is introduced. | PASS |
| Component reuse | S-01 through S-09 use PT-C01 through PT-C10. | The painting and the aligned component contract use those identifiers. PT-C10 stays in the column. Delete uses the primary face. Cancel stays quiet. | PASS |
| Primary actions | One ready primary in each command region. | S-01 through S-06 have one region. S-07 keeps Show range quiet until both dates are present, and keeps Submit choice quiet until one returned instant is selected. S-09 has one primary for nickname and one for timezone. Logout stays quiet. | PASS |
| States | Ready, empty, in flight, rejection, success, cancel, logged out, destructive confirmation, skipped, generated choice, monthly preview, conflicts, continuation. | Sections 3 through 6 of `05-visual-design.md` and I-01 through I-17. In flight keeps the button label and adds no spinner. `waiting` uses `semantic.color.text-meta`. Success adds no toast. Failures use `semantic.color.text-primary` and do not change a field border. | PASS, with GAP-PT-01 below |
| AC coverage | AC-P01 through AC-P40 each have an interaction or a tracked gap. AC-L01 through AC-L13 have no surface. | Each AC-P id except AC-P14, AC-P23, and AC-P36 is named on an interaction. AC-P23 is GAP-PT-01. AC-P14 and AC-P36 print the returned instants and do not show a separate clock label. AC-L01 through AC-L13 have no destination. | PASS, with those three gaps |
| Words for status | Visibility and state stay words. | The Agenda page and section 4 of `05-visual-design.md` show `private`, `public`, `scheduled`, `skipped`, and `choice_required` as words. No weekday is invented. | PASS |
| Motion | Feedback is 0 ms. | `semantic.motion.feedback` resolves to `0ms`. No entrance motion is specified. | PASS |
| Window | One 760 px column. Below 640 px, S-07 tool and occurrence rows become one column. | `component.page.content-max` and `component.page.stack-below` are cited. The page does not add a rail or a month grid. | PASS |
| Destructive confirmation | Delete stays on S-08 or S-09 and sends nothing until primary Delete inside PT-C10. | I-12 and I-16. The first control reveals PT-C10. No dialog was added. | PASS |
| Scope | No search, sharing, team, other calendar, theme switch, mail layout, or initial range. | Those items are absent from the Stage 5 pages. Q-02, Q-03, and Q-04 stay open. The document title stays the scaffold title. | PASS |
| First visit versus the sample | The source page may show one filled sample range. The product page starts From and To empty. | `gate1-agenda.html` fills From `2026-06-01` and To `2026-06-30` so the sample rows are visible. `04-wireframes.md` keeps the first visit empty because Q-04 is open. Show range on the sample is primary because both dates are present. | PASS |
| Contrast certification | Design-time color pairs are not a certified audit. | No rendered measurement was taken. | NOT RUN |
| Runtime screenshots | Deferred until coding is authorized. | `apps/website/app/globals.css` still implements the previous baseline. No application code was restyled or run for this check. | NOT RUN |
| Independent review of this painting | A separate read-only reviewer at the Design Review Gate. | Not run for the Agenda painting. The earlier review in `08-design-review.md` examined the Direction L package. | NOT RUN |

## Alignment made during this check

`11-component-specifications.md` still described the Direction L contract. It cited `component.page.inset`, `component.mark.size`, `component.mark.text`, `component.row.min-height`, `component.result.duration`, and `component.confirm`. Those tokens are absent from the Agenda baseline. It also specified geometric marks, a 2 px selected bar, a danger Delete face, and danger failure text.

The accepted painting already settles those points: facts are words, the selected bar is `component.row.selected-mark-width` (3 px), confirming Delete uses the primary face, and a failure is the `result` word in `semantic.color.text-primary`. This stage updated the English component contract and its Chinese translation to that painting, and updated I-16 so account deletion is sent only from the primary Delete button inside PT-C10. The command, the route, and the confirmation step are unchanged. A second citation walk found no missing token.

## Recorded exceptions

- EX-PT-01, the rule width `component.field.border-width` in `semantic.color.border-hairline`, is the token-layer exception for a hairline.
- EX-PT-02, S-07 status as words in the facts column, replaces the Direction L geometric marks.
- Enter in Description inserts a newline and does not activate Save. Enter in a single-line field still activates that region's primary button. This is recorded in `06-interaction-specifications.md`.

## GAP-PT-01

An entered local time that occurs twice is `save_rejected` until the save includes one chosen instant. The approved error body documents `monthTypes` and `missingDates` for a monthly rejection. It does not document two instants on that doubled-time rejection. The page is not allowed to compute those instants.

`05-visual-design.md` therefore paints PT-C06 only when the returned body already includes the instants. A generated `choice_required` row does include its two instants, and I-08 can submit one of them. An entered doubled time has no such body today, so the page can show `save_rejected` and cannot offer the choice.

AC-P15 is covered by that rejection. AC-P23, choosing one of the two entered instants, is not completable from the current page contract. On 2026-11-25 the user decided that completing AC-P23 needs a Technical Design change that returns those two instants. This check does not make that change.

## Plan alignment

The Implementation Plan was not edited. The website stylesheet was not edited. Applying the Agenda painting waits for a later implementation authorization. The earlier Stage 8 approval and Stage 9 handoff remain the record of the Direction L package.

## Open items

- Q-02: the mail message is not designed. S-02 and S-06 submit a proof code.
- Q-03: no product title is painted. The document title remains the scaffold title.
- Q-04: From and To start empty. Show range does not send until both are typed.
- GAP-PT-01: the entered doubled-time choice has no returned instants to paint.
- Stage 7 review of the Agenda painting is recorded in `08-design-review.md`. Re-review of the resolutions returned no remaining findings.
