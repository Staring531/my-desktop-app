# Component Specifications: Personal Time

- Stage: 3 — Design Tokens and Core Component System, User Approval Gate 2
- Date: 2026-11-25
- Status: The component and interaction inventory remains useful. Its Agenda-specific visual painting was superseded for `apps/website` by the user's PRD-driven redesign authorization on 2026-11-26. Follow `05-visual-design.md` for the current Web visual draft; retain the behavior and accessibility contracts below unless explicitly marked as Agenda-only presentation.
- Token source: `tokens/design-tokens.json`
- Screens: the accepted inventory S-01 through S-09. Q-02, Q-03, and Q-04 stay open.
- This file does not replace `docs/ui-ux/11-component-specifications.md`. Those components belong to the other product. Identifiers here use the `PT-C` prefix so the two sets stay distinct.
- No independent UI/UX review was run.

Shared keyboard rules: Tab moves in visual order. A focused button activates on Enter and Space. A focused navigation link activates on Enter. Escape dismisses PT-C10 and sends nothing, only while no command from that step is in flight. After a command is sent, Escape and Cancel do nothing until the result arrives. Focus is a ring of `component.button.focus-width` in `component.button.focus-color`. Every control has a visible text label. Status is never color alone.

The page shows the API `result` and the returned fields. It does not recompute an instant, an overlap, a monthly preview, or a proof outcome.

## PT-C01 Page

The browser page for one task. Regions: a task title, the current surface, and a slot for PT-C09. The task title is the surface name from the accepted inventory. It is not a product title. Q-03 stays open, and the scaffold title is not shown as the product name.

The former column specification is historical for Agenda. The current Web shell is specified in `05-visual-design.md`. The older component spec's general requirements about readable width and page padding were superseded. Page padding uses `component.page.padding-block`, `component.page.padding-inline`, and `component.page.padding-end`. The page background is `component.page.background` and `component.page.elevation`. Below `component.page.stack-below`, an S-07 tool row and occurrence row become one column. There is no navigation rail, command palette, theme control, or overlay layer.

Unsigned surfaces link to the other unsigned surfaces with quiet navigation links. Signed surfaces keep Calendar as the primary task. Account and Event are secondary links back to the accepted paths. A guarded path without a usable session paints S-04, including `logged_out`, and does not show Calendar or Event fields.

## PT-C02 Button

One height, `component.button.height`. Variants:

| Variant | Face | Use |
|---|---|---|
| Primary | Accent fill, white text | The forward command of one region: register, verify, cancel registration, log in, start recovery, complete recovery, request a calendar range, save an Event, save a nickname, or save a timezone |
| Quiet | Primary text on the canvas, underline on hover | Cancel, return, log out, open Event, open Account, move among unsigned pages, and a generated-choice submit before an instant is selected |

Each command region has one primary button. S-01 through S-06 each have one region. S-07 has one region for the range, and each `choice_required` row is its own region. S-08 has one region for the save. S-09 has one region for the nickname and one region for the timezone. Logout is quiet. A navigation link uses the quiet text color and is not a submit.

Before one returned instant is selected, that row's submit stays quiet and does not send. After the selection, the same control uses the primary face. A command in flight keeps its label and does not send a second time. There is no spinner and no separate disabled color. PT-C09 shows `waiting` until the result arrives. That word is not an API result.

## PT-C03 Text field

Single line for username, email, password, nickname, proof code, title, location, and the IANA timezone name on S-09. Password is obscured and uses the same border and text. Multi-line for description, with the same border and text and a height that grows by body line height. The label sits outside the field.

Registration does not show a timezone field. It sends the browser IANA name with the registration command. S-09 is where a later name is entered. There is no email-change field.

A failure does not clear the value. A shared failure does not switch one field's border to danger, because that would say which value failed. The field border stays `component.field.border`. The explanation, when one exists, is PT-C09.

## PT-C04 Civil-date field

`from` and `to` on S-07 are typed civil dates. The civil date submitted with a generated choice is the date on that returned occurrence. It is shown as meta text and is not editable. The typed fields use PT-C03's box, tabular figures, and a visible label. They do not open a month grid, and they do not choose the initial range. Q-04 stays open.

## PT-C05 Local-time field

Start and end on S-08 are the civil date and the local clock, typed together and sent as entered. The field uses PT-C03's box and tabular figures. It does not offer a calendar and does not turn the text into an instant. A date with no clock is still sent so the API can return `save_rejected`. A missing local time and an unchosen doubled time come back as PT-C09. The doubled choice itself is PT-C06 only when the returned body includes the instants.

## PT-C06 Choice

A radio group with text labels. Arrow keys move inside the group. The group does not submit by itself.

| Use | Options | Initial selection |
|---|---|---|
| Visibility on a new Event | `private`, `public` | `private` |
| Visibility on an existing Event | the stored value, shown as the selected option | the stored value |
| Repetition while creating | `non-repeating`, `daily`, `weekly`, `monthly` | none |
| Generated doubled start on S-07 | the two instants in the returned body | none |

The non-repeating option is labeled `non-repeating` and submits the stored kind `none`. Daily, weekly, and monthly submit those words. On create, Save uses the quiet face and does not send until one repetition option is selected. Repetition is absent on an existing Event. The stored kind is meta text, not a control, and it is not sent as a change. A generated choice offers only the two returned instants. The page does not add a third.

## PT-C07 Facts

The facts column on an S-07 occurrence. It is `component.row.facts-size` wide. The words use `semantic.font.meta-size`, `component.row.facts-line`, and `semantic.color.text-meta`. EX-PT-02: there is no geometric mark.

| Meaning | Word |
|---|---|
| Public | `public` |
| Private | `private` |
| Scheduled | `scheduled` |
| Skipped | `skipped` |
| Choice required | `choice_required` |

`scheduled` also shows start and end as meta text under the title. Public and private are words, not two hues. Skipped is the word `skipped`, with no strikethrough and no delete control. The word is required in every case.

## PT-C08 Row

One row for an occurrence and one row for a conflict. An occurrence row places PT-C07 in the facts column, the title and quiet action on one line, and meta and body text under the title. Padding uses `component.row.padding-block` and `component.row.padding-inline`. The gap uses `component.row.gap-block` and `component.row.gap-inline`. The hairline is `component.row.rule` at `component.field.border-width` (EX-PT-01). The row grows with title, location, and description and keeps description newlines. It does not truncate those strings. It does not navigate by itself. Below `component.page.stack-below`, the tool row and the occurrence row become one column. The title and the quiet action stay on one line.

An occurrence row shows the returned display name, visibility, state, title, location, and description. Start and end appear only when the state is `scheduled`. A skipped row has no cancelled treatment. A `choice_required` row contains PT-C06 and has no scheduled interval. An occurrence that contains focus uses `component.row.selected-wash` and a leading bar of `component.row.selected-mark-width` in `component.row.selected-mark`. The wash leaves when focus leaves that occurrence. It does not select an instant and it does not change Save or Delete.

A conflict row shows `title`, `start`, and `end` only. It has no visibility word, no wash, and no accent bar. The continuation sentence is not a row.

## PT-C09 Result

The `result` of the command, on the surface that sent it. It appears in place. `semantic.motion.feedback` is 0 ms. It is an alert. It is not a toast and not another screen.

| Body | Presentation |
|---|---|
| `registration_rejected`, `verification_rejected`, `cancellation_rejected`, `login_rejected`, `recovery_rejected`, `send_failed`, `operation_failed`, `save_rejected`, `not_found`, `account_gone` | The `result` string in `semantic.color.text-primary` at body size. The same string looks the same on every surface. A field border does not change. |
| `login_rejected` on S-04 and on S-05 | The same component and the same string. S-05 does not say that a proof was sent. |
| `logged_out` | The same failure treatment. Calendar and Event fields are absent. |
| `save_rejected` with `monthTypes` and `missingDates` | The `result` string, then those returned values as text. The page does not add dates. |
| In flight | The word `waiting` in `semantic.color.text-meta`. It is not an API result and it is replaced by the returned result. |
| `ok` on a page that stays | The string `ok` in body text. No second sentence. The surface also redraws from the body. |
| `ok` on S-02 or S-06 | The visible page becomes S-04. S-07 does not open. |
| `ok` with `conflicts` | The string `ok`, then PT-C08 conflict rows for each returned entry. An empty list shows `ok` and no conflict row. |
| `continuesAfterWindow: true` | One line in `semantic.color.text-meta`: the repetition continues after 90 days. It is outside the conflict list. |

The failure text does not include an email, a password, a proof code, a provider message, or a stack. It does not say which registration field was taken or whether an account exists or is verified.

## PT-C10 Confirm step

A region on S-08 or S-09, in the page flow. It uses the canvas background, a top hairline, and `component.page.text`. It is not a dialog and has no shadow. The first control is a quiet button that reveals the region and sends nothing. The revealed region names the action, then offers primary "Delete" and quiet "Cancel". Dismiss sends nothing and leaves the stored account or Event on screen. Until that primary Delete is activated, no delete is sent. If the command does not commit, PT-C09 appears and the stored record stays.

## Specimen gallery

These specimens are for review of the system. They are not page layouts.

| Specimen | Composition |
|---|---|
| Primary and quiet buttons | Accent fill "Save" beside quiet "Cancel" |
| Text field | Label "Title", empty field surface, field-edge border |
| Civil-date field | Label "From", tabular figures, no month grid |
| Local-time field | Label "Start", tabular figures, no clock popup |
| Choice | `private` selected, `public` unselected |
| Repetition choice | Four words, none selected |
| Facts | `public`, `private`, `scheduled`, `skipped`, and `choice_required` as words |
| Occurrence row | Facts column, title, quiet action, and the returned display name |
| Conflict row | Title, start, and end only |
| Shared failure | `login_rejected` in `semantic.color.text-primary`, with no second sentence |
| Continuation | Meta text that the repetition continues after 90 days, not inside the conflict list |
| Choice submit before a selection | Quiet text, and it does not send |
| Confirm step | The action name, primary "Delete", quiet "Cancel" |

## Trace

| Component | Surfaces |
|---|---|
| PT-C01, PT-C02, PT-C09 | S-01 through S-09, for the commands that surface may send |
| PT-C03 | S-01 through S-06, S-08, and the nickname and timezone fields on S-09 |
| PT-C04 | S-07 |
| PT-C05, PT-C06 visibility and repetition | S-08 |
| PT-C06 generated choice, PT-C07, PT-C08 | S-07. Conflict rows of PT-C08 also appear on S-08 |
| PT-C10 | S-08 for Event and occurrence deletion. S-09 for account deletion |

S-02, S-03, S-04, S-05, and S-06 are compositions of PT-C01, PT-C02, PT-C03, and PT-C09. They do not add components. S-05 uses the same `login_rejected` specimen as S-04.
