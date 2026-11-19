# Product Decision Log

> Purpose: durable record of product decisions made through Decision-driven Requirements Interview.  
> Rule: an AI recommendation is never a user-confirmed decision.  
> Product: Event Management Desktop App, version 1.  
> Interview date: 2026-11-19.

## Status definitions

- `CONFIRMED` — explicitly selected or approved by the user.
- `PROPOSED` — recommended or suggested, awaiting user approval.
- `ASSUMPTION` — temporary premise, not yet validated.
- `OPEN` — unresolved question or missing information.
- `REJECTED` — explicitly declined by the user.

Only `CONFIRMED` decisions may be treated as approved product requirements.

## Decision index

| ID | Topic | Status | Related area | Notes |
|---|---|---|---|---|
| DEC-001 | Version 1 manages schedule events for a small team | CONFIRMED | Product | Not activity registration or incident management |
| DEC-002 | First job is viewing busy/free from each member's own events | CONFIRMED | Job | Full event content is visible for team-visible events |
| DEC-003 | Visibility, edit rights, and required save fields | CONFIRMED | Events | Creator owns edit; visibility must be chosen |
| DEC-004 | One roster, one maintainer, and succession | CONFIRMED | Membership | Role cannot be vacant while members remain |
| DEC-005 | Removal, rejoin, and sole-member dissolution | CONFIRMED | Membership | Private events of a removed member are deleted |
| DEC-006 | Time model | CONFIRMED | Time | Absolute instants; no recurrence; no all-day |
| DEC-007 | Busy/free view | CONFIRMED | View | Per current member; half-open interval |
| DEC-008 | Email identity and invitations | CONFIRMED | Identity | Accept required; one stored lowercase spelling |
| DEC-009 | Record updates, failure, and conflicting writes | CONFIRMED | Record | First completed write wins |
| DEC-010 | Accepted baseline is the PRD source | CONFIRMED | Baseline | PRD remains READY FOR USER REVIEW |

## DEC-001 — Version 1 manages schedule events for a small team

- **Status:** CONFIRMED
- **Date:** 2026-11-19
- **Topic:** Product definition
- **Context / question:** What "event" means, and who the first version serves.
- **Options considered:**
  - A. Activity registration and execution.
  - B. Schedule events for personal or team time.
  - C. Operations or incident events.
  - Then, for audience: only oneself; a small team; or arranging time for someone else.
- **Assistant recommendation:** Choose one job and start with a single user. Not selected for the audience.
- **User's choice:** Schedule events. The first version serves a small team.
- **Final business rule:** Version 1 manages schedule events for one small team. Activity registration and incident management are outside this version.
- **Rationale:** User selected those options.
- **Consequences / scope impact:** Shared-meeting booking and shift assignment were not selected as the first job.
- **Related decisions:** DEC-002, DEC-010
- **Change history:** None.

## DEC-002 — First job is viewing busy/free from each member's own events

- **Status:** CONFIRMED
- **Date:** 2026-11-19
- **Topic:** Primary job and event source
- **Context / question:** What the team must accomplish first, and where busy/free comes from.
- **Options considered:**
  - Agree a shared event, view each other's busy/free, or assign time to a member.
  - Busy/free comes from each member's own schedule events, from separate busy marks, or from one shared team event.
- **Assistant recommendation:** Agree a shared event. Not selected.
- **User's choice:** View when other members are busy or free. That status comes from each member's own schedule events.
- **Final business rule:** The first job is showing when other members are busy or free. The source is each member's own schedule events.
- **Rationale:** User selected those options.
- **Consequences / scope impact:** Creating a shared meeting is not the primary job.
- **Related decisions:** DEC-001, DEC-007
- **Change history:** None.

## DEC-003 — Visibility, edit rights, and required save fields

- **Status:** CONFIRMED
- **Date:** 2026-11-19
- **Topic:** Event visibility and save
- **Context / question:** What other members see, who can change an event, and what a save requires.
- **Options considered:** Busy/free only; time plus title; or full event content. Edit by creator only, by any member, or by creator plus designated members. Hide none, hide the whole event, or hide content only. Default team-visible, default only-self, or a required choice.
- **Assistant recommendation:** Show busy/free only, keep edit with the creator, disallow hiding, and default to team-visible. The user selected full content, creator-only edit, whole-event hiding, and a required choice.
- **User's choice:** Other members see title, time, location, and description. Only the creator may modify or delete. The creator may mark one event only-self; teammates then do not see it and it does not make them busy. Create must explicitly choose team-visible or only-self, or the event is not saved. The creator may later switch only-self back to team-visible, and current other members then see it immediately.
- **Final business rule:** A save requires an explicit visibility choice, a title that still contains a character after outer whitespace is removed, and an end instant after the start. Location and description may be empty. Stored title, location, and description drop outer whitespace and keep internal spaces, tabs, and newlines. A whitespace-only location or description is stored empty. Only the creator may modify or delete, except the removal-custody rule in DEC-005. Modify uses the same title, time, and visibility rules. A failed or canceled save leaves the stored event unchanged.
- **Rationale:** User selected those options.
- **Consequences / scope impact:** Team-visible events expose full content to the current roster.
- **Related decisions:** DEC-004, DEC-005, DEC-007
- **Change history:** None.

## DEC-004 — One roster, one maintainer, and succession

- **Status:** CONFIRMED
- **Date:** 2026-11-19
- **Topic:** Membership authority
- **Context / question:** Who belongs to the team, who changes the roster, and how the maintainer role moves.
- **Options considered:** A persistent roster or automatic membership for every user. Any member or one maintainer changes the roster. Succession by designation, by earliest member, or no handoff.
- **Assistant recommendation:** Persistent roster, one maintainer, and explicit designation.
- **User's choice:** One persistent roster. Team-visible events are shown to every other current member, not to a per-event audience. Only one maintainer may add or remove members. The founder is the first maintainer and the first member and must supply an email. Designating a different current member transfers the role immediately; the previous maintainer remains an ordinary member. Accepting an invite does not transfer the role. The maintainer cannot remove their own entry. While any member remains, the role cannot be vacant.
- **Final business rule:** Only the current maintainer may invite, cancel an invite, or remove another current member. An ordinary member cannot invite, cancel, remove another member, remove themselves, or remove the maintainer; those attempts leave the record unchanged. Self-designation is not allowed.
- **Rationale:** User selected those options.
- **Consequences / scope impact:** The founder has no extra rights after succession.
- **Related decisions:** DEC-005, DEC-008
- **Change history:** The earlier statement that the role merely cannot become vacant before designation was refined by the user's later choice that transfer happens immediately on designation and not when an invite is accepted.

## DEC-005 — Removal, rejoin, and sole-member dissolution

- **Status:** CONFIRMED
- **Date:** 2026-11-19
- **Topic:** Membership lifecycle
- **Context / question:** What removal, rejoin, and dissolution do to access and events.
- **Options considered:** Leave retained events frozen, transfer custody to the maintainer, or hide them. Delete private events, keep them private, or reveal them. Allow or refuse self-removal. Allow or refuse dissolution while other members remain.
- **Assistant recommendation:** Maintainer custody for retained team-visible events, delete private events, refuse self-removal, and allow dissolution only for the sole member.
- **User's choice:** Removal immediately removes team access. Retained team-visible events stay visible to remaining members and stay team-visible. The maintainer may change their title, time, location, and description, or delete them, but may not change visibility. A save that includes a visibility change writes nothing. Only-self events of the removed member are deleted and version 1 does not restore them. Rejoin, including rejoin by the founder, returns edit and delete rights for retained team-visible events to that member. The sole member may dissolve the team. Dissolution clears the roster, deletes all events, ends the maintainer role and pending invites, and version 1 does not restore them. Dissolution fails while another member remains.
- **Final business rule:** Busy rows list current members only. A removed owner's retained team-visible events remain visible and attributed to that email. On rejoin, the maintainer can no longer modify those events.
- **Rationale:** User selected those options.
- **Consequences / scope impact:** Private events are permanently deleted on removal in version 1.
- **Related decisions:** DEC-004, DEC-009
- **Change history:** None.

## DEC-006 — Time model

- **Status:** CONFIRMED
- **Date:** 2026-11-19
- **Topic:** Instants, entry, history, recurrence, and all-day
- **Context / question:** How clock times become instants, and which time forms version 1 includes.
- **Options considered:** One team timezone or absolute instants displayed in each viewer's current device zone. Past events allowed or refused. Recurrence and all-day included or excluded.
- **Assistant recommendation:** Absolute instants, allow past single events, and exclude recurrence and all-day events.
- **User's choice:** Store absolute instants. Judge busy/free on the same instant for every member. Display clock time in the viewer's current device-local timezone. Convert entered clock times with the saving person's device-local timezone at that save, including a maintainer editing a removed member's event. Unchanged start or end values keep their stored instants. A local time that does not exist cannot be saved. A local time that occurs twice must be chosen. Past single intervals may be saved. Ended team-visible events remain visible and do not make the current instant busy. Version 1 has no recurring events and no all-day events.
- **Final business rule:** Every event has an absolute start and an absolute end, with end after start. The busy interval includes the start and excludes the end.
- **Rationale:** User selected those options.
- **Consequences / scope impact:** Version 1 does not represent a local calendar date as an all-day event.
- **Related decisions:** DEC-007
- **Change history:** None.

## DEC-007 — Busy/free view

- **Status:** CONFIRMED
- **Date:** 2026-11-19
- **Topic:** View outcome
- **Context / question:** What a member sees, including overlap and private events.
- **Options considered:** Per-member busy/free, the same view without private events affecting the creator, or an unlabeled event list. Allow or refuse overlap.
- **Assistant recommendation:** Per-member view, private events busy only for the creator, and allow overlap.
- **User's choice:** List every current member. Another member sees a person as busy at instant T when at least one team-visible event of that person satisfies start ≤ T < end; otherwise free. Every team-visible event is shown with its owner and full content. The creator sees both visibilities. An only-self event makes only the creator's own row busy. Any overlap among one member's own events may be saved. Teammate busy/free remains the union of remaining team-visible coverage.
- **Final business rule:** A member's own row is busy when any of that member's team-visible or only-self events covers T.
- **Rationale:** User selected those options.
- **Consequences / scope impact:** Version 1 shows overlapping events rather than rejecting them.
- **Related decisions:** DEC-002, DEC-003, DEC-006
- **Change history:** None.

## DEC-008 — Email identity and invitations

- **Status:** CONFIRMED
- **Date:** 2026-11-19
- **Topic:** Identity and join
- **Context / question:** How a person is invited and when that person can see the team.
- **Options considered:** Join after acceptance or immediately when the maintainer writes a name. Identify by email, username, or display name. Keep or replace a second pending invite.
- **Assistant recommendation:** Acceptance, email identity, one pending invite, and rejection of an invite to a current member.
- **User's choice:** The maintainer invites by email. The invited email must accept before joining and cannot see the roster, events, or busy/free before acceptance. Before acceptance, that email sees only its own pending invite. Only that email may accept or decline. The pending address is visible only to that email and the current maintainer. A usable email, after outer trim, has exactly one @, at least one non-whitespace character on each side, and no spaces. The roster and attribution store the trimmed, fully lowercased spelling. The same email cannot be a current member twice. An invite to a current member fails. A removed email may accept a later invite. One pending invite exists per email; a second invite fails and the original remains. The invite survives succession and ends on accept, decline, maintainer cancel, or dissolution. It does not expire by time.
- **Final business rule:** Accept, decline, or cancel with no matching pending invite fails. An invite, decline, or cancel that does not complete leaves pending invites and the roster unchanged. Only a current member may create an event, and it is attributed to that member's stored email.
- **Rationale:** User selected those options.
- **Consequences / scope impact:** Version 1 does not send reminders for invites.
- **Related decisions:** DEC-004, DEC-005, DEC-009
- **Change history:** The first email rule ignored case and outer whitespace. The user later confirmed the usable-email shape and lowercase storage.

## DEC-009 — Record updates, failure, and conflicting writes

- **Status:** CONFIRMED
- **Date:** 2026-11-19
- **Topic:** Team record
- **Context / question:** When members see a committed change, and what happens when operations overlap or fail.
- **Options considered:** Show the latest record on the next view, or require every member to be online before a save succeeds. Keep the prior record on failure, or allow partial results. Let the first completed write win, or let the later write override lost permissions.
- **Assistant recommendation:** Next view for members who are not currently viewing, no partial results, and first completed write wins.
- **User's choice:** A successful save, delete, removal, succession, dissolution, or acceptance enters the team record at completion. Members who are viewing then see the new result. Members who are not viewing see the latest record on their next view. A save does not require other members to be online. If delete, removal, succession, dissolution, or acceptance does not complete, the prior record remains. The first completed write wins. A later operation is checked against the record at its write. A later save, modify, or delete does not recreate an event that was already deleted or a team that was already dissolved.
- **Final business rule:** Version 1 sends no start reminders. Unsaved edits are not shown to viewers.
- **Rationale:** User selected those options.
- **Consequences / scope impact:** Version 1 does not restore deleted events or a dissolved team.
- **Related decisions:** DEC-005, DEC-006, DEC-008
- **Change history:** None.

## DEC-010 — Accepted baseline is the PRD source

- **Status:** CONFIRMED
- **Date:** 2026-11-19
- **Topic:** Baseline acceptance and document authorization
- **Context / question:** Whether the reviewed requirements baseline may be used for a PRD draft, and which files may be written.
- **Options considered:**
  - Accept the baseline and draft the PRD, accept it without drafting, or change a rule.
  - Then authorize the decision log, requirements review, and PRD; authorize only the log and review; or write nothing.
- **Assistant recommendation:** Accept the baseline and authorize all three files.
- **User's choice:** Accept the baseline as the source for the PRD draft. Authorize `docs/product/03-decision-log.md`, `docs/product/reviews/requirements-review.md`, and `docs/product/04-prd.md`.
- **Final business rule:** The PRD draft records the confirmed baseline and is READY FOR USER REVIEW. This decision does not approve the PRD.
- **Rationale:** User selected those options after the final requirements review found no material gap.
- **Consequences / scope impact:** PRD Quality Auditor runs after the draft exists. The auditor does not approve the PRD.
- **Related decisions:** DEC-001
- **Change history:** None.

## Recording rules

1. Assign stable, sequential IDs: `DEC-001`, `DEC-002`, etc. Never reuse an ID.
2. Create a record when a material product decision is raised, even if it remains OPEN.
3. Keep the user's choice separate from the assistant recommendation.
4. Set status to CONFIRMED only after explicit user approval.
5. If only part of a decision is confirmed, split it into separate records or clearly isolate the confirmed portion.
6. When a decision changes, preserve traceability: record the replacement decision and mark the prior one as superseded in its change history.
7. Link business rules and acceptance criteria back to relevant decision IDs where practical.
8. Do not fabricate dates, rationales, or user statements.
9. Review this log at each stage checkpoint and before PRD approval.
