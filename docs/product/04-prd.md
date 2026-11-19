# PRD: Event Management Desktop App

- Status: READY FOR USER REVIEW
- Version: 0.1 draft
- Date: 2026-11-19
- Source: confirmed decisions DEC-001 through DEC-010
- This draft is not approved. A requirements review and a later PRD audit do not approve it.

## 1. Purpose

Version 1 lets a small team see when its members are busy or free. Busy and free time comes from each member's own schedule events.

## 2. MVP boundary

### In this version

- One team at a time, with a persistent email roster.
- One maintainer, succession, invitation, acceptance, removal, rejoin, and sole-member dissolution.
- Create, modify, delete, and view single schedule events.
- Team-visible and only-self visibility.
- A per-member busy/free view, including past single events.

### Out of this version

- Start reminders and invite reminders.
- Recurring events.
- All-day or date-only events.
- Activity registration.
- Incident management.
- Booking a shared meeting as the primary job.
- Shift assignment.
- A second team at the same time.

How a person proves control of an email, and how the team record moves between devices, are outside this behavioral contract.

## 3. Actors

| Actor | Who | What they can do |
|---|---|---|
| Founder | Person who creates the team and supplies their own usable email | Becomes the first maintainer and first member. After succession, has only ordinary-member rights. |
| Member | Email currently on the roster | Creates, views, modifies, and deletes their own events. Views other members' team-visible events and the busy/free board. |
| Maintainer | Exactly one current member | Invites, cancels a pending invite, removes another current member, designates a successor, and, while a former member is removed, edits or deletes that member's retained team-visible events within DEC-005. |
| Invitee | Email with a pending invite | Sees and accepts or declines only that invite. |
| Removed member | Email no longer on the roster | Cannot view the team. May later accept a new invite. |

## 4. Main flows

### 4.1 Create the team

The founder supplies a usable email. That email is stored in lowercase and trimmed form and becomes the first member and the maintainer. No other member can be added before this.

### 4.2 Invite and accept

The maintainer invites one usable email. The invitee sees only that pending invite. Acceptance adds the email to the roster and shows every stored team-visible event. Decline, maintainer cancellation, or dissolution ends the invite. Succession does not end it.

### 4.3 Create and view a schedule event

A current member saves one event under their own stored email. The save chooses team-visible or only-self and supplies a non-empty trimmed title, a start, and a later end. Other current members see a team-visible event in full. An only-self event is visible only to its creator.

### 4.4 Change visibility, modify, or delete

The creator may switch visibility on a successful save. Modify uses the same field rules as create. Delete removes the event. A failed or canceled save leaves the stored event unchanged.

### 4.5 Remove, rejoin, and dissolve

The maintainer removes another current member. That person immediately loses team access. Team-visible events remain attributed to that email. Only-self events are deleted and are not restored. A later acceptance returns edit rights for the retained team-visible events. The sole member may dissolve the team, which clears the roster, deletes all events, and ends the role and pending invites.

## 5. Business rules

### BR-1 Team and roster

- At most one team exists. Creating another while one exists fails. After dissolution, a new team may be created. A person is not on two teams at once. (DEC-001, DEC-004, DEC-005)
- A usable email, after outer trim, has exactly one `@`, at least one non-whitespace character on each side, and no spaces. Any other input cannot create a team or send an invite. (DEC-008)
- The roster and event attribution store the trimmed, fully lowercased email. Comparison trims and ignores case. (DEC-008)

### BR-2 Invitation

- Only the current maintainer may invite or cancel a pending invite. (DEC-004, DEC-008)
- The invited email is not a member and cannot see the roster, events, or busy/free until acceptance. Only that email may accept or decline. The pending address is visible only to that email and the current maintainer. (DEC-008)
- One pending invite exists per email. A second invite fails and the original remains. An invite to a current member, including the maintainer's own email, fails. A removed email may accept a later invite. (DEC-008)
- Accept, decline, or cancel with no matching pending invite fails. An invite, decline, or cancel that does not complete leaves the invites and roster unchanged. A pending invite survives succession and does not expire by time. (DEC-008, DEC-009)

### BR-3 Maintainer

- Exactly one current member is the maintainer. The role transfers only when that maintainer designates a different current member. Transfer is immediate, the designee need not accept, and the previous maintainer remains an ordinary member. Accepting an invite does not transfer the role. (DEC-004)
- The maintainer cannot remove their own roster entry. An ordinary member cannot invite, cancel, remove another member, remove themselves, or remove the maintainer. Those attempts leave the record unchanged. (DEC-004, DEC-005)
- While any member remains, the role cannot be vacant. It ends only when the sole member dissolves the team. Dissolution fails while another member remains, and the roster, events, and invites stay unchanged. (DEC-004, DEC-005)

### BR-4 Events

- Only a current member may create an event, and it is attributed to that member's stored email. Any other create adds nothing. (DEC-008)
- A save requires an explicit choice of team-visible or only-self, a title that still has a character after outer trim, and an end instant after the start. Stored title, location, and description are trimmed. Internal spaces, tabs, and newlines remain. A location or description that is empty after trim is stored empty, and the event can still be saved. Modify uses these same rules. (DEC-003, DEC-006)
- Entered clock times become absolute instants in the saving person's device-local timezone at that save. This includes a maintainer editing a removed member's event. An unchanged start or end keeps its stored instant. A local time that does not exist cannot be saved. A local time that occurs twice must be chosen. Displayed clock time uses each viewer's current device-local timezone. (DEC-006)
- The creator sees both visibilities and may switch either way on a successful save. Other current members see team-visible title, time, location, and description, including events created before they joined and events that have ended. An only-self event is visible only to its creator. (DEC-003, DEC-007)
- Any overlap among one member's own events may be saved. Past single intervals may be saved. There is no recurrence and no all-day event. (DEC-006, DEC-007)
- Only the creator may modify or delete an event, except BR-5. A failed or canceled save does not change the stored event and is not shown to viewers. (DEC-003, DEC-009)

### BR-5 Removal and dissolution

- Removal immediately removes that email's team access. Retained team-visible events stay team-visible and attributed to that email. The maintainer may change their title, time, location, and description, or delete them, but may not change visibility. A save that includes a change to only-self writes nothing. Only-self events of the removed email are deleted and version 1 does not restore them. (DEC-005)
- Rejoin returns edit and delete rights for retained team-visible events to that member. The maintainer can no longer modify them. (DEC-005)
- Busy rows list current members only. Retained events of a removed owner remain visible and attributed to that email. (DEC-005, DEC-007)
- Sole-member dissolution clears the roster, deletes all events, ends the maintainer role and pending invites, and version 1 does not restore them. (DEC-005)

### BR-6 Busy/free

- At instant T, a member's own row is busy when any of that member's team-visible or only-self events satisfies start ≤ T < end. (DEC-006, DEC-007)
- Other members judge that person using only team-visible events. No covering team-visible event means they see that person as free. Every covering team-visible event is shown with its owner and full content. An ended event does not make the current instant busy. (DEC-007)

### BR-7 Record behavior

- A completed save, delete, removal, succession, dissolution, or acceptance is in the team record at completion. Members who are viewing then see the new result. Members who are not viewing see the latest record on their next view. Other members do not need to be online. Version 1 sends no reminders. (DEC-009)
- If delete, removal, succession, dissolution, or acceptance does not complete, the prior record remains. There is no partial result. (DEC-009)
- The first completed write wins. The later operation is checked against the record at its write. If the person is already removed, that person cannot change their events. If an event was already changed to only-self, a later removal deletes it. After rejoin, the maintainer cannot modify that event. If the event is already deleted or the team is already dissolved, a later save, modify, or delete does not write and does not recreate the event or the team. (DEC-009)

## 6. States

| Object | States | Transitions |
|---|---|---|
| Team | Absent; active; dissolved | Create makes it active. Sole-member dissolution makes it dissolved and unrestorable in version 1. A later create makes a new active team. |
| Maintainer role | Occupied by one current member; ended | Designation moves it immediately. Dissolution ends it. It is not vacant while a member remains. |
| Email membership | Absent; invited; member; removed | Invite creates invited. Accept creates member. Decline, cancel, or dissolution leaves or returns the email to absent. Removal creates removed. A later acceptance creates member again. |
| Event visibility | Team-visible; only-self | The creator may switch either way on a successful save. Removal deletes only-self events. A retained team-visible event cannot be switched to only-self by the maintainer. |
| Event time | Absolute start inclusive, end exclusive | A save replaces only the instants whose clock times were entered. |

## 7. Acceptance criteria

| ID | Rule | Criterion |
|---|---|---|
| AC-001 | BR-1 | Given no team, when a person supplies `Sam@Team.com`, then the roster stores `sam@team.com` as the only member and the maintainer. |
| AC-002 | BR-1 | Given an active team, when anyone creates another team, then the attempt fails and the existing roster and events remain. |
| AC-003 | BR-1 | Given input `sam @team.com` or a blank address, when it is used to create a team or invite, then the attempt fails. |
| AC-004 | BR-2 | Given a pending invite for `sam@team.com`, when that email opens the app before acceptance, then it sees the invite and does not see the roster, events, or busy/free. |
| AC-005 | BR-2 | Given that pending invite, when another member accepts or declines it, then the invite and roster remain unchanged. |
| AC-006 | BR-2 | Given `sam@team.com` is a current member, when the maintainer invites `Sam@Team.com`, then no pending invite is created. |
| AC-007 | BR-2 | Given one pending invite for an email, when the maintainer invites that email again, then the original invite remains and no second invite is created. |
| AC-008 | BR-2 | Given a pending invite, when the maintainer designates a successor, then that invite still accepts the email onto the roster. |
| AC-009 | BR-3 | Given two members, when the maintainer designates the other member, then that member is the only maintainer immediately and the previous maintainer remains a member without invite or removal rights. |
| AC-010 | BR-3 | Given two or more members, when the maintainer removes their own email, then the roster and role remain unchanged. |
| AC-011 | BR-3 | Given two or more members, when anyone dissolves the team, then the roster, events, and invites remain unchanged. |
| AC-012 | BR-4 | Given a current member, when they save a team-visible event titled `  HQ  `, location `   `, from 09:00 to 10:00 in their device zone, then the stored title is `HQ`, the location is empty, and the end is after the start as absolute instants. |
| AC-013 | BR-4 | Given a title that is empty after trim, or an end that is not after the start, when a member saves, then no event is written. |
| AC-014 | BR-4 | Given the saving device is in America/New_York, when the saver enters 02:30 on 2026-03-08, then the save fails and no event is written. |
| AC-015 | BR-4 | Given a pending invitee or a removed email, when that email creates an event, then the team record is unchanged. |
| AC-016 | BR-6 | Given Member A has one team-visible event from absolute start S to end E, when Member B views S, then B sees A busy. When B views E, B sees A free for that event. The clock labels B sees are B's current device-local zone for S and E. |
| AC-017 | BR-6 | Given Member A has a team-visible event covering absolute instant T and an only-self event also covering T, when A and Member B view T, then A's own row is busy, B does not see the only-self event, and B sees A busy only because of the team-visible event. |
| AC-018 | BR-4 | Given an ended team-visible event, when a current member views the record, then the event remains visible with its owner and full content, and it does not make the current instant busy. |
| AC-019 | BR-5 | Given Member A is removed, when the removal completes, then A cannot view the team, A's only-self events are gone, and A's team-visible events remain visible and team-visible. |
| AC-020 | BR-5 | Given that retained event, when the maintainer saves a new title together with only-self visibility, then the title and visibility remain unchanged. |
| AC-021 | BR-5 | Given a retained team-visible event titled Doctor, when the maintainer saves the title `  Clinic  ` and does not change visibility, then the stored title is `Clinic` and the visibility remains team-visible. |
| AC-022 | BR-5 | Given A later accepts a new invite, when acceptance completes, then A can modify the retained team-visible event and the maintainer cannot. The deleted only-self events are still absent. |
| AC-023 | BR-5 | Given the founder is the only member, when the founder dissolves the team, then the roster is empty, every event and pending invite is gone, and version 1 does not restore them. |
| AC-024 | BR-7 | Given a member is viewing A's busy interval, when A deletes that team-visible event and deletion completes, then the viewing member then sees the interval clear. A member who is not viewing sees the deletion on the next view. |
| AC-025 | BR-7 | Given dissolution completes before a member's in-flight save, when that save is written, then it does not recreate the team or the event. |
| AC-026 | BR-7 | Given Member A saves a team-visible event as only-self and that save completes before the maintainer's removal of A, when removal completes, then that event is deleted. |
| AC-027 | MVP out | Given any saved event and any pending invite, when the start instant arrives or the invite is created, then version 1 sends no start reminder and no invite reminder. |
| AC-028 | BR-4 | Given the saving device is in America/New_York, when the saver enters 01:30 on 2026-11-01 and does not choose which occurrence, then the save fails and no event is written. |
| AC-029 | BR-5 | Given a retained event whose end clock time is edited, when the maintainer saves that new clock time and does not change the start, then the end converts in the maintainer's device-local zone at that save and the stored start instant is unchanged. |
| AC-030 | BR-2 | Given a pending invite, when the invited email accepts, then the email becomes a member and the maintainer role does not change. |
| AC-031 | BR-7 | Given the maintainer removes Member A before A's visibility save completes, when that later save is written, then it does not change A's retained team-visible event. |
| AC-032 | BR-2 | Given a pending invite, when the invited email declines, then the invite ends and the email is not added to the roster. |
| AC-033 | BR-2 | Given a pending invite, when the maintainer cancels it, then the invite ends and the roster is unchanged. |
| AC-034 | BR-2 | Given no matching pending invite, when an email accepts or declines, or the maintainer cancels, then the invites and roster remain unchanged. |
| AC-035 | BR-2 | Given an invite, decline, or cancel that does not complete, when the operation stops, then the pending invites and roster remain as they were. |
| AC-036 | BR-4 | Given team-visible events created before an email joins, including one that has ended, when that email accepts, then the new member sees each of those events in full. |
| AC-037 | BR-4 | Given Member A's event, when Member B attempts to modify or delete it, then the stored event is unchanged. |
| AC-038 | BR-3 | Given an ordinary member, when that member invites, cancels an invite, removes another member, or removes their own email, then the record is unchanged. |
| AC-039 | BR-3 | Given the current maintainer, when that maintainer designates their own email as successor, then the role and roster remain unchanged. |
| AC-040 | BR-6 | Given the roster contains Member A with no events and Member B, when a current member views busy/free, then both A and B are listed and A is free. |
| AC-041 | BR-5 | Given Member A has a team-visible event and is removed, when removal completes, then A's busy row is gone and the event remains visible, attributed to A's stored email. |
| AC-042 | BR-6 | Given one team-visible event stored as absolute instants, when two members whose devices are in different zones view the same instant, then they agree whether the owner is busy, and each sees clock labels in their own current device-local zone. |
| AC-043 | BR-4 | Given a description with an internal newline, when the event is saved, then the stored description keeps that newline. |
| AC-044 | BR-4 | Given a current member, when they save one team-visible event whose end is already past, then the event is stored and remains visible. |
| AC-045 | BR-6 | Given one member has two overlapping team-visible events, when a teammate views an instant covered by both, then both events are shown and the member is busy. |
| AC-046 | BR-4 | Given a stored event, when its creator cancels an edit or a save fails, then viewers still see the stored event and not the unsent edit. |
| AC-047 | BR-5 | Given a retained team-visible event, when the maintainer deletes it, then it is no longer visible. |
| AC-048 | BR-5 | Given a retained team-visible event, when the maintainer saves a new location and description without changing visibility, then those stored fields change and the visibility stays team-visible. |
| AC-049 | BR-5 | Given a removed member rejoins, when acceptance completes, then that member can delete a retained team-visible event and the only-self events deleted at removal are still absent. |
| AC-050 | BR-1 | Given a dissolved team, when a person creates a team with a usable email, then a new team exists with that email as its first member and maintainer. |
| AC-051 | MVP out | Given a current member, when they try to save a recurring event or an all-day event, then no event is written. |

## 8. Traceability

| Goal or flow | Rules | Acceptance criteria |
|---|---|---|
| See busy/free | BR-4, BR-6 | AC-016, AC-017, AC-018, AC-040, AC-042, AC-045 |
| Join the team | BR-1, BR-2, BR-4 | AC-001, AC-003, AC-004, AC-005, AC-006, AC-007, AC-008, AC-030, AC-032, AC-033, AC-034, AC-035, AC-036 |
| Keep one maintainer | BR-3 | AC-009, AC-010, AC-011, AC-038, AC-039 |
| Save an event | BR-4 | AC-012, AC-013, AC-014, AC-015, AC-028, AC-037, AC-043, AC-044, AC-046, AC-051 |
| Remove and return | BR-5 | AC-019, AC-020, AC-021, AC-022, AC-029, AC-041, AC-047, AC-048, AC-049 |
| End the team | BR-1, BR-3, BR-5, BR-7 | AC-002, AC-011, AC-023, AC-025, AC-050 |
| Conflicting writes | BR-7 | AC-024, AC-025, AC-026, AC-031 |
| No reminders | MVP out, BR-7 | AC-027 |

## 9. Open questions

None. Items outside section 2 are out of this version rather than unresolved behavior inside it.

## 10. Approval

This PRD is READY FOR USER REVIEW. Neither the requirements review nor a PRD quality audit approves it. Only an explicit user approval can approve it.
