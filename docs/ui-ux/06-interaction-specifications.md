# Interaction Specifications

- Stage: 5 — High-Fidelity Visual Design and Interaction Specifications
- Date: 2026-11-20
- Status: Accepted by the user on 2026-11-20 with the UI/UX design package. These contracts add no business rule. This acceptance does not authorize application code.
- Visuals: `05-visual-design.md`. Pages: `12-page-specifications.md`.
- A failed command shows its result code in C-08 on the session that sent it. The wording of a code is the code itself, as required by the approved error contract. Other sessions do not see unsent fields.
- Q-04 was closed by the user on 2026-11-20. Remove, delete, and dissolve ask for confirmation on the same surface before the command is sent. The confirmation is not a destination and not an authorization boundary. Dismissing an ambiguous-time choice still returns to S-05 and discards the unsent edit.

## 1. Shared command behavior

The renderer sends one command, then waits. While that command is pending, the issuing button shows the pending verb and ignores further click, Enter, and Space. Cancel and Escape are available only before the command is sent. After it is sent, the surface waits for the result so a local cancel cannot claim that a queued write did not happen.

A rejection leaves the stored record unchanged and leaves the unsent edit in place. Success redraws from the new projection. C-08 is used for a code, not as a second success message.

| Control | Pending verb |
|---|---|
| Bind | Binding |
| Create team | Creating |
| Accept | Accepting |
| Decline | Declining |
| Invite | Inviting |
| Cancel invite | Canceling |
| Make maintainer | Making maintainer |
| Remove | Removing |
| Dissolve | Dissolving |
| Save | Saving |
| Delete | Deleting |

Tab moves in visual order. A focused button activates on Enter and Space. Enter in a single-line field activates the primary button on S-01 and on the S-06 title and location fields. Enter in the S-05 invite field activates Invite, not New event. Enter in the description field inserts a newline and does not activate Save. Focus starts at "Open another session", then the surface from top to bottom, except S-01, where the email field is first and "Open another session" follows the surface. That exception keeps the bind task on the first field of a new window.

C-08 is an alert when it shows a code. The rejected field's accessible description is that alert text. The border change is not the only cue.

A pushed projection refreshes S-05, including `busyAt` at the instant already being viewed. An open S-06 keeps its unsent edit when this session still has access. A projection that removes this session's access, or that dissolves the record, replaces S-06. Event fields do not remain. A rejection that arrives after that replacement is shown with C-08 on the replacement surface, without the event fields.

`replace-failed` is shown like any other code. The previous file remains, the unsent edit remains, and the operator may submit that command again. The design does not retry it silently.

## 2. Interactions

### I-01 Bind this session

- Intent: store an email for this window, or remain unbound.
- Actor: operator of an unbound window. Flow F-01. Screen S-01.
- Input: the typed email. The command is `bind` with that requested email only.
- Before send: an empty field does not send. C-08 shows `unusable-email`, the field border switches to danger, and the field stays empty.
- Result: `unusable-email` or `bind-rejected` stays on S-01 and keeps the typed value. `record-unreadable` shows S-07 and does not open S-02. Success stores the canonical email in the session and replaces the surface from the projection: S-02, S-03, S-04, or S-05.
- Cancel: clearing the field writes nothing. There is no team write on this interaction.
- Must not send: actor email, zone, generation, or a team command.
- Trace: TD-002. Supports AC-004, AC-015, and AC-019 by choosing the email. Binding writes no team record.

### I-02 Open another session

- Intent: open one new unbound window.
- Actor: any current window. Shell control on every surface.
- Input: none. The new window receives no email and no unsent fields.
- Result: the new window is S-01. This window stays as it was.
- Trace: TD-001. This is not a second team or another computer.

### I-03 Create the team

- Intent: create the one team from the bound email.
- Actor: bound session while the record is absent or dissolved. Flow F-02. Screen S-02.
- Input: none. `createTeam` sends no email, zone, or generation.
- Result: success shows S-05 for that founder. `unusable-email` stays on S-02. `team-already-active` or `generation-mismatch` is shown on the surface the latest projection selects, which is S-05 when the other create has already succeeded. The record is unchanged on rejection.
- Trace: BR-1, AC-001, AC-002, AC-003, AC-050. AC-002 is the attempt when the record is already active. That window is not sitting on a create form that can succeed.

### I-04 Accept or decline this invite

- Intent: accept onto the roster, or decline.
- Actor: the invited email, not a current member. Flow F-03. Screen S-03.
- Input: `acceptInvite` or `declineInvite`. No roster or event command.
- Result: accept success shows S-05, including team-visible events that already ended or were created before the join. Decline success shows S-04 when no access remains. `no-matching-invite` or `not-allowed` stays on S-03.
- Trace: BR-2, AC-004, AC-005, AC-030, AC-032, AC-034, AC-036.

### I-05 No team access

- Intent: show that this bound email cannot see the active team.
- Actor: not a member and no pending invite. Flows F-01 and F-07. Screen S-04.
- Input: none. No write control is rendered, including create.
- Result: a later projection with a pending invite for this same email replaces the surface with S-03. The session email does not change.
- Trace: BR-5, AC-015, AC-019.

### I-06 Read busy and free

- Intent: show each current member as busy or free at one instant.
- Actor: current member. Flow F-06. Screen S-05.
- Input: none on first paint. The board starts at the current time. "Now", "At start", and "At end" change only the instant being viewed. They do not write and do not open S-06.
- Computation: the board calls `busyAt` for that instant. The viewer's row includes that viewer's only-self events. Every other row uses team-visible events only. The end instant of an event is free for that event. Ended events stay in the event list and do not make the current instant busy.
- Result: a removed owner has no member row. That owner's retained team-visible events stay in the event list with the stored owner email.
- Trace: BR-6, AC-016, AC-017, AC-018, AC-040, AC-042, AC-045. Clock labels use the one projection zone. AC-042 does not add a zone picker. On this one computer the two sessions share that zone.

### I-07 Maintainer roster actions

- Intent: invite, cancel an invite, designate a maintainer, remove a member, or dissolve when sole.
- Actor: the projection says this session is the maintainer, except dissolve, which renders only for the sole member. Flows F-03, F-04, F-07. Screen S-05.
- Input: invite sends the typed email. Cancel sends that pending address. Designate and remove send the other member. Dissolve sends no extra email. An ordinary member does not see these controls.
- Before send: an empty invite field does not send. C-08 shows `unusable-email`. Remove and Dissolve do not send on the first press. They open I-15. The confirming press sends the command.
- Result codes stay on S-05: `unusable-email`, `already-member`, `invite-exists`, `no-matching-invite`, `not-allowed`. A successful invite shows the new pending row. A successful designate redraws rights. A successful remove drops that member row and that member's only-self events. A successful dissolve replaces the surface with S-02 because the record is dissolved. An ordinary member does not receive invite, cancel, remove, or designate controls (AC-038). The maintainer's own row has no designate control (AC-039).
- The viewer's own row has no "Make maintainer" and no "Remove". If the projection no longer has a sole member, Dissolve is absent. A dissolve that the domain rejects shows `not-allowed` and writes nothing.
- Trace: BR-2, BR-3, BR-5, AC-006 through AC-011, AC-019, AC-023, AC-033, AC-038, AC-039. AC-010 and AC-011 have no control that can succeed for those actors. The rejection is the result if a stale control is activated.

### I-08 Open one event

- Intent: create an event, or edit one event id from the projection.
- Actor: a current member, or the maintainer for custody of a retained team-visible event. Flow F-05. Screen S-06 replaces the S-05 body. The shell stays.
- Input: "New event" opens a create form. "Edit" opens that row's event id only when this actor may change it. Title, location, and description of every visible event stay on the S-05 row. The renderer does not mint an id.
- Cancel and Escape, before a command is sent, return to S-05 and show the stored event only.
- Trace: BR-4, BR-5.

### I-09 Choose visibility

- Intent: require an explicit visibility on create.
- Actor: the member creating an event. Screen S-06.
- Input: C-05, "Team" or "Only you". Neither option is preselected. Arrow keys move inside the group. The group does not submit.
- Before send: Save without a selected option does not send `createEvent`. C-08 shows the validation sentence "Choose Team or Only you." This sentence is not a domain code. The domain is not called.
- Creator edit shows the stored choice. Omitting a change keeps that stored visibility. Custody edit does not render the choice and cannot send a different visibility.
- Trace: BR-4, AC-012, AC-020, AC-048.

### I-10 Save one event

- Intent: create or modify one event.
- Actor: the owner who is a current member, or the maintainer during custody. Screen S-06.
- Input: title, location, description, and a clock only when that clock was edited or when it supplies the occurrence just requested. Outer trim applies to title, location, and description. An internal newline in the description is kept. An empty location or description may be saved. A clock whose end is already past may be saved. The command sends no zone and no renderer-created id. Custody does not send a visibility change; a title sent with a different visibility is not offered.
- Clock entry: one line, `YYYY-MM-DD HH:mm`, in the projection zone. A matching line becomes `{ year, month, day, hour, minute }`. Text that does not match is not sent, and C-08 shows `invalid-local-time` with that field name. A matching line may still return `invalid-local-time`, `nonexistent-local-time`, or `ambiguous-local-time`. The event-row labels stay the formatted instants from the projection. They do not reuse this entry pattern.
- Before send: a title that is empty after trim does not need a local second rule beyond the result. The save is sent and `empty-title` comes back, unless the visibility check in I-09 already stopped a create. End-before-start is `end-not-after-start` from the command.
- Result: success returns to S-05 with the stored event. `empty-title`, `end-not-after-start`, `nonexistent-local-time`, `invalid-local-time`, and `event-not-found` stay on S-06 when the projection is unchanged. `not-allowed`, `generation-mismatch`, and `dissolved` stay on S-06 only when the latest projection still allows this edit; otherwise the code is shown on the surface that projection selects. `ambiguous-local-time` stays on S-06 and opens I-11 for the returned field. The unsent edit remains only while S-06 remains.
- The form does not offer recurring or all-day. Those codes are not given a control.
- Trace: BR-4, BR-5, AC-012, AC-013, AC-014, AC-020, AC-021, AC-029, AC-037, AC-043, AC-044, AC-048, AC-051. AC-028 continues in I-11.

### I-11 Ambiguous local time

- Intent: collect `earlier` or `later` for the one field the command just reported.
- Actor: the same S-06 editor. This is a state of S-06, not a new surface.
- Input: C-05 under that field. Nothing is preselected. Each option shows the returned instant for that choice, in the projection zone, using that instant's offset. If both clocks are ambiguous, the command reports start first. The end choice appears only after a later submit still needs it.
- The page does not write when the choice appears. The next Save sends the occurrence for the reported field. Dismissing the choice, Cancel, or Escape before that submit returns to S-05 and writes nothing.
- Trace: AC-028, AC-046. AC-046 also covers Cancel and a failed save, which leave viewers on the stored event.

### I-12 Delete one event

- Intent: delete the open event.
- Actor: the owner who is a current member, or the maintainer during custody. Screen S-06.
- Input: `deleteEvent` for the open id. The control is absent on create and absent when the actor may not delete.
- Result: the first press opens I-15 and does not send. The confirming press sends `deleteEvent`. Success returns to S-05 without that event. `not-allowed` or `event-not-found` stays on S-06 when the projection is unchanged.
- Trace: BR-4, BR-5, AC-037, AC-047, AC-049. Edit and Delete render only on an event this actor may change. A command that still returns `not-allowed` writes nothing.

### I-13 Record unreadable

- Intent: stop the team UI without creating a replacement team.
- Actor: operator of the owning process. Flow F-09. Screen S-07.
- Input: none. No repair and no create control.
- Result: C-08 shows `record-unreadable`. The surface stays.
- Trace: BR-7.

### I-14 Writer already exists

- Intent: tell the operator that this process already owns the record.
- Actor: the existing window after `second-instance`. Flow F-09. Screen S-08.
- Input: none. The owning process focuses the existing window and shows C-09. Dismiss or Escape removes C-09 and writes nothing.
- The process that does not get the lock exits and has no page.
- Trace: BR-7.

### I-15 Confirm remove, delete, or dissolve

- Intent: require one explicit confirmation before `removeMember`, `deleteEvent`, or `dissolve`.
- Actor: the same actor who can already see that danger button. Remove and Dissolve are on S-05. Delete is on S-06.
- The user closed Q-04 on 2026-11-20 by choosing a confirmation step. The PRD still does not treat confirmation as an authorization rule. A rejected command still leaves the record unchanged.
- First press: the command is not sent. The danger button is replaced, in the same place, by the question "Remove {email}?", "Delete {title}?", or "Dissolve this team?", then a danger button with the same verb and a quiet Cancel. No dialog, overlay, or new destination is added.
- Focus moves to Cancel. Enter and Space on the danger button send. Enter on Cancel does not send.
- Cancel, or Escape before the command is sent, restores the original danger button and writes nothing. Opening a different confirmation clears the one already open and writes nothing.
- The pending verb applies only after the confirming press. If the projection removes the action, the confirmation goes away and nothing is sent.
- Trace: BR-3, BR-5, AC-010, AC-011, AC-019, AC-023, AC-047. AC-010 and AC-011 still have no control that can succeed for those actors.

## 3. Permission and loss of access

A control renders only when the current projection allows that actor to attempt it. A pushed projection refreshes S-05, including while another session's command completes. An open S-06 keeps its unsent edit while this session still has access, including when custody ends because the owner is a current member again. Save then returns `not-allowed` and stays on S-06 with that edit. Loss of access replaces S-06 with S-04, or with S-03 when a pending invite for that same email is projected, even if this session's command is still in flight. Dissolution replaces S-06 with S-02. A rejection that arrives after that replacement is shown on the new surface, without the event fields. An ordinary failed save on an unchanged projection stays on S-06 (AC-046). Hidden data is not drawn in order to explain `not-allowed`.

## 4. Coverage

| AC or rule | Interaction |
|---|---|
| AC-001, AC-002, AC-003, AC-050 | I-03 |
| AC-004, AC-005, AC-030, AC-032, AC-034, AC-036 | I-01, I-04 |
| AC-006, AC-007, AC-008, AC-009, AC-033 | I-07 |
| AC-010, AC-011, AC-038, AC-039 | I-07. Those actors have no control that can succeed. |
| AC-012, AC-013, AC-014, AC-021, AC-029, AC-043, AC-044, AC-048 | I-09, I-10 |
| AC-015 | I-04 and I-05. S-03 and S-04 have no event create. |
| AC-016, AC-017, AC-018, AC-040, AC-042, AC-045 | I-06 |
| AC-019, AC-023, AC-041 | I-07 |
| AC-020 | I-09. Custody does not offer a visibility change. |
| AC-022, AC-049 | I-04, then I-10 or I-12 by the returned owner. Custody controls are absent once that owner is a current member. |
| AC-024, AC-025, AC-026, AC-031, AC-035 | A pushed projection refreshes S-05. S-06 keeps an unsent edit only while this session still has access. Loss of access or dissolution replaces S-06. A command that does not complete leaves the previous record. |
| AC-027 | No reminder interaction. |
| AC-028, AC-046 | I-11 and Cancel on I-08. |
| AC-037, AC-047 | I-12, then I-15 before delete is sent |
| Remove, delete, dissolve confirmation | I-15. User decision on 2026-11-20. Not a new surface. |
| AC-051 | I-10. The form has no recurring or all-day control. |
| BR-7 | I-13, I-14 |
