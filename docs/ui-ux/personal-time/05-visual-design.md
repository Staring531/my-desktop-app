# Visual Design: Personal Time

- Stage: 5 — High-Fidelity Visual Design and Interaction Specifications
- Date: 2026-11-25
- Status: Included in the UI package approved by the user on 2026-11-25. This applies Direction L and the approved token baseline to the Stage 4 sketches accepted the same day. This approval does not authorize application code. The handoff is `15-handoff.md`.
- Working structure: `04-wireframes.md` and `12-page-specifications.md`.
- Tokens: `tokens/design-tokens.json` and `10-design-tokens.md`. Pages use semantic or component tokens.
- Components: PT-C01 through PT-C10 in `11-component-specifications.md`.
- Interactions: `06-interaction-specifications.md`.
- Q-02, Q-03, and Q-04 stay open. No screen names a product title, paints the mail message, or fills the first `from` and `to`.
- No image is the source of truth. These token references are the editable specification.
- This file does not replace `docs/ui-ux/05-visual-design.md`.
- No independent UI/UX review was run.

## 1. Direction applied

Direction L is one light browser column. The page background is `semantic.color.canvas` and `semantic.elevation.flat`. Regions separate by `semantic.space.region` and a hairline, not by cards or shadow. The accent is only a ready primary button, the focus ring, and the selected-row mark. Public, private, `scheduled`, `skipped`, `choice_required`, conflict, and failure keep their words.

The task title uses `semantic.font.title-size`, `semantic.font.title-line`, and `semantic.font.title-weight`, in `component.page.title-color`. Fields, row titles, and result strings use the body role. Display names, clock times, civil dates, and the stored repetition kind use the meta role and `semantic.color.text-meta`. Clock times and civil dates also use `semantic.font.figures`. Quiet links use `component.button.quiet-text` at the body size.

The browser document title is still the scaffold title. Q-03 is open, so this stage does not paint a product name in the task title or the document title.

One exception, EX-PT-01: a region or row rule is `primitive.size.rule` wide in `semantic.color.border-hairline`. The token set has no semantic border-width. The value is the approved 1 px rule. No other raw value is introduced.

`component.result.duration` is 0 ms, so a result appears in place. There is no entrance motion to reduce.

## 2. Shared frame

The column width is `component.page.content-max`. The page inset is `component.page.inset`. A narrower viewport keeps the same vertical stack and scrolls the page. Row actions wrap under the row text. The layout does not become a rail or a second column.

```text
inset component.page.inset
task title
quiet links, gap semantic.space.inline
hairline
regions, separated by semantic.space.region
PT-C09 under the region that sent the last command
```

Content sits on `semantic.layer.content`. The link row wraps. A link is quiet text, not an accent fill and not a submit.

Focus is a ring of `component.button.focus-width` in `component.button.focus-color`, drawn outside the control. A selected occurrence row uses `component.row.selected-wash` and a leading bar of `component.row.selected-mark-width` in `component.row.selected-mark`. A conflict row does not. Focus inside a conflict row is the focus ring on the control only. The row still does not navigate by itself. PT-C09 is an alert when it shows a `result`. Focus stays on the control that was activated. The label does not change while the command is in flight. If that control is no longer on the page, focus moves to the next remaining control in visual order, or to the task title when none remains.

PT-C03 and PT-C05 use `component.field.height`, `component.field.radius`, `component.field.padding-inline`, `component.field.background`, `component.field.text`, `component.field.border`, and `component.field.border-width`. The label is body text above the field, with `semantic.space.stack` between label, field, and the next label. A shared failure does not switch one field border to danger. The border stays `component.field.border`. Password fields use the same box and obscure the value.

Description is the same field box. Its minimum height is one `semantic.font.body-line`, and it grows by that line height. Newlines stay visible.

PT-C02 is `component.button.height`, with `component.button.radius` and `component.button.padding-inline`. Primary uses `component.button.primary-background` and `component.button.primary-text`. Quiet uses `component.button.quiet-text` on the canvas. Danger uses `component.button.danger-text` on the canvas. Buttons in one region sit on one line with `semantic.space.inline` and wrap when the column is narrow.

PT-C10 uses `component.confirm.padding`, `component.confirm.background`, `component.confirm.text`, and a top rule of `component.confirm.rule`. It stays in the column at `component.confirm.layer`. It is not a dialog and has no shadow.

## 3. Unsigned surfaces

S-01 through S-06 share this painting. Each task title is the surface name from the accepted inventory. The other unsigned surface names are the quiet links. One primary button uses the accent fill. PT-C09 sits under that button.

| Result on these surfaces | Painting |
|---|---|
| `registration_rejected`, `verification_rejected`, `cancellation_rejected`, `login_rejected`, `recovery_rejected`, `send_failed`, `operation_failed`, `save_rejected`, `logged_out` | `component.result.failure-text`, body size, the `result` string only |
| In flight | The word `waiting` in `semantic.color.text-secondary`. It is not an API result. |
| `ok` on S-01 or S-03 | The string `ok` in `component.result.body-text`. No second sentence. The typed values stay. |
| `ok` on S-02 or S-06 | The visible page becomes S-04. No Calendar is painted. |

`login_rejected` on S-04 and S-05 uses that same failure painting. S-05 adds no second line. A guarded opening of `/calendar`, `/events/new`, `/events/:id`, or `/account` paints S-04, including `logged_out`, and paints no calendar row and no event field.

## 4. S-07 Own Calendar

The task title is "Calendar". "New event" and "Account" are quiet links. From and To are PT-C04. While either is empty, Show range uses the quiet face. When both contain a typed date, Show range uses the primary face. The display name under the fields is meta text, the value from the body.

Each occurrence is a PT-C08 row: minimum height `component.row.min-height`, padding `component.row.padding-inline`, bottom rule `component.row.rule`. The mark is `component.mark.size` in `component.mark.text`, followed by the API word in that same color. Title, location, and description are body text. Description keeps its newlines. Start, end, the civil date, and the display name are meta text with tabular figures. An empty location or description is blank, not a substitute word.

| Row | Painting |
|---|---|
| `scheduled` | Visibility mark and word, then `scheduled`, then start and end |
| Series `scheduled` | The same row, plus quiet "Series" and quiet "This occurrence" |
| `skipped` | Dash mark and `skipped`. No strikethrough and no delete control |
| `choice_required` | Two-tick mark and `choice_required`. The returned civil date is meta text and is not an editable field. Two PT-C06 options show the returned instants, neither selected |

Before one instant is selected, Submit choice uses the quiet face. After the selection, that same control uses the primary face. A range whose body has no occurrences paints the fields and the display name, and paints no row and no success sentence.

## 5. S-08 Event

The task title is "Event". "Calendar" and "Account" are quiet links. Create paints Title, Start, End, Location, and Description, then PT-C06. Start and End each show a civil date and a clock. Private uses the selected radio. The four repetition options are unselected. Save uses the quiet face until one option is selected, then the primary face. The non-repeating option submits `none`. Cancel is quiet.

Edit paints the stored values in the same fields. The stored visibility is the selected radio. The stored kind is meta text, with no repetition control. Save is primary. Delete is quiet until PT-C10 is revealed.

The occurrence state paints "This occurrence" in body text and the returned start in meta text. Save is primary and the delete control says "Delete this occurrence". Series is a quiet control.

PT-C10 paints the action name in `component.confirm.text`, then danger "Delete" and quiet "Cancel".

| Returned body | Painting |
|---|---|
| `ok` with no `conflicts` | The string `ok` in body text. No second sentence. The quiet Calendar link remains |
| `ok` with `conflicts` | The string `ok` in body text, then one PT-C08 row per entry. Title is body text. Start and end are meta text. No visibility mark and no accent. No second success sentence |
| `continuesAfterWindow: true` | One line in `component.result.continuation-text`, outside the conflict rows |
| `save_rejected` | The `result` string in `component.result.failure-text` |
| `monthTypes` and `missingDates` | Those returned values as body text under the result string |
| Two instants for an entered doubled time | PT-C06 for those returned instants only |
| `not_found` or `account_gone` | The `result` string in failure text. Event fields stay only when the body still contains them |

## 6. S-09 Account

The task title is "Account". Calendar is a quiet link. Nickname and Timezone are separate regions, each with its own primary button: "Save nickname" and "Save timezone". The result uses the shared PT-C09 painting. Log out is quiet. Delete account is quiet until PT-C10, which names the account deletion and then shows danger "Delete" and quiet "Cancel".

A committed logout or a committed deletion paints S-04. Account fields, including their values, are not painted on that replacement. A deletion that does not commit keeps this painting and shows the returned `result`.
