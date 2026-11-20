# Visual Design

- Stage: 5 — High-Fidelity Visual Design
- Date: 2026-11-20
- Status: Accepted by the user on 2026-11-20 with the UI/UX design package. This applies Direction L and the approved token baseline to the accepted Stage 4 sketches. This acceptance does not authorize application code.
- Working structure: `04-wireframes.md` and `12-page-specifications.md`, accepted with this package on 2026-11-20.
- Tokens: `tokens/design-tokens.json` and `10-design-tokens.md`. Pages use semantic or component tokens.
- Components: C-01 through C-09 in `11-component-specifications.md`.
- Q-04 was closed by the user on 2026-11-20. Remove, delete, and dissolve confirm on the same surface. There is no dialog.
- No image is the source of truth. These measurements are the editable specification.

## 1. Direction applied

Direction L remains a light, compact desktop instrument. The window is one canvas, `semantic.color.canvas`, with `semantic.elevation.flat`. Regions separate by `semantic.space.region` and a hairline, not by cards or shadow. The accent is only the primary button, the focus ring, and the selected-row mark. Busy, free, team, and only-you stay a mark plus a word in `component.mark.text`.

The window title is the existing document title, "My Desktop App". Surface headings use `semantic.font.title-size`, `semantic.font.title-line`, and `semantic.font.title-weight`, in `semantic.color.text-primary`. Row text uses the body role. Zone names, clock labels, and retained-owner emails use the meta role and `semantic.color.text-meta`. Region labels use the body role and `semantic.color.text-secondary`.

One exception, EX-01: a region rule is `primitive.size.rule` in `semantic.color.border-hairline`. The token set has no semantic border-width. The value is the approved 1 px rule. No other raw value is introduced.

`semantic.motion.feedback` is 0 ms, so a result or notice appears in place. There is no entrance motion to reduce.

## 2. Shared frame

The initial window is `primitive.size.window-width` by `primitive.size.window-height`. A narrower or shorter window keeps this same vertical stack. The shell row stays outside the scrollport. The surface below that row is the only scroller. Rows wrap their actions under the text. The layout does not become a second column of navigation.

```text
inset semantic.space.inset
[ My Desktop App          {zone in meta, when known}  Open another session ]
hairline
surface heading
regions, separated by semantic.space.region
C-08 under the control that sent the command
```

The shell row is at least `component.button.height`. Gaps inside that row are `semantic.space.inline`. "Open another session" is C-02 quiet on every surface. The zone is omitted when the projection has none. Content sits on `semantic.layer.content`.

C-09, when S-08 is showing, uses `component.notice.background`, `component.notice.padding`, `component.notice.rule`, `component.notice.text`, and `component.notice.layer`. It sits under the shell row and above the surface. It is not a toast and not a second window.

On S-02 through S-08, focus starts at "Open another session", then moves through the surface. On S-01 the email field is first, matching that page's keyboard contract; "Open another session" follows the surface. Focus is a ring of `component.button.focus-width` in `component.button.focus-color`, drawn outside the control. An event row that contains the focused control also uses `component.row.selected-wash` and a leading bar of `component.row.selected-mark-width` in `component.row.selected-mark`. A member row uses the focus ring only. The row still does not navigate by itself. C-08 is an alert when it shows a result code, and the rejected field's description points at that text. Focus stays on the control that was activated, including while its label is the pending verb. If that control is no longer in the projection, focus moves to the next remaining control in visual order, or to the surface heading when none remains.

## 3. Surfaces

### S-01 Bind this session

Heading "Bind this session". One C-03 labeled "Email", then C-02 primary "Bind", then C-08. The field uses `component.field.height`, `component.field.radius`, `component.field.background`, `component.field.text`, and `component.field.border`. Stack gap is `semantic.space.stack`. A rejected email keeps the typed value and switches the border to `semantic.color.text-danger`. Bind is the only primary button.

### S-02 Create the team

Heading "Create the team". Body text "This session is {email}" in `semantic.color.text-primary`. No email field. C-02 primary "Create team", then C-08.

### S-03 This invite

Heading "Invitation". The invited email is body text. C-02 primary "Accept" and C-02 quiet "Decline" sit on one line, gap `semantic.space.inline`, and wrap if the window is narrow. No roster, event, or busy/free region.

### S-04 No team access

Heading "No team access". Body text "{email} cannot see this team." in `semantic.color.text-secondary`. No primary button and no write control.

### S-05 Team workspace

Heading "Team". The instant line is body text "Showing {instant}" with the clock in the projection zone, then C-02 quiet "Now". The instant uses tabular lining only if the operating-system font provides it. No second typeface is loaded.

Region "Members", then C-07 rows. Each row is at least `component.row.min-height`, with padding `component.row.padding-inline` and a bottom rule `component.row.rule`. C-06 shows a filled square and "Busy", or an open square and "Free", then the member email. There is no separate display name. Maintainer-only quiet "Make maintainer" and danger "Remove" appear on another member's row. They are absent on the viewer's own row and absent for an ordinary member.

Region "Events". C-06 shows a filled square and "Team", or an open square and "Only you", then the title, location, and description in body text. Description keeps its newlines. Meta shows "{start} – {end}" and, on every team-visible row, the stored owner email. Quiet "At start" and "At end" follow on every visible row. Quiet "Edit" follows only when this actor may change that event. An empty event list shows body text "No events" in `semantic.color.text-secondary`. The member board and C-02 primary "New event" remain. "New event" is the only primary button on this surface.

Region "Pending invites" renders only for the maintainer and only when the projection has at least one pending address. Each address is a C-07 row with quiet "Cancel invite".

Region "Invite" renders only for the maintainer. C-03 labeled "Email" and quiet "Invite" share a line and wrap under the field when needed. "Invite" is not a second primary button.

C-02 danger "Dissolve" renders only when the projection says this actor is the sole member. It sits after the regions, in `component.button.danger-text`, on the canvas, with no filled danger background. Its first press, and the first press of "Remove", is replaced in place by the I-15 question, a danger button with the same verb, and quiet "Cancel".

C-08 is under the control that sent the last command.

### S-06 One event

The shell stays. This surface replaces the S-05 body. Heading "New event" or "Edit event".

Create, top to bottom, stack gap `semantic.space.stack`:

- C-05 "Visibility", options "Team" and "Only you", neither selected.
- C-03 "Title", single line.
- C-03 "Location", single line.
- C-03 "Description", multi-line, growing by `semantic.font.body-line`.
- C-04 "Start" and C-04 "End". Each is one line in the pattern specified by I-10. There is no calendar.
- Meta "Zone {projection zone}", read-only.
- C-02 primary "Save" and C-02 quiet "Cancel".

Creator edit uses the same fields. The stored visibility is selected. Start and end first appear as meta text, with quiet "Change start" and "Change end". The chosen clock becomes C-04 only after that control is used.

Custody edit has no C-05. Body text "Team" is read-only. Title, location, description, Save, Cancel, and danger "Delete" remain. Start and end use the same text-then-change presentation as creator edit. A clock becomes C-04 only after "Change start" or "Change end".

An ambiguous field adds C-05 under that field: "Start occurred twice." or "End occurred twice.", options "Earlier" and "Later", neither selected. Each option also shows the returned instant in the projection zone. When both are ambiguous, the command reports start first. The end choice appears only after a later submit still reports `ambiguous-local-time` for end.

Danger "Delete" appears only for an existing event this actor may delete. It is absent on create. Its first press is replaced in place by the I-15 question, a danger "Delete", and quiet "Cancel". C-08 sits under the control that failed.

### S-07 Record unreadable

Heading "This team record cannot be read." Body text "No replacement team is created." C-08 shows `record-unreadable` in `semantic.color.text-danger`. No create control. "Open another session" remains in the shell.

### S-08 Writer already exists

C-09 text "A writer already exists." and quiet "Dismiss". The surface underneath is unchanged. The process that did not get the lock has no frame.

## 4. State appearance

| State | Appearance |
|---|---|
| Pending command | The issuing button keeps its variant and changes its label to the pending verb in `06-interaction-specifications.md`. No spinner. |
| Rejection or validation | C-08 in `semantic.color.text-danger`. A rejected field also uses `semantic.color.text-danger` as its border. Typed text remains. |
| Success | The new projection redraws the surface. No success toast. |
| Disabled | The control stays, in `semantic.color.text-meta`, and does not submit. |
| Empty events | "No events" plus the board and "New event". |
| Selected row | An event row that contains focus uses the wash and the leading bar. A member row uses the focus ring only. |

## 5. Window behavior

At 1200 by 800 and at a smaller size, the regions stack in the order above. The shell row stays visible. Only the surface below it scrolls. Below the initial size, the same order wraps. Nothing collapses into a navigation rail, a calendar, or a second session inside the window. No minimum or maximum window size is added.

## 6. Out of this specification

No dark theme, theme control, confirmation dialog, timezone picker, recurring control, or all-day control. Remove, delete, and dissolve confirm inline, as specified by I-15. Website, Admin, and API remain out of Version 1.
