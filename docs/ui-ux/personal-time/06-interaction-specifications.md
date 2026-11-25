# Interaction Specifications: Personal Time

- Stage: 5 — High-Fidelity Visual Design and Interaction Specifications
- Date: 2026-11-25
- Status: Included in the UI package approved by the user on 2026-11-25, together with `05-visual-design.md`. These contracts add no business rule. This approval does not authorize application code. The handoff is `15-handoff.md`.
- Visuals: `05-visual-design.md`. Pages: `12-page-specifications.md`. Sketches: `04-wireframes.md`.
- A command shows its `result` in PT-C09 on the page that sent it. The visible failure wording is the `result` string. The button label stays the same while the command is in flight.
- Q-02, Q-03, and Q-04 stay open.
- This file does not replace `docs/ui-ux/06-interaction-specifications.md`.
- No independent UI/UX review was run.

## 1. Shared command behavior

The page sends one command from a region, then waits. While that command is in flight, the issuing button keeps its label and ignores further click, Enter, and Space. PT-C09 shows `waiting` in secondary text. That word is not an API result. There is no spinner. Cancel and Escape are available only before the command is sent. After it is sent, the page waits for the result.

A rejection leaves stored rows unchanged and leaves the typed values in place. No field border changes on a shared failure. On a page that stays, `ok` is shown as the string `ok` and the page redraws from the returned body. No second success sentence is added. PT-C09 is an alert when it shows a `result`. The word `waiting` is not that alert.

Tab moves in visual order. A focused button activates on Enter and Space. A focused quiet link activates on Enter. Enter in a single-line field activates the primary button of that field's region. Enter in Description inserts a newline and does not activate Save. This is the one refinement of the Stage 4 rule that Enter in every field activates the region primary. A multiline description would otherwise be unable to contain a line break.

Escape closes a revealed PT-C10 and sends nothing, only while that step has no command in flight. Revealing PT-C10 moves focus to its Delete button, then Tab reaches its Cancel button.

Show range and Submit choice use the quiet face and do not send until their required values are present. The required values are both civil dates, or one returned instant. The controls stay visible.

## 2. Interactions

### I-01 Register

- Intent: create an unverified registration, or leave the server unchanged.
- Actor: a person with no session. Flow F-01. Screen S-01.
- Input: username, email, password, optional nickname, and the browser IANA name. The command is `POST /api/registrations`.
- Before send: an empty required field still uses this page's primary button. The server decides `registration_rejected` or `save_rejected`. The page does not invent a field-level reason.
- Result: `ok` stays on S-01, shows the string `ok`, and does not open S-07. `registration_rejected`, `send_failed`, `operation_failed`, and `save_rejected` stay on S-01 and keep the typed values.
- Cancel: leaving the page by a quiet link sends nothing.
- Must not send: a chosen timezone, a proof, or a session.
- Trace: AC-P01, AC-P02, AC-P17, AC-P33, AC-P39.

### I-02 Verify

- Intent: verify the account, or leave the registration unchanged.
- Actor: a person with a verification proof. Flow F-02. Screen S-02.
- Input: the proof code. The command is `POST /api/registrations/verify`.
- Result: `ok` opens S-04 and does not open S-07. `verification_rejected` stays here.
- Must not send: email, password, or a session.
- Trace: AC-P01.

### I-03 Cancel registration

- Intent: remove an unverified registration, or leave it in place.
- Actor: a person with no session. Flow F-03. Screen S-03.
- Input: email and password. The command is `POST /api/registrations/cancel`.
- Result: `ok` or `cancellation_rejected` stays on S-03. The page does not say which of the three rejection cases occurred.
- Must not send: a session, or a verified-account deletion.
- Trace: AC-P24.

### I-04 Log in

- Intent: open this session's Calendar, or remain signed out.
- Actor: a person with no usable session. Flow F-04. Screen S-04.
- Input: email and password. The command is `POST /api/sessions`.
- Result: `ok` opens S-07. `login_rejected` stays on S-04 and uses the same result painting as S-05.
- Must not send: a proof.
- Trace: AC-P01, AC-P25, AC-P34.

### I-05 Start recovery

- Intent: ask the server to start recovery, without learning whether mail was sent.
- Actor: a person. Flow F-05. Screen S-05.
- Input: email. The command is `POST /api/recoveries`.
- Result: `login_rejected`, `send_failed`, or `operation_failed`. The page does not add a sentence that a proof was sent.
- Must not send: a new password or a proof.
- Trace: AC-P26, AC-P39.

### I-06 Complete recovery

- Intent: replace the password and end open sessions, or change nothing.
- Actor: a person with a recovery proof. Flow F-05. Screen S-06.
- Input: email, new password, and proof. The command is `POST /api/recoveries/complete`.
- Result: `ok` opens S-04 and does not open S-07. `recovery_rejected` stays here.
- Must not send: a session cookie. The response does not create one.
- Trace: AC-P26.

### I-07 Show the calendar range

- Intent: show one returned range, or show that no Calendar is available.
- Actor: the verified owner, or a request without a usable session. Flows F-06 and F-04. Screen S-07, or S-04 when logged out.
- Input: the typed `from` and `to`. The command is `GET /api/calendar?from=&to=`.
- Before send: Show range does not send while either date is empty. Q-04 remains open, so the page does not invent the pair.
- Result: the owner body paints the returned occurrences. An empty list paints no rows. `logged_out`, or a body with no Calendar and no Event, paints S-04 and `logged_out`.
- Must not send: a computed instant, an overlap, a preview, a search, a share, a team, or another calendar.
- Trace: AC-P03, AC-P07, AC-P18, AC-P34.

### I-08 Submit a generated choice

- Intent: store one returned instant for one generated doubled start.
- Actor: the owner on a `choice_required` row. Flow F-09. Screen S-07.
- Input: the civil date and one instant from that returned occurrence. The command is `POST /api/events/:id/choices`.
- Before send: neither instant is selected, and Submit choice does not send.
- Result: the page paints the returned body. Another instant is not offered.
- Must not send: a third instant, or an instant computed from the timezone control.
- Trace: AC-P14, AC-P27, AC-P36, AC-P38.

### I-09 Open an Event

- Intent: move to the accepted Event path without writing.
- Actor: the owner on S-07.
- Input: none. New event opens `/events/new`. Event or Series opens `/events/:id`. This occurrence opens the occurrence state of `/events/:id` and carries the returned start.
- Result: no command, so no PT-C09 from this control.
- Must not send: a save, a detach, or a delete.
- Trace: the S-07 to S-08 path accepted on 2026-11-25.

### I-10 Save a new or existing Event

- Intent: commit the Event the person submitted, or leave the stored Event unchanged.
- Actor: the owner. Flow F-07. Screen S-08 create or series edit.
- Input: title, start, end, location, description, and visibility. Start and end are the typed civil date and clock, sent as entered. Create also sends one repetition kind: `none`, `daily`, `weekly`, or `monthly`. The non-repeating option sends `none`. Edit does not send a kind. Save on create does not send until one kind is selected.
- Result: `ok` stays on S-08, shows the string `ok`, and paints `conflicts` and, when true, `continuesAfterWindow`. `save_rejected` stays here. A monthly rejection paints the returned `monthTypes` and `missingDates`. A doubled entered time paints a choice only when the body includes the instants. The next save may include one of those instants.
- Cancel: Cancel returns to S-07 and sends nothing.
- Must not send: a repetition change, a third instant, or a delete.
- Trace: AC-P04, AC-P05, AC-P06, AC-P07, AC-P08, AC-P09, AC-P12, AC-P13, AC-P15, AC-P19, AC-P20, AC-P23, AC-P30, AC-P31, AC-P32, AC-P35, AC-P37, AC-P40.

### I-11 Change one occurrence

- Intent: detach one occurrence with the submitted content, or leave the series unchanged.
- Actor: the owner in the occurrence state. Flow F-08. Screen S-08.
- Input: the returned original start and the submitted content. The command is `POST /api/events/:id/detach`.
- Result: the page paints the returned body. Series switches to the edit state of the same path and sends nothing.
- Must not send: a repetition kind.
- Trace: AC-P10, AC-P11, AC-P21, AC-P22, AC-P28, AC-P29, AC-P31.

### I-12 Confirm a deletion

- Intent: delete one occurrence, one Event, or one series only after the confirming step.
- Actor: the owner on S-08. Flow F-08.
- Before send: the quiet delete control reveals PT-C10 and sends nothing. Cancel inside PT-C10 sends nothing and keeps the stored rows on screen.
- Input: Event delete uses `DELETE /api/events/:id`. Occurrence delete uses `DELETE /api/events/:id/occurrences` and the returned original start.
- Result: a committed deletion returns toward S-07 through the Calendar link after the result is visible. A result that does not commit stays on S-08 and keeps the prior Event on screen. A skipped row never uses this interaction.
- Must not send: a delete before PT-C10, or a command that paints the absence as a cancelled Event.
- Trace: AC-P10, AC-P11, AC-P21, AC-P22, AC-P28, AC-P29.

### I-13 Save nickname

- Intent: store, clear, or keep the nickname.
- Actor: the owner. Flow F-10. Screen S-09.
- Input: the nickname field. The command is `PATCH /api/account`.
- Result: the returned result stays on S-09. S-07 shows the display name from the next Calendar body. This page does not compute that name.
- Must not send: an email change.
- Trace: AC-P33, AC-P39.

### I-14 Save timezone

- Intent: store a new IANA name, or leave the current name in place.
- Actor: the owner. Flow F-09. Screen S-09.
- Input: the typed IANA name. The command is `PATCH /api/account/timezone`.
- Result: `save_rejected` stays on S-09 and writes nothing. A committed change stays on S-09. The page does not recompute clock labels.
- Must not send: a session length.
- Trace: AC-P14, AC-P36.

### I-15 Log out

- Intent: end this session only.
- Actor: the owner. Flow F-04. Screen S-09.
- Input: none beyond the current session. The command is `DELETE /api/sessions/current`.
- Result: a committed logout paints S-04 and does not keep Calendar or Event fields. Another session of the same account is not addressed.
- Must not send: a deletion of the account.
- Trace: AC-P26, AC-P34.

### I-16 Delete the account

- Intent: retire the account after confirmation, or leave it intact.
- Actor: the owner. Flow F-11. Screen S-09.
- Before send: the quiet control reveals PT-C10 and sends nothing. Cancel sends nothing.
- Input: `DELETE /api/account` only from the danger button.
- Result: a committed deletion paints S-04 and does not offer a partial delete. A deletion that does not commit stays on S-09 with the account fields.
- Trace: AC-P16.

### I-17 Guarded destination

- Intent: show that a signed surface is unavailable.
- Actor: a person without a usable session who opens `/calendar`, `/events/new`, `/events/:id`, or `/account`.
- Input: the navigation itself. This interaction sends no Calendar or Event command.
- Result: S-04 and `logged_out`. No Calendar row and no Event field are shown.
- Trace: AC-P03, AC-P34.
