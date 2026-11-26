# Visual Design: Personal Time

- Stage: 5 — High-Fidelity Visual Design and Interaction Specifications
- Date: 2026-11-25
- Status: Agenda painting accepted by the user on 2026-11-25. It replaces the Direction L painting as the accepted high-fidelity specification. Stage 6 validation of this painting is recorded in `13-visual-validation.md`. This acceptance does not authorize application code.
- Working structure: the accepted Agenda sketches in `04-wireframes.md` and `12-page-specifications.md`.
- Tokens: the approved Agenda baseline in `tokens/design-tokens.json`. Pages use semantic or component tokens.
- Source page: `previews/gate1-agenda.html`.
- Components: PT-C01 through PT-C10 still name the controls. Their painting is the Agenda baseline below.
- Interactions: `06-interaction-specifications.md`.
- Q-02, Q-03, and Q-04 stay open. No screen names a product title, paints the mail message, or fills the first `from` and `to`.
- No image is the source of truth. These token references are the editable specification.
- This file does not replace `docs/ui-ux/05-visual-design.md`.
- No independent UI/UX review was run.

## 1. Direction applied

Agenda is one light browser column. The page background is `semantic.color.canvas` and `component.page.elevation`. The task title and the quiet links share one header line. S-07 separates occurrences by the returned `date` and a hairline, not by cards or shadow. The accent is the ready primary button, the focus ring, and the selected-row mark. Public, private, `scheduled`, `skipped`, `choice_required`, conflict, and failure keep their words.

The task title uses `component.page.title-size`, `component.page.title-line`, `component.page.title-weight`, and `component.page.title-track`, in `component.page.text`. Occurrence titles use `component.row.title-size`, `component.row.title-line`, and `component.row.title-weight`. Body text uses `semantic.font.body-size` and `semantic.font.body-line`. Quiet actions use `component.button.quiet-size` and `component.button.quiet-text`. A quiet action underlines on hover and does not gain a fill. Display names use `semantic.font.name-size`. Start, end, civil dates, and the stored repetition kind use `semantic.font.meta-size`, `semantic.font.meta-line`, `semantic.color.text-meta`, and `semantic.font.figures`.

The browser document title is still the scaffold title. Q-03 is open, so this stage does not paint a product name in the task title or the document title.

The Agenda baseline has no failure hue and no danger text token. A failure is the returned `result` word in `semantic.color.text-primary` at body size. A field border does not change. EX-PT-01: a rule is `component.field.border-width` wide in `semantic.color.border-hairline`. EX-PT-02: S-07 paints visibility and state as words in the facts column. It does not paint the Direction L geometric marks.

`semantic.motion.feedback` is 0 ms, so a result appears in place. There is no entrance motion to reduce.

## 2. Shared frame

The column width is `component.page.content-max`. The page padding is `component.page.padding-block` and `component.page.padding-inline`, with `component.page.padding-end` after the last region. Below `component.page.stack-below`, an S-07 tool row and occurrence row become one column. The page scrolls. The layout does not become a rail or a month grid.

```text
padding component.page.padding-block and component.page.padding-inline
task title and quiet links on one line
command region
PT-C09 under the region that sent the last command
```

A link is quiet text, not an accent fill and not a submit.

Focus is a ring of `component.button.focus-width` in `component.button.focus-color`, offset by `component.button.focus-offset`, drawn outside the control. The selected wash and bar appear on the S-07 occurrence whose control contains focus, using `component.row.selected-wash` and a leading bar of `component.row.selected-mark-width` in `component.row.selected-mark`. They leave when focus leaves that occurrence. A conflict row does not use them. Focus inside a conflict row is the focus ring on the control only. The row does not navigate by itself. PT-C09 is an alert when it shows a `result`. Focus stays on the control that was activated. The label does not change while the command is in flight. If that control is no longer on the page, focus moves to the next remaining control in visual order, or to the task title when none remains.

PT-C03 and PT-C05 use `component.field.height`, `component.field.radius`, `component.field.padding-inline`, `component.field.background`, `component.field.text`, `component.field.border`, and `component.field.border-width`. The label uses `component.field.label` and `semantic.font.label-size`, with `component.field.label-gap` above the field. Password fields use the same box and obscure the value.

Description is the same field box. Its minimum height is one `semantic.font.body-line`, and it grows by that line height. Newlines stay visible.

PT-C02 primary uses `component.button.height`, `component.button.radius`, `component.button.padding-inline`, `component.button.primary-background`, `component.button.primary-text`, and `component.button.primary-weight`. Quiet uses `component.button.quiet-text` on the canvas. Buttons in one region sit on one line with `semantic.space.inline` and wrap when the column is narrow.

PT-C10 stays in the column. It uses the canvas background, a top hairline, and `component.page.text`. Delete uses the primary face. Cancel is quiet. It is not a dialog and has no shadow.

## 3. Unsigned surfaces

S-01 through S-06 share this painting. Each task title is the surface name from the accepted inventory. The other unsigned surface names are the quiet links on the header line. One ready primary button uses the accent fill. Fields stay in a vertical stack. PT-C09 sits under that button.

| Result on these surfaces | Painting |
|---|---|
| `registration_rejected`, `verification_rejected`, `cancellation_rejected`, `login_rejected`, `recovery_rejected`, `send_failed`, `operation_failed`, `save_rejected`, `logged_out` | The `result` string only, body size, `semantic.color.text-primary` |
| In flight | The word `waiting` in `semantic.color.text-meta`. It is not an API result. |
| `ok` on S-01 or S-03 | The string `ok` in `semantic.color.text-primary`. No second sentence. The typed values stay. |
| `ok` on S-02 or S-06 | The visible page becomes S-04. No Calendar is painted. |

`login_rejected` on S-04 and S-05 uses that same failure painting. S-05 adds no second line. A guarded opening of `/calendar`, `/events/new`, `/events/:id`, or `/account` paints S-04, including `logged_out`, and paints no calendar row and no event field.

## 4. S-07 Own Calendar

The task title is "Own Calendar". "New event" and "Account" are quiet links on the header line. From, To, and Show range share one tool row. While either date is empty, Show range uses the quiet face. When both contain a typed date, Show range uses the primary face. The display name under the tool row uses `semantic.font.name-size` and `semantic.color.text-meta`.

Each returned `date` is a day label: `component.day.size`, `component.day.line`, `component.day.weight`, `component.day.track`, and `semantic.font.figures`, with a hairline of `component.day.rule`. The page does not invent a weekday.

Each occurrence is a row. The facts column is `component.row.facts-size` wide. Its words use `semantic.font.meta-size`, `component.row.facts-line`, and `semantic.color.text-meta`. The title and the quiet action share one line, including below `component.page.stack-below`. Start and end, when the state is `scheduled`, are meta text. Location and description are body text. Description keeps its newlines. An empty location or description is blank, not a substitute word. Below `component.page.stack-below`, the tool row and the occurrence row become one column.

| Row | Painting |
|---|---|
| `scheduled` | Visibility and `scheduled` in the facts column, then start and end |
| Series `scheduled` | The same row, plus quiet "Series" and quiet "This occurrence" |
| `skipped` | The word `skipped` in the facts column. No strikethrough and no delete control |
| `choice_required` | The words `choice_required` in the facts column. The returned civil date is meta text and is not an editable field. Two options show the returned instants, neither selected |

Before one instant is selected, Submit choice uses the quiet face. After the selection, that same control uses the primary face. A range whose body has no occurrences paints the tool row and the display name, and paints no row and no success sentence.

## 5. S-08 Event

The task title is "Event". "Calendar" and "Account" are quiet links on the header line. Create paints Title, Start, End, Location, and Description in a vertical stack, then the visibility and repetition choices. Start and End each show a civil date and a clock. Private uses the selected radio. The four repetition options are unselected. Save uses the quiet face until one option is selected, then the primary face. The non-repeating option submits `none`. Cancel is quiet.

Edit paints the stored values in the same fields. The stored visibility is the selected radio. The stored kind is meta text, with no repetition control. Save is primary. Delete is quiet until PT-C10 is revealed.

The occurrence state paints "This occurrence" in body text and the returned start in meta text. Save is primary and the delete control says "Delete this occurrence". Series is a quiet control.

PT-C10 paints the action name, then primary "Delete" and quiet "Cancel".

| Returned body | Painting |
|---|---|
| `ok` with no `conflicts` | The string `ok` in body text. No second sentence. The quiet Calendar link remains |
| `ok` with `conflicts` | The string `ok` in body text, then one row per entry. Title is body text. Start and end are meta text. No visibility word and no accent. No second success sentence |
| `continuesAfterWindow: true` | One line in `semantic.color.text-meta`, outside the conflict rows |
| `save_rejected` | The `result` string in `semantic.color.text-primary` |
| `monthTypes` and `missingDates` | Those returned values as body text under the result string |
| Two instants for an entered doubled time | A choice for those returned instants only |
| `not_found` or `account_gone` | The `result` string in `semantic.color.text-primary`. Event fields stay only when the body still contains them |

## 6. S-09 Account

The task title is "Account". Calendar is a quiet link on the header line. Nickname and Timezone are separate regions, each with its own primary button: "Save nickname" and "Save timezone". The result uses the shared PT-C09 painting. Log out is quiet. Delete account is quiet until PT-C10, which names the account deletion and then shows primary "Delete" and quiet "Cancel".

A committed logout or a committed deletion paints S-04. Account fields, including their values, are not painted on that replacement. A deletion that does not commit keeps this painting and shows the returned `result`.
