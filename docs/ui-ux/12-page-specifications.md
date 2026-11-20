# Page Specifications

- Stage: 4 — Wireframes and Page Specifications
- Date: 2026-11-20
- Status: Accepted by the user on 2026-11-20 with the UI/UX design package. These pages compose approved components. High-fidelity treatment is in `05-visual-design.md`. Interactions are in `06-interaction-specifications.md`. This acceptance does not authorize application code.
- Sketches: `04-wireframes.md`.
- Tokens: semantic and component tokens only. No new raw values.
- Q-04 was closed by the user on 2026-11-20. Remove, delete, and dissolve confirm in place. No page adds a confirmation destination.

Shared behavior: one window is one session. C-08 appears on the surface that sent the command and does not become its own page. Another open session receives a new projection only after a command completes. A rejected command leaves the stored record unchanged. The zone text is the one zone in the projection. The operator cannot edit it.

## S-01 Bind this session

- Actor and entry: unbound window, including a window opened by `Open another session`. Flow F-01.
- Goal: store an email for this session, or remain unbound.
- Components: C-01, C-03 email, C-02 primary Bind, C-08.
- Layout: title, field, primary button, result. Density follows the compact row height.
- Validation: an empty, unusable, or disallowed email does not bind. The field keeps the typed value. C-08 names the rejection.
- Exit: success selects S-02, S-03, S-04, or S-05 from the projection.
- Keyboard: email, then Bind. Enter from the field activates Bind.
- Trace: TD-002. Binding writes no team record.

## S-02 Create the team

- Actor: bound email while the record is absent or dissolved. Flow F-02.
- Components: C-01, read-only session email in body text, C-02 primary Create team, C-08.
- The page has no email field. Create uses the bound email.
- Exit: success shows S-05 for that founder. Rejection stays on S-02.
- Trace: BR-1, AC-001, AC-002, AC-003, AC-050. AC-002 is not this page; that attempt happens when the record is already active.

## S-03 This invite

- Actor: email with a pending invite, not a current member. Flow F-03.
- Components: C-01, body text for the invited email, C-02 primary Accept, C-02 quiet Decline, C-08.
- The page shows neither the roster, nor events, nor busy/free, nor any other invite.
- Exit: accept shows S-05, including team-visible events that already ended or were created before the join. Decline shows S-04 when no access remains. Failure stays on S-03.
- Trace: BR-2, AC-004, AC-005, AC-030, AC-032, AC-034, AC-036.

## S-04 No team access

- Actor: bound email with neither membership nor a pending invite, while the team is active. Flows F-01 and F-07.
- Components: C-01 and C-08. No primary button.
- The page does not offer create, invite, events, or busy/free.
- Exit: a later projection that contains a pending invite for this same email replaces the page with S-03. The session email does not change.
- Trace: BR-5, AC-015, AC-019.

## S-05 Team workspace

- Actor: current member. Maintainer controls render only when the projection says this actor is the maintainer. Flows F-03, F-04, F-06, F-07, F-08.
- Goal: read busy/free at one instant, read permitted events, and send only the roster actions this actor is allowed to attempt.
- Regions, top to bottom: instant readout and quiet Now; member rows; event rows; primary New event; maintainer pending invites; maintainer invite field; sole-member Dissolve.
- Components: C-01, C-06, C-07, C-02, C-03 for the invite email, C-08.
- Instant: the board starts at the current time. `At start` and `At end` on an event row set the board to that event's start or end. `Now` returns it to the current time. These controls do not write and do not open S-06.
- Member row: mark and the word Busy or Free, then the member email. There is no display name. The viewer's row includes that viewer's only-self events. Every other row uses team-visible events only. A removed owner has no row.
- Event row: visibility mark and word, title, location, description, clock labels in the projection zone, quiet At start and At end, and Edit only when this actor may change that event. Description keeps internal newlines. The list includes ended events, team-visible events created before this member joined, and this member's own only-self events. A team-visible row shows the stored owner email. There is no read-only event page.
- Maintainer row actions: quiet Make maintainer on a different current member; danger Remove on a different current member. The maintainer does not get either action on their own row. Cancel invite is quiet, one per pending address. Invite is a quiet button beside the email field, not a second primary button.
- Dissolve is a danger button and renders only for the sole member. With two or more members it is absent. Submitting it when the projection no longer has a sole member writes nothing and C-08 says so.
- Empty events: the board and New event remain.
- A rejected roster command stays on S-05 and C-08 names the rejection.
- Keyboard: Now, each member row's actions, each event row's actions, New event, then the maintainer fields. Enter in the invite field activates Invite. The shell row does not scroll. The surface below it is the only scrollport.
- Trace: BR-2, BR-3, BR-4, BR-5, BR-6; AC-006 through AC-011, AC-016 through AC-019, AC-023, AC-033, AC-038 through AC-042, AC-045, AC-047. AC-042 labels use this one projection zone.

## S-06 One event

- Actor: a current member creating an event, the creator editing their own event, or the maintainer editing text, clocks, and delete on a retained team-visible event whose owner is gone. Flow F-05.
- Entry: New event, or Edit on an event this actor may change. The shell remains; this page replaces the S-05 body.
- Components: C-01, C-05 for visibility, C-03, C-04, C-02 primary Save, C-02 quiet Cancel, C-02 danger Delete when an existing event may be deleted, C-08.
- Create fields: visibility with neither option preselected, title, location, description, start, end, and the read-only zone name. Save without a visibility choice does not send. Empty location and description can be saved. An empty title is sent and comes back as `empty-title`. The page does not compare instants. A clock line that is blank or does not match `YYYY-MM-DD HH:mm` is not sent, and C-08 shows `invalid-local-time` with that field name. A matching pair whose end is not after the start is sent and comes back as `end-not-after-start`.
- Creator edit: the same fields, with the stored visibility selected. Start and end first appear as text. Quiet Change start or Change end turns that one value into C-04. Save omits a clock that was not changed, except a clock whose occurrence is being supplied.
- Custody edit: visibility is the read-only word Team. There is no C-05. Start and end use the same text-then-change controls as creator edit. The maintainer can change title, location, description, and a clock whose change control was used, or delete. A command that would change visibility is not offered.
- Ambiguous time is a state of this page. C-05 offers Earlier and Later with nothing preselected, under the field being resolved. When both fields are ambiguous, the start choice is first. The page does not write until a later submit includes the needed choice. Nonexistent and invalid times stay on this page with C-08 and write nothing.
- Cancel and Escape, before a command is sent, return to S-05 and show the stored event only. After the command is sent, they do nothing until the result arrives. Ambiguous options show the returned instant beside Earlier and Later.
- Trace: BR-4, BR-5; AC-012 through AC-015, AC-020, AC-021, AC-028, AC-029, AC-037, AC-043, AC-044, AC-046, AC-048, AC-049, AC-051.

## S-07 Record unreadable

- Actor: operator of the owning process. Flow F-09.
- Components: C-01 and C-08. No create control and no team regions.
- The page stays in place. Version 1 has no repair action.
- Trace: BR-7.

## S-08 Writer already exists

- Actor: operator looking at the existing window after that process handles `second-instance`. Flow F-09.
- Components: C-09 over the page the session already had, plus quiet Dismiss.
- Dismiss removes the notice and writes nothing. The failed process has no page.
- Trace: BR-7.

## Deviation

None. S-05 places maintainer actions after the board and the event list so the approved board-first workspace stays one page. That order does not add a destination.
