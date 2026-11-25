# Wireframes: Personal Time

- Stage: 4 — Wireframes and Page Specifications
- Date: 2026-11-25
- Status: Accepted by the user on 2026-11-25. These sketches are the low-fidelity structure. This acceptance does not approve the Stage 5 painting and does not authorize application code.
- Why this stage is low-fidelity: `UI_UX_DESIGN.md` Stage 4 settles regions, hierarchy, controls, focus, and states. Stage 5 then applies the approved tokens and components to every state. The user started Stage 4 on 2026-11-25 and asked why this stage is not high-fidelity. That question does not change this stage.
- Approved inputs: S-01 through S-09 and the paths in `01-information-architecture.md`; flows in `02-user-flows.md`; Direction L; tokens and PT-C01 through PT-C10, approved 2026-11-25.
- Page contracts: `12-page-specifications.md`.
- Q-02, Q-03, and Q-04 stay open. No sketch names a product title, draws the mail message, or fills the first `from` and `to`.
- The text sketches are the editable source. No image is the source of truth.
- This file does not replace `docs/ui-ux/04-wireframes.md`.
- No independent UI/UX review was run.

## Shared page

Every surface uses PT-C01. The task column is `component.page.content-max` inside `component.page.inset`. A narrower viewport keeps this same vertical stack and scrolls. Row actions move under the row text. Nothing becomes a navigation rail, a second column, a month grid, or a theme control.

```text
+--------------------------------------------------+
| Task title                                       |
| Quiet links to the other accepted destinations   |
|--------------------------------------------------|
| Command region                                   |
| PT-C09 result of the last command on this page   |
+--------------------------------------------------+
```

The task title is the surface name from the accepted inventory. The scaffold title is not drawn. Unsigned surfaces link to the other unsigned surfaces. Signed surfaces use the links in each sketch below.

Focus starts at the first field or, when a surface has no field, at its primary button. Tab follows the visual order. Enter in a field activates the primary button of that field's region. Escape closes a revealed PT-C10 and sends nothing, only while that step has no command in flight.

## S-01 Register

Actor: no session. Path: `/register`. Flow F-01.

```text
Register
Verify    Cancel registration    Log in
Start recovery    Complete recovery

Username
[________________________]
Email
[________________________]
Password
[________________________]
Nickname
[________________________]
[Register]
Result line
```

No timezone field is drawn. The command still sends the browser IANA name. Focus: Username, Email, Password, Nickname, Register, then the quiet links. `ok` stays on this sketch and does not open the Calendar. `registration_rejected`, `send_failed`, `operation_failed`, and `save_rejected` stay here. The typed values remain. The result does not say which value was taken.

## S-02 Verify

Actor: person with a verification proof. No session. Path: `/verify`. Flow F-02.

```text
Verify
Register    Cancel registration    Log in
Start recovery    Complete recovery

Proof
[________________________]
[Verify]
Result line
```

Focus: Proof, Verify, then the quiet links. `ok` leaves this sketch for S-04 and does not open S-07. `verification_rejected` stays here. While the command is in flight, the result line shows `waiting`.

## S-03 Cancel registration

Actor: no session. Path: `/register/cancel`. Flow F-03.

```text
Cancel registration
Register    Verify    Log in
Start recovery    Complete recovery

Email
[________________________]
Password
[________________________]
[Cancel registration]
Result line
```

Focus: Email, Password, Cancel registration, then the quiet links. `ok` and `cancellation_rejected` stay on this sketch. No verified-account deletion is drawn.

## S-04 Log in

Actor: no usable session. Path: `/login`. Flow F-04. This same sketch is the guarded-destination state.

```text
Log in
Register    Verify    Cancel registration
Start recovery    Complete recovery

Email
[________________________]
Password
[________________________]
[Log in]
Result line
```

Focus: Email, Password, Log in, then the quiet links. `ok` leaves this sketch for S-07. `login_rejected` stays here. The result line is the same component used on S-05 for that same string.

Opening `/calendar`, `/events/new`, `/events/:id`, or `/account` without a usable session draws this sketch and the result `logged_out`. It does not draw Calendar rows or Event fields. This stage adds no second logged-out destination.

## S-05 Start recovery

Actor: a person. Path: `/recovery`. Flow F-05.

```text
Start recovery
Register    Verify    Cancel registration
Log in    Complete recovery

Email
[________________________]
[Start recovery]
Result line
```

Focus: Email, Start recovery, then the quiet links. The result is `login_rejected` or `send_failed` or `operation_failed`. The `login_rejected` line matches S-04. The sketch has no sentence that a proof was sent.

## S-06 Complete recovery

Actor: a person with a recovery proof. Path: `/recovery/complete`. Flow F-05.

```text
Complete recovery
Register    Verify    Cancel registration
Log in    Start recovery

Email
[________________________]
New password
[________________________]
Proof
[________________________]
[Complete recovery]
Result line
```

Focus: Email, New password, Proof, Complete recovery, then the quiet links. `ok` leaves this sketch for S-04 and does not open S-07. `recovery_rejected` stays here. No session control is drawn. While the command is in flight, the result line shows `waiting`.

## S-07 Own Calendar

Actor: the verified owner in this session. Path: `/calendar`. Flows F-06 and F-09.

```text
Calendar
New event    Account

From
[________________________]
To
[________________________]
[Show range]
Display name from the body

scheduled row
(o) private    scheduled
Title
start    end
location
description
display name
[Event]

series occurrence row
(o) public    scheduled
Title
start    end
[Series]    [This occurrence]

skipped row
- skipped
Title
display name

choice row
.. choice_required
Title
Civil date from the body, not editable
( ) first returned instant
( ) second returned instant
[Submit choice]

Result line
```

`From` and `To` are empty. Q-04 stays open, so the sketch draws no initial dates and no rows until a range returns. Show range does not send while either date is empty. Focus: From, To, Show range, then the rows from top to bottom, then New event and Account.

A `scheduled` row shows start and end only for that state. Its Event control opens `/events/:id`. A series row adds This occurrence, which opens the occurrence state of that same path and carries the returned start. A skipped row has no cancelled mark and no delete control. A choice row lists only the two returned instants, with neither selected. Submit choice stays quiet and does not send until one of those instants is selected. The civil date shown is the date from that returned occurrence.

`logged_out`, and a body with no Calendar and no Event, uses the S-04 sketch instead of this one.

## S-08 Event

Actor: the owner. Paths: `/events/new` and `/events/:id`. Flows F-07 and F-08. One occurrence is a state of this destination.

Create:

```text
Event
Calendar    Account

Title
[________________________]
Start
[________________________]
End
[________________________]
Location
[________________________]
Description
[                        ]
(selected) private
( ) public
( ) non-repeating
( ) daily
( ) weekly
( ) monthly
[Save]    [Cancel]
Result line
```

Edit of a stored Event or series:

```text
Event
Calendar    Account

Title, Start, End, Location, Description
as entered fields showing the stored values
(selected visibility)
Stored kind, as meta text, with no repetition control
[Save]    [Cancel]
[Delete]
Result line
```

One occurrence:

```text
Event
Calendar    Account

This occurrence
returned start, as meta text
Title, Start, End, Location, Description
Visibility choice showing the stored value
[Save]    [Cancel]
[Delete this occurrence]
[Series]
Result line
```

Focus follows the fields, then the choice groups, then Save, Cancel, and a delete control when that control exists. On create, no repetition option is selected. Private is selected. Save stays quiet and does not send until one repetition option is selected. The non-repeating option sends `none`. Cancel returns to S-07 and sends nothing. Start and End are a civil date and a clock, typed together. Save on an existing Event does not send a kind. Save on one occurrence sends the detach command with the returned original start. Series returns to the edit sketch on `/events/:id` and sends nothing by itself.

A delete control reveals PT-C10 in the stack. It does not open another destination.

```text
Delete this event
The stored event stays until the confirming command.
[Delete]    [Cancel]
```

The occurrence state uses the same region with the words for that occurrence. Cancel inside the region sends nothing and closes the region. Delete sends the matching delete command. A result that does not commit stays on S-08 and keeps the prior values.

`ok` stays on S-08 long enough to show the returned body. Conflict rows, when the body has them, sit in the result region and contain title, start, and end. An empty list draws no conflict row. When `continuesAfterWindow` is true, one secondary sentence sits outside those rows: the repetition continues after 90 days. The quiet Calendar link is the return to S-07. `save_rejected` stays here. When the body includes `monthTypes` and `missingDates`, those returned values are text under the result string. A doubled entered time draws PT-C06 only for instants present in the returned body. The sketch does not invent a third instant and does not label the named New York times itself.

## S-09 Account

Actor: the owner. Path: `/account`. Flows F-04, F-09, F-10, and F-11.

```text
Account
Calendar

Nickname
[________________________]
[Save nickname]

Timezone
[________________________]
[Save timezone]

Result line
[Log out]
[Delete account]
```

Focus: Nickname, Save nickname, Timezone, Save timezone, Log out, Delete account, Calendar. Enter in Nickname activates Save nickname. Enter in Timezone activates Save timezone. No email field is drawn.

Delete account uses the same PT-C10 pattern as S-08:

```text
Delete this account
The account stays until the confirming command.
[Delete]    [Cancel]
```

A nickname or timezone result stays on this sketch. The Calendar link returns to S-07. A committed logout or a committed account deletion leaves this sketch and draws S-04, with no added success sentence. A deletion that does not commit stays here and keeps the account fields.
