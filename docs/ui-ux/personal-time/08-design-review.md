# Design Review: Personal Time

- Stage: 7 — Independent Design Review Gate
- Date: 2026-11-25
- Status: Re-review recorded on 2026-11-25. The review itself does not approve the package. The user approved the package the same day in `15-handoff.md`, with GAP-PT-01 still tracked. UX-PT-REV-012 aligned the Chinese I-10 result line to the English sentence. This file does not authorize application code.
- Reviewer: independent read-only UI/UX design reviewer, native delegation on 2026-11-25. The reviewer did not edit files.
- Package: `docs/ui-ux/personal-time/`. This file does not replace `docs/ui-ux/08-design-review.md`.
- This is design-artifact review. Runtime screenshots were not checked.

## Disposition

| ID | Severity | Product decision | Disposition |
|---|---|---|---|
| UX-PT-REV-001 | major | yes | Decided on 2026-11-25. Completing AC-P23 needs the rejection body to return the two instants. The Technical Design was not changed. GAP-PT-01 stays open. |
| UX-PT-REV-002 | major | no | Resolved. F-07 and the S-08 inventory exit now keep `ok` on S-08 until the Calendar link. |
| UX-PT-REV-003 | major | yes | Decided on 2026-11-25. `ok` on S-02 and S-06 opens S-04 and does not open S-07. |
| UX-PT-REV-004 | major | yes | Decided on 2026-11-25. In flight shows `waiting`. A page that stays shows the string `ok`. Neither explains a field or says a proof was sent. |
| UX-PT-REV-005 | major | yes | Decided on 2026-11-25. A guarded path paints the S-04 log-in form and `logged_out`. |
| UX-PT-REV-006 | major | no | Resolved. The generated-choice civil date is the returned date and is not editable. From and To stay typed. |
| UX-PT-REV-007 | major | no | Resolved. Create Save stays quiet until one kind is selected. The non-repeating option sends `none`. |
| UX-PT-REV-008 | major | no | Resolved. Start and End are a typed civil date and clock, sent as entered. |
| UX-PT-REV-009 | minor | no | Resolved. The wash and leading bar belong to a selected occurrence. A conflict row keeps the focus ring only. |
| UX-PT-REV-010 | minor | no | Resolved. Primitive steps now darken as the number rises. Semantic text colors keep the same hex values. |

Re-review of the resolved items has not been run.

## Findings

### UX-PT-REV-001

- Severity: major. Product decision: yes.
- Affected: GAP-PT-01, S-08, I-10.
- Evidence: An entered doubled local time is `save_rejected`. The approved error body does not include the two instants. The page paints a choice only when those instants are already in the body. AC-P23 requires the person to choose one instant, including 01:30 on 2026-11-01 in America/New_York.
- Scenario: The person enters a local time that occurs twice.
- Impact: AC-P15 can be shown. AC-P23 cannot be completed from this page.
- Recommendation: Keep the gap until a Technical Design change returns the two instants, or the user decides the page only shows `save_rejected`.

### UX-PT-REV-002

- Severity: major. Product decision: no.
- Affected: F-07, S-08 inventory, accepted page spec, I-10.
- Evidence: The flow and inventory sent a successful save to S-07. The accepted page spec keeps `ok`, conflicts, and the continuation sentence on S-08. S-07 has no conflict rows.
- Scenario: A save succeeds with an overlap or `continuesAfterWindow`.
- Impact: The warning would leave the only surface that paints it.
- Recommendation: Match the flow and inventory to the accepted page rule. Applied on 2026-11-25.

### UX-PT-REV-003

- Severity: major. Product decision: yes.
- Affected: accepted IA, F-02, S-02, S-06, I-02, I-06.
- Evidence: The IA says verification and completed recovery return to S-04 and do not open the Calendar. I-02 and I-06 stay on S-02 or S-06 after `ok`.
- Scenario: Verification or recovery completion returns `ok`.
- Impact: The next page is either Log in or the proof page.
- Recommendation: Reconcile Stage 5 with the accepted IA, or ask the user to keep the stay behavior.

### UX-PT-REV-004

- Severity: major. Product decision: yes.
- Affected: PT-C02, PT-C09, S-01, S-02, S-03, S-06, S-09.
- Evidence: In flight keeps the label and has no spinner. `ok` adds no sentence. On these screens the fields do not change.
- Scenario: A command is in flight, or `ok` returns, on a page that stays put.
- Impact: Ready, waiting, and success look the same. A second submit can turn a completed verify or cancel into a rejection.
- Recommendation: Specify a visible in-flight state and a visible `ok` that does not explain which field failed and does not say a proof was sent.

### UX-PT-REV-005

- Severity: major. Product decision: yes.
- Affected: PT-C01, S-04, I-17, S-07 wireframe.
- Evidence: PT-C01 says a guarded surface with `logged_out` keeps that page and shows PT-C09 only. The accepted S-04 spec paints the log-in form on the guarded paths.
- Scenario: A person without a session opens `/calendar`, `/events/new`, `/events/:id`, or `/account`.
- Impact: The page is either only the result, or the log-in form plus `logged_out`.
- Recommendation: Choose one behavior and align the component, page, interaction, and wireframe.

### UX-PT-REV-006

- Severity: major. Product decision: no.
- Affected: PT-C04, S-07, I-08.
- Evidence: PT-C04 said the person types the civil date submitted with a generated choice. The accepted page shows that date as returned text and does not let the person edit it.
- Scenario: A `choice_required` row is submitted.
- Impact: A typed date could differ from the date the API and PT-023 require.
- Recommendation: Keep From and To typed, and show the choice date as the returned value. Applied on 2026-11-25.

### UX-PT-REV-007

- Severity: major. Product decision: no.
- Affected: PT-C06, S-08 create, I-10.
- Evidence: Save was already primary while all four repetition options were unselected. The stored kind is `none`, not `non-repeating`.
- Scenario: The person saves a new Event without a kind, or the page sends the visible word `non-repeating`.
- Impact: The request can omit the kind or send a value the store does not use.
- Recommendation: Keep Save quiet until one option is selected, and send `none` for the non-repeating option. Applied on 2026-11-25.

### UX-PT-REV-008

- Severity: major. Product decision: no.
- Affected: PT-C05, S-08.
- Evidence: Start and End were described as a local time only. AC-P06, AC-P09, AC-P15, and AC-P23 need a civil date as well as a clock. The series stores an anchor date plus local start and end.
- Scenario: The person creates a monthly series, enters a missing local time on a date, or enters a date with no clock.
- Impact: A clock-only field cannot express those entries.
- Recommendation: State that Start and End are the typed civil date and clock, sent as entered. Applied on 2026-11-25.

### UX-PT-REV-009

- Severity: minor. Product decision: no.
- Affected: shared focus rule, conflict rows.
- Evidence: Any row containing focus received the accent wash and leading bar. Conflict rows were specified with no accent.
- Scenario: Focus lands inside a conflict row.
- Impact: The conflict row gains the accent reserved for a selected occurrence.
- Recommendation: Keep the focus ring on the control and limit the wash and bar to a selected occurrence. Applied on 2026-11-25.

### UX-PT-REV-010

- Severity: minor. Product decision: no.
- Affected: `tokens/design-tokens.json`.
- Evidence: `neutral-700` was darker than `neutral-800`.
- Scenario: An implementer chooses a primitive by its number.
- Impact: Secondary text and meta text can be swapped.
- Recommendation: Number the steps so a higher number is darker, and keep the semantic hex values. Applied on 2026-11-25.

## Notes carried from the review

- Contrast figures remain design-time arithmetic.
- Q-02, Q-03, and Q-04 stay open.
- AC-L01 through AC-L13 have no destination.
- PT-023 was not edited.

## Re-review on 2026-11-25

The same read-only reviewer checked the resolutions. English and Chinese copies of the checked sentences agreed. No new raw page color was found. `text-secondary` remains `#3C4450` and `text-meta` remains `#4E5663`.

Resolved on re-review: UX-PT-REV-002, UX-PT-REV-004 except the conflict case below, UX-PT-REV-005, UX-PT-REV-006, UX-PT-REV-008, UX-PT-REV-009, and UX-PT-REV-010.

Still open: UX-PT-REV-001 / GAP-PT-01. The page still does not invent the two instants.

Leftovers found by the re-review and aligned afterward, without a further re-review:

- UX-PT-REV-003: the S-06 inventory exit now says `ok` opens S-04 and does not open S-07.
- UX-PT-REV-007: the S-08 component line now says create Save is quiet until one kind is selected.
- UX-PT-REV-011: an `ok` that stays on S-08 shows the string `ok` together with conflict rows when the body includes them. No second success sentence was added.

Contrast certification, runtime screenshots, Q-02, Q-03, and Q-04 were not closed.

## Narrow re-review of the three leftovers

A further read-only check on 2026-11-25 confirmed UX-PT-REV-003 and UX-PT-REV-007 in both languages. UX-PT-REV-011 was complete in the English I-10 line and in the visual, component, and page files. The Chinese I-10 result line omitted the string `ok`. That line was aligned to the English sentence as UX-PT-REV-012. It is a translation fix, not a new behavior. GAP-PT-01 was not closed by inventing instants. This check does not approve the package.
