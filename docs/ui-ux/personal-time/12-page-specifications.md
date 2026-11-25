# Page Specifications: Personal Time

- Stage: 4 — Wireframes and Page Specifications
- Date: 2026-11-25
- Status: Accepted by the user on 2026-11-25 with `04-wireframes.md`. These pages compose the approved components. This acceptance does not approve the Stage 5 painting and does not authorize application code.
- Sketches: `04-wireframes.md`.
- Tokens: semantic and component tokens only. No new raw values.
- Q-02, Q-03, and Q-04 stay open.
- This file does not replace `docs/ui-ux/12-page-specifications.md`.
- No independent UI/UX review was run.

Shared behavior: the column is one stack. A narrower viewport scrolls that stack. PT-C09 is on the page that sent the command and is not its own destination. A rejected command leaves stored rows unchanged and keeps the typed values. The page renders the returned body and does not recompute an instant, an overlap, a monthly preview, or a proof outcome. Shared failures use the same result string and the same result component. No page explains which value was taken or whether an account exists or is verified.

## S-01 Register

- Actor and entry: a person with no session. Path `/register`. Flow F-01.
- Goal: submit the registration, or leave it unsent.
- Components: PT-C01, PT-C03 for username, email, password, and nickname, PT-C02 primary Register, PT-C02 quiet links, PT-C09.
- Layout: the S-01 sketch. Password is obscured. Nickname has no required mark.
- The timezone is not a field. The command sends the browser IANA name with the other entered values.
- Result: `ok` leaves the person here, without a Calendar. `registration_rejected`, `send_failed`, `operation_failed`, and `save_rejected` stay here.
- Keyboard: Username, Email, Password, Nickname, Register, then the unsigned links. Enter from a field activates Register.
- Trace: BR-P3, BR-P4, BR-P11. AC-P01, AC-P02, AC-P17, AC-P33, AC-P39.

## S-02 Verify

- Actor and entry: a person with the verification proof. Path `/verify`. No session. Flow F-02.
- Components: PT-C01, PT-C03 proof, PT-C02 primary Verify, quiet links, PT-C09.
- Result: `ok` opens S-04 and does not open S-07. `verification_rejected` stays here for a mismatched, reused, unknown, or recovery proof.
- Keyboard: Proof, Verify, then the unsigned links.
- Trace: BR-P4. AC-P01.

## S-03 Cancel registration

- Actor and entry: no session. Path `/register/cancel`. Flow F-03.
- Components: PT-C01, PT-C03 email and password, PT-C02 primary Cancel registration, quiet links, PT-C09.
- The page does not draw a control for deleting a verified account.
- Result: `ok` or `cancellation_rejected`. Unknown email, wrong password, and a verified account share that rejection.
- Keyboard: Email, Password, Cancel registration, then the unsigned links.
- Trace: BR-P4. AC-P24.

## S-04 Log in

- Actor and entry: no usable session. Path `/login`. Flow F-04.
- Components: PT-C01, PT-C03 email and password, PT-C02 primary Log in, quiet links, PT-C09.
- Result: `ok` opens S-07. `login_rejected` stays here and matches the S-05 presentation of that string.
- Guarded entry: `/calendar`, `/events/new`, `/events/:id`, and `/account` without a usable session show this page and `logged_out`. They show no Calendar and no Event fields.
- Keyboard: Email, Password, Log in, then the unsigned links.
- Trace: BR-P2, BR-P4. AC-P01, AC-P03, AC-P25, AC-P26, AC-P34.

## S-05 Start recovery

- Actor and entry: a person. Path `/recovery`. Flow F-05.
- Components: PT-C01, PT-C03 email, PT-C02 primary Start recovery, quiet links, PT-C09.
- Result: `login_rejected` when mail can be sent, `send_failed` when it cannot, or `operation_failed`. The page does not say that a proof was sent.
- Keyboard: Email, Start recovery, then the unsigned links.
- Trace: BR-P4. AC-P26, AC-P39.

## S-06 Complete recovery

- Actor and entry: a person with a recovery proof. Path `/recovery/complete`. Flow F-05.
- Components: PT-C01, PT-C03 email, new password, and proof, PT-C02 primary Complete recovery, quiet links, PT-C09.
- The page sends no session cookie and draws no control that opens S-07 on `ok`.
- Result: `ok` opens S-04, replaces the password, and ends open sessions. It does not open S-07. `recovery_rejected` changes nothing.
- Keyboard: Email, New password, Proof, Complete recovery, then the unsigned links.
- Trace: BR-P4. AC-P26.

## S-07 Own Calendar

- Actor and entry: the verified owner, after login or a return from S-08 or S-09. Path `/calendar`. Flows F-06 and F-09.
- Components: PT-C01, PT-C04 From and To, PT-C02 primary Show range, PT-C07 marks, PT-C08 rows, PT-C06 inside a `choice_required` row, PT-C02 quiet New event, Account, Event, Series, This occurrence, and Submit choice, PT-C09.
- Layout: the S-07 sketch. From and To start empty. Q-04 is not closed by a default range. Show range does not send until both dates are present.
- Rows render the returned occurrence. `scheduled` shows start and end. `skipped` does not look like a cancelled Event and has no delete control. `choice_required` shows the two returned instants and the returned civil date. That date is not editable. Submit choice does not send until one returned instant is selected, and it sends that instant and that civil date.
- A non-repeating row opens `/events/:id`. A series row can open the series edit or the occurrence state of that same path. This occurrence carries the returned start.
- The display name is the name in the body, including after a nickname change, without another Event save.
- Another account and a logged-out request do not use this sketch.
- Keyboard: From, To, Show range, then each row's contents and actions in visual order, then New event and Account.
- Trace: BR-P1, BR-P2, BR-P5, BR-P7, BR-P11. AC-P03, AC-P07, AC-P14, AC-P18, AC-P27, AC-P34, AC-P36, AC-P38.

## S-08 Event

- Actor and entry: the owner. `/events/new` or `/events/:id` from S-07. Flows F-07 and F-08.
- Components: PT-C01, PT-C03 title, location, and description, PT-C05 start and end, PT-C06 visibility and, on create, repetition, PT-C02 Save, quiet Cancel, Calendar, Account, and Series, quiet delete controls, PT-C10, PT-C08 conflict rows, PT-C09. On create, Save is quiet until one repetition kind is selected and then uses the primary face. On edit and on one occurrence, Save is primary.
- Create sends title, start, end, location, description, visibility, and one repetition kind. Start and end are the typed civil date and clock. Private starts selected. No repetition kind starts selected, and Save does not send until one is selected. The non-repeating option sends `none`. Empty location and description may be sent.
- Edit shows the stored values and the stored kind as meta text. The kind is not a control and is not sent as a change.
- The occurrence state is `/events/:id` with the returned start. Save sends the detach command and the submitted content. It is not a new path.
- Cancel, and Cancel inside PT-C10, send nothing. Delete sends only after PT-C10. One occurrence uses the occurrence-delete command. The Event or series uses the Event-delete command.
- `ok` remains on S-08 and shows the string `ok`. When the body includes them, it also shows conflict rows and `continuesAfterWindow`. Conflict rows show title, start, and end. The continuation sentence is outside those rows and is not danger text. No second success sentence is added. Calendar returns to S-07.
- `save_rejected` stays here. A monthly rejection shows the returned `monthTypes` and `missingDates` and no dates beyond them. An unchosen doubled time draws a choice only from instants included in the returned body.
- Keyboard: fields, visibility, repetition when it is present, Save, Cancel, then a delete control when it is present. Enter from a field activates Save. When PT-C10 is revealed, focus moves to its Delete button, then its Cancel button.
- Trace: BR-P5, BR-P6, BR-P7, BR-P8, BR-P9, BR-P10, BR-P11. AC-P04, AC-P05, AC-P06, AC-P07, AC-P08, AC-P09, AC-P10, AC-P11, AC-P12, AC-P13, AC-P15, AC-P19, AC-P20, AC-P21, AC-P22, AC-P23, AC-P28, AC-P29, AC-P30, AC-P31, AC-P32, AC-P35, AC-P37, AC-P40.

## S-09 Account

- Actor and entry: the owner, from S-07 or S-08. Path `/account`. Flows F-04, F-09, F-10, and F-11.
- Components: PT-C01, PT-C03 nickname and timezone, two PT-C02 primary buttons, quiet Log out, Calendar, and the delete control, PT-C10, PT-C09.
- Nickname and timezone are separate regions. A nickname that is empty after outer trim clears the nickname. The page does not compute the display name. No email field and no session-length control are drawn.
- Log out sends `DELETE /api/sessions/current` for this session only. A committed logout draws S-04 and does not keep account fields.
- Delete account sends nothing until PT-C10. A committed deletion draws S-04 and does not offer a partial delete. A deletion that does not commit stays on S-09.
- Keyboard: Nickname, Save nickname, Timezone, Save timezone, Log out, Delete account, Calendar. Enter activates the primary button of the field that contains focus. PT-C10 uses the same focus move as S-08.
- Trace: BR-P3, BR-P11, BR-P12. AC-P14, AC-P16, AC-P33, AC-P36, AC-P39.

## Criteria with no page of their own

| Criteria | Where it is visible |
|---|---|
| AC-P35 | S-08 shows the body of the save it sent. |
| AC-P26 when a save was unfinished | S-08 shows the prior Event when that save wrote nothing. Recovery itself is S-05 and S-06. |
| AC-L01 through AC-L13 | No page. Later deliveries have no destination. |
