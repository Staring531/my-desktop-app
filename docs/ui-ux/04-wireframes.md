# Wireframes

- Stage: 4 — Wireframes and Page Specifications
- Date: 2026-11-20
- Status: Accepted by the user on 2026-11-20 with the UI/UX design package. These sketches are not high-fidelity pages. This acceptance does not authorize application code.
- Approved inputs: structural baseline S-01 through S-08; Direction L; token baseline and components C-01 through C-09, approved 2026-11-20.
- Page contracts: `12-page-specifications.md`.
- Q-04 was closed by the user on 2026-11-20. Delete, remove, and dissolve confirm on the same surface. No confirmation frame or new destination is drawn.
- The text sketches below are the editable source. No image is the source of truth.

## Shared chrome

Every running window uses C-01. The initial window is the existing 1200 by 800 Electron window. A narrower or shorter window keeps the same vertical stack and scrolls the surface. Rows wrap their actions under the text. Nothing becomes a second column of navigation or a calendar.

```text
+------------------------------------------------------------------+
| Title                         Zone, when known    [Open another] |
|------------------------------------------------------------------|
| C-09 notice, only while S-08 is showing                          |
| Surface for the current projection                               |
| C-08 result, under the control that sent the command             |
+------------------------------------------------------------------+
```

`Open another session` is the shell's quiet button on every surface. It opens a new unbound window and copies neither the email nor unsent fields. Focus order starts at that button, then the surface from top to bottom, except S-01, where the email field is first and this button follows the surface.

S-08 is this notice on the window that already owns the record. The process that fails the lock exits and has no frame. Dismissing the notice writes nothing.

## S-01 Bind

Actor: unbound window. Primary task: enter the email for this session.

```text
Bind this session
Email
[________________________]
[Bind]
Result line
```

Focus: email, Bind. Empty or rejected email stays on this sketch; the result names the rejection and the field keeps the typed value. A successful bind replaces the surface with S-02, S-03, S-04, or S-05. Bind is the only primary button.

## S-02 Create team

Actor: bound email, record absent or dissolved. The command sends no email.

```text
Create the team
This session is {email}
[Create team]
Result line
```

Focus: Create team. Success replaces the surface with S-05. Rejection stays here.

## S-03 This invite

Actor: pending invite, not a current member. No roster, events, or busy/free.

```text
Invitation
{invited email}
[Accept]  [Decline]
Result line
```

Focus: Accept, Decline. Accept is primary. Accept success goes to S-05. Decline success goes to S-04 when no access remains. A failed command stays here.

## S-04 No team access

Actor: bound email that is not a member and has no pending invite, while a team is active.

```text
No team access
{email} cannot see this team.
```

No write button and no create action. A later projection for a pending invite replaces this surface with S-03.

## S-05 Team workspace

Actor: current member. The board is first. Events and the maintainer region follow in the same surface. There is one primary button, New event.

```text
Team
Showing {instant in the projection zone}              [Now]

Members
[■ Busy]  {email}                  [Make maintainer] [Remove]
[□ Free]  {email}

Events
[■ Team]     {title}  {start–end}  {owner email}  [At start] [At end] [Edit]
[□ Only you] {title}  {start–end}  {owner email}  [At start] [At end] [Edit]
[New event]

Pending invites, maintainer only
{email}                                              [Cancel invite]

Invite, maintainer only
Email
[________________________]                           [Invite]

[Dissolve]   sole member only
Result line under the command that was sent
```

`Make maintainer`, `Remove`, invite, cancel, and `Dissolve` render only when the projection allows that actor to attempt them. An ordinary member does not see those controls. `Remove` and `Dissolve` are danger buttons. Their first press does not send. It is replaced in place by `Remove {email}?` or `Dissolve this team?`, the same danger verb, and quiet `Cancel`. Focus moves to `Cancel`. The danger verb sends. `Cancel` restores the original button and writes nothing. The others in that group are quiet.

`At start` and `At end` change only the instant the board is showing. They do not open S-06 and do not write. `Now` returns that instant to the current time. `Edit` opens S-06 only for an event this actor may change. Every visible row shows title, location, and description. Every team-visible row shows the stored owner email. A member with no events still sees the board and `New event`.

A removed owner's retained team-visible event stays in the event list, with that stored email, and that email has no member row. Enter in the invite field activates Invite, not New event. The shell row stays put. The surface below it is the only scrollport. The viewer's own row counts only-self events. Other rows count team-visible events only.

Focus follows the sketch from top to bottom. The shell row stays outside the surface scrollport.

## S-06 One event

Actor: a current member creating or editing an event they may change, or a maintainer editing text, time, or delete on a retained team-visible event. The shell stays. This surface replaces the S-05 body until Save, or until Cancel or Escape before a command is sent. After the command is sent, Cancel and Escape wait for the result.

Create:

```text
New event
Visibility    ( ) Team    ( ) Only you
Title         [________________________]
Location      [________________________]
Description   [                        ]
Start         [________________________]
End           [________________________]
Zone          {projection zone, read-only}
[Save]  [Cancel]
Result line
```

Edit by the creator uses the same fields. Stored clocks begin as text, with quiet `Change start` and `Change end`. A clock becomes C-04 only after that change control is used. Save sends a clock only when it was edited or when it supplies the occurrence just requested.

Custody edit hides the visibility choice and shows the words `Team` as read-only text. Title, location, description, and Delete remain. Start and end begin as text, with the same `Change start` and `Change end` controls as creator edit.

Ambiguous start, or start first when both are ambiguous:

```text
Start occurred twice.
( ) Earlier    {returned instant}
( ) Later      {returned instant}
```

No option is preselected. The end question appears only after a later submit still reports `ambiguous-local-time` for end. Neither question is a new destination. Cancel, Escape, or dismissing the choice returns to S-05 and writes nothing. Delete is a danger button on an existing event the actor may delete, and it is absent on create. Its first press is replaced in place by `Delete {title}?`, danger `Delete`, and quiet `Cancel`. The danger verb sends. `Cancel` restores Delete and writes nothing.

## S-07 Record unreadable

```text
This team record cannot be read.
No replacement team is created.
```

C-08 only. No create button. The shell's `Open another session` remains. The surface stays until a later approved repair exists.

## States covered

| Surface | Variants in these sketches |
|---|---|
| S-01 | Empty, rejected email, bound |
| S-02 | Ready, rejected create |
| S-03 | Pending, failed command, accepted, declined |
| S-04 | No access |
| S-05 | Members and events, no events, maintainer controls, sole-member dissolve, rejected roster action |
| S-06 | Create, edit, custody, invalid or nonexistent time, ambiguous time, canceled |
| S-07 | Unavailable |
| S-08 | Notice over the current surface |

A command in progress changes that command's button label to its pending verb. The sketches do not add a spinner.
