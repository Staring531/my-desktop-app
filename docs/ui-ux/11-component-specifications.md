# Component Specifications

- Stage: 3 — Design Tokens and Core Component System, User Approval Gate 2
- Date: 2026-11-20
- Status: Approved by the user on 2026-11-20 with the token baseline. This approval does not draw pages and does not authorize application code.
- Token source: `tokens/design-tokens.json`
- Screens: the accepted inventory S-01 through S-08. Q-04 was closed by the user on 2026-11-20. Confirmation is body text plus C-02 danger and C-02 quiet on the same surface. This set has no confirmation dialog.

Shared keyboard rules: Tab moves in visual order. A focused button of any variant activates on Enter and Space. Escape on S-06 returns to S-05 and writes nothing only before a command from that surface is sent. After the command is sent, Escape and Cancel do nothing until the result arrives. Escape dismisses the S-08 notice and writes nothing when no command is pending. Focus is a ring of `component.button.focus-width` in `semantic.color.focus`. Every control has a visible text label. Status is never color alone. Review correction UX-REV-002, 2026-11-20: quiet and danger buttons use the same keys as the primary button.

## C-01 Window shell

The one window for one session. Regions: a title row, a quiet control that asks the shell to open another unbound window, the current surface, and slots for C-08 and C-09. Opening another session does not copy the email or unsent edits. The shell shows the read-only zone name when the projection includes it. Tokens: canvas, title type, inset space, flat elevation.

States: unbound, bound, and the S-07 unavailable state. S-07 keeps the shell and shows C-08's unavailable result; it offers no create action.

Used by every surface. Anti-pattern: a navigation rail, a theme control, or a second session inside the same window.

## C-02 Button

One height, `component.button.height`. Variants:

| Variant | Face | Use |
|---|---|---|
| Primary | Accent fill, white text | The one forward command on the surface: bind, create team, accept, save |
| Quiet | Text on the canvas, hairline optional | Open another session, decline, cancel, dismiss |
| Danger | Danger text on the canvas | Remove, delete, dissolve, where the projection allows it |

Disabled buttons stay in place with meta text and do not submit. Loading is the same button with its label changed to the pending verb; there is no spinner. A surface has one primary button.

## C-03 Text field

Single-line for email, title, and location. Multi-line for description, with the same border and text tokens and a height that grows by body line height. The label is outside the field. An unusable or rejected value is described in C-08 and the field border switches to `semantic.color.text-danger`. The value is not cleared by the failure. Editorial correction on 2026-11-20: this result is C-08. C-09 remains the writer notice only.

## C-04 Clock field

Start or end, as wall time in the one zone named by the projection. The operator types the time; the field does not offer a calendar. Omitted, nonexistent, and ambiguous results come back as C-08 plus, for an ambiguous field, C-05. The zone is not editable here.

## C-05 Choice

A pair of radio options with text labels. Two uses: event visibility, team-visible or only-self; and an ambiguous clock, earlier or later. If both clocks are ambiguous, the start choice is presented first. No option is preselected for an occurrence. Arrow keys move within the group. The group does not submit by itself.

## C-06 Mark

A geometric mark of `component.mark.size` plus a word, both in `component.mark.text`.

| Meaning | Mark | Word |
|---|---|---|
| Busy | Filled square | Busy |
| Free | Open square | Free |
| Team-visible | Filled square | Team |
| Only-self | Open square | Only you |

Busy and free are not green and red. Team and only-self are not two hues. The same filled square may mean busy in the board and team-visible on an event; the word is the discriminator, and the two regions do not mix the marks in one list.

## C-07 Data row

One row anatomy for a member, an invite, and an event. Slots: mark or empty, primary text, meta text, and zero or more quiet or danger buttons that the projection allows. Minimum height `component.row.min-height`, hairline between rows. A selected event row adds the wash and the 2 px leading bar. A member or invite row may truncate overflow, with the full string in the accessible name. An event row does not truncate title, location, or description. It grows with that text and keeps description newlines. The row does not navigate by itself; its action buttons do.

Member rows show busy or free at the chosen instant. Event rows show visibility, title, location, description, and the clock labels. An invite row appears only for a maintainer and only offers the cancel action the projection allows.

## C-08 Result

One or two lines on the surface that sent the command. Roles: rejection, validation, no access, and record unavailable. Rejection and validation use danger text. The line appears at once, with `semantic.motion.feedback`. It is an alert, and a rejected field's description points at it. It is not a separate screen and not a toast. A successful command redraws from the projection and does not add a second success sentence.

## C-09 Notice

The S-08 writer notice. Surface background, hairline, primary text, and a quiet dismiss button. Layer `component.notice.layer`. Dismissing it leaves the record unchanged. S-07 uses C-08 rather than this notice, because that condition stays until a later approved repair.

## Specimen gallery

These are the review specimens. They are not page layouts.

| Specimen | Composition |
|---|---|
| Primary and quiet buttons | Accent fill "Save" beside quiet "Cancel" |
| Danger button | Text "Dissolve" in danger color, on the canvas |
| Text field | Label "Title", empty surface field, hairline border |
| Clock field | Label "Start", zone name in meta text, not a picker |
| Choice | "Team" and "Only you", neither selected until the operator chooses |
| Marks | Busy, Free, Team, and Only you, each a square plus the word |
| Data row | One member line: filled square, "Busy", the member email, no second color |
| Result | `unusable-email` in danger text under the field |
| Notice | "A writer already exists." with quiet "Dismiss" |

## Trace

| Component | Surfaces |
|---|---|
| C-01, C-02, C-08 | S-01 through S-08 as each surface's commands allow |
| C-03 | S-01 email; S-06 title, location, description |
| C-04, C-05 | S-06 |
| C-06, C-07 | S-05; C-07 also for the maintainer invite list |
| C-09 | S-08 |

S-02, S-03, and S-04 are compositions of C-01, C-02, C-03, and C-08. They do not add components.
