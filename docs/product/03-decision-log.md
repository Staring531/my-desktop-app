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
| DEC-011 | User approves PRD version 0.1 draft | CONFIRMED | Approval | PRD status is APPROVED |
| DEC-012 | Personal time management for individual consumers | CONFIRMED | Product | Does not supersede DEC-001 |
| DEC-013 | Delivery order for the new product direction | CONFIRMED | Scope | Desktop follows discovery and teams |
| DEC-014 | Calendar and Event are different objects | CONFIRMED | Model | Schedule is not the name of either |
| DEC-015 | Username, nickname, and email login | CONFIRMED | Identity | Email stays private |
| DEC-016 | Phase 1 personal calendar audience | CONFIRMED | Visibility | Other users cannot open it yet |
| DEC-017 | Event fields, visibility, and public content | CONFIRMED | Events | New events default to private |
| DEC-018 | Calendar timezone | CONFIRMED | Time | One zone per user |
| DEC-019 | Daily, weekly, and monthly recurrence | CONFIRMED | Time | No all-day events |
| DEC-020 | Conflict warnings | CONFIRMED | Events | Warning does not block saving |
| DEC-021 | Teams and the single team calendar | CONFIRMED | Membership | Confirmed, not in the first delivery |
| DEC-022 | Account deletion and identity reuse | CONFIRMED | Identity | Username is not reassigned |
| DEC-023 | Remaining registration details | OPEN | Identity | Not a requirement |
| DEC-024 | Cancel an unverified registration | CONFIRMED | Identity | Releases username and email |
| DEC-025 | Login failure reveals nothing | CONFIRMED | Identity | One result for three failures |
| DEC-026 | Password recovery for a verified account | CONFIRMED | Identity | Old password stops working |
| DEC-027 | Timezone change and future repeats | CONFIRMED | Time | Future clock time follows the new zone |
| DEC-028 | Generated daylight-saving times | CONFIRMED | Time | One occurrence is skipped or waits |
| DEC-029 | An occurrence in progress has occurred | CONFIRMED | Time | Started occurrences stay put |
| DEC-030 | Conflict comparison and overlap | CONFIRMED | Events | No self-overlap; touching ends do not overlap |
| DEC-031 | A deleted occurrence stays absent | CONFIRMED | Time | Series edits do not restore it |
| DEC-032 | Visibility changes and detachment | CONFIRMED | Events | One occurrence detaches; the series includes history |
| DEC-033 | Series text updates attached history | CONFIRMED | Events | Started occurrences keep their times |
| DEC-034 | Edit and delete one non-repeating Event | CONFIRMED | Events | Delete is immediate and not restorable |
| DEC-035 | Repetition kind is fixed at creation | CONFIRMED | Time | A later edit cannot switch it |
| DEC-036 | Conflict warning wording | CONFIRMED | Events | No warning without an in-window overlap |
| DEC-037 | Nickname display after a change | CONFIRMED | Identity | Current nickname, or the username |
| DEC-038 | Logged-out Calendar access | CONFIRMED | Identity | Logout hides the personal Calendar |
| DEC-039 | Completed save and complete deletion | CONFIRMED | Events | Last finished save; deletion is all or nothing |
| DEC-040 | A sharing link addresses one Calendar | CONFIRMED | Model | The link is not a second Calendar |
| DEC-041 | Where a former member edits a team Event | CONFIRMED | Membership | Own retained Events only |
| DEC-042 | The team creator is a member and the only administrator | CONFIRMED | Membership | No successor after the creator leaves |
| DEC-043 | Who can open a team Calendar | CONFIRMED | Membership | Logged-in users see public Events |
| DEC-044 | Invitation boundaries | CONFIRMED | Membership | Only the invited account can join |
| DEC-045 | Sole-member dissolution | CONFIRMED | Membership | Same Event move as any dissolution |
| DEC-046 | Where an ended team Event stays | CONFIRMED | Time | Team Calendar until dissolution |
| DEC-047 | A deleted username reaches no account | CONFIRMED | Identity | Search and the old link find nothing |
| DEC-048 | Search result fields and match | CONFIRMED | Identity | Nickname and username; whole-value match |
| DEC-049 | Proof for cancelling an unverified registration | CONFIRMED | Identity | Email and password; verified accounts stay |
| DEC-050 | Absence, detachment, and deletion races | CONFIRMED | Events | Later series save keeps both; deletion removes a finished save |
| DEC-051 | Registration and recovery reveal nothing | CONFIRMED | Identity | One failure result; no second account |
| DEC-052 | Identity of a deleted occurrence | CONFIRMED | Time | Original start instant; new weekdays remain |
| DEC-053 | Conflict window of 90 calendar dates | CONFIRMED | Events | Includes past and in-progress overlap |
| DEC-054 | One series save applies each field | CONFIRMED | Events | Started occurrence keeps its time |
| DEC-055 | Removal uses the retained-Event list | CONFIRMED | Membership | Rejoin returns editing to the team Calendar |
| DEC-056 | Viewer clock time | CONFIRMED | Time | Viewer's timezone, labeled |
| DEC-057 | Generated gap and later timezone change | CONFIRMED | Time | Skip the occurrence; do not recreate it |
| DEC-058 | A detached occurrence is compared | CONFIRMED | Events | Series save warns about it |
| DEC-059 | An ended sharing link opens nothing | CONFIRMED | Model | No Calendar and no Event |
| DEC-060 | Where an invitation is accepted | CONFIRMED | Membership | Invited account only; no email in the lists |
| DEC-061 | Recovery ends existing sessions | CONFIRMED | Identity | Completion does not open the Calendar |
| DEC-062 | Nickname outer whitespace | CONFIRMED | Identity | Stored, shown, and searched without it |
| DEC-063 | Team transitions finish or stay | CONFIRMED | Membership | No halfway move between Calendars |
| DEC-064 | Who may search | CONFIRMED | Identity | Logged-in only; empty and no-match return nobody |
| DEC-065 | Monthly preview bound | CONFIRMED | Time | Month types, plus dates inside 90 days |
| DEC-066 | Recovery completion proof | CONFIRMED | Identity | One-time email proof; failures reveal nothing |
| DEC-067 | Deleted date stays empty after a time change | CONFIRMED | Time | Same weekday and new clock time do not refill it |
| DEC-068 | Later detachment keeps its own content | CONFIRMED | Time | Series-save changes stay off that occurrence |
| DEC-069 | Unchosen doubled start keeps both instants | CONFIRMED | Time | Offered after the clock time is no longer doubled |
| DEC-070 | Chosen instant survives a timezone change | CONFIRMED | Time | Future choice keeps its absolute instant |
| DEC-071 | Skipped date stays skipped after a time change | CONFIRMED | Time | A new valid clock time does not refill it |
| DEC-072 | Revoked team link while the creator remains | CONFIRMED | Model | Opens no Calendar and shows no Event |
| DEC-073 | Unfinished save after recovery | CONFIRMED | Identity | A save still unfinished writes nothing |
| DEC-074 | Deleted daily and monthly dates stay empty | CONFIRMED | Time | A new clock time does not refill them |
| DEC-075 | Starting recovery sends the proof | CONFIRMED | Identity | Only a verified account receives it |
| DEC-076 | A later proof replaces earlier proofs | CONFIRMED | Identity | Unused earlier proofs no longer work |
| DEC-077 | Email verification proof | CONFIRMED | Identity | Matching email proof verifies the registration |
| DEC-078 | Series continuation sentence | CONFIRMED | Time | Shown even when no Event overlaps |
| DEC-079 | Quality targets deferred | CONFIRMED | Scope | Speed, availability, and accessibility stay open |
| DEC-080 | Personal time PRD approved | CONFIRMED | Approval | `06-prd-personal-time.md` version 0.1 |
| DEC-081 | A proof that cannot be sent | CONFIRMED | Identity | Registration or recovery start is not stored |
| DEC-082 | Who sees a failed send | CONFIRMED | Identity | Every attempt while mail cannot be sent |

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

## DEC-011 — User approves PRD version 0.1 draft

- **Status:** CONFIRMED
- **Date:** 2026-11-19
- **Topic:** PRD approval
- **Context / question:** Whether the user approves the current PRD, `docs/product/04-prd.md`, version 0.1 draft.
- **Options considered:**
  - Approve the current PRD.
  - Leave it READY FOR USER REVIEW.
  - Change a requirement before approval.
- **Assistant recommendation:** None. Approval was the user's explicit instruction.
- **User's choice:** Formally approve the current PRD version. Keep its functional scope, business rules, and acceptance criteria unchanged. Record the approval in the Decision Log. Do not modify DEC-001 through DEC-010. Do not rerun reviews, write application code, or start technical design.
- **Final business rule:** `docs/product/04-prd.md` version 0.1 draft has status APPROVED as of 2026-11-19. This approval does not add, remove, or change the confirmed requirements in DEC-001 through DEC-010.
- **Rationale:** The user explicitly approved the current PRD version.
- **Consequences / scope impact:** The approved document is the requirements baseline for a later implementation decision. This record does not authorize application code or technical design.
- **Related decisions:** DEC-010
- **Change history:** None. DEC-001 through DEC-010 are unchanged. DEC-010 still records that accepting the baseline did not itself approve the PRD.

## New product direction recorded on 2026-11-24

DEC-012 through DEC-023 record the personal time-management direction confirmed in the 2026-11-24 interview. They do not supersede DEC-001 through DEC-011. `docs/product/04-prd.md` remains the approved baseline of the earlier one-computer, one-team desktop product. DEC-080 later approves `docs/product/06-prd-personal-time.md` and does not supersede `docs/product/04-prd.md`.

## DEC-012 — Personal time management for individual consumers

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Product definition
- **Context / question:** Who the new product serves, and which job comes first.
- **Options considered:** The user stated this direction after the approved desktop baseline. It was not selected from a fresh option list in the log.
- **Assistant recommendation:** None for the initial statement. The assistant recommended keeping it separate from DEC-001 through DEC-011.
- **User's choice:** The product serves ordinary individual consumers. Its core value is personal daily time management. Public sharing and team collaboration are auxiliary. Personal time management has priority over team management.
- **Final business rule:** The new product direction is consumer personal time management. Sharing and teams support that job. They do not replace it.
- **Rationale:** The user explicitly confirmed this positioning for the new discovery.
- **Consequences / scope impact:** DEC-001 and DEC-002 remain the history of the earlier small-team busy/free product. They are not the requirements of this direction.
- **Related decisions:** DEC-013, DEC-001, DEC-002
- **Change history:** None. This record does not mark DEC-001 or DEC-002 superseded.

## DEC-013 — Delivery order for the new product direction

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Delivery sequence
- **Context / question:** Which confirmed capabilities belong to the first browser-server delivery, which follow it, and when the desktop app arrives.
- **Options considered:**
  - A. First delivery is registration, the personal calendar, events, public and private visibility, daily, weekly, and monthly recurrence, and conflict warnings. Search, the personal calendar page, sharing links, and all team capabilities come after that delivery and before the desktop app.
  - B. The first delivery also includes search, the personal page, sharing links, and teams. The desktop app comes after those.
  - C. The first delivery includes the personal capabilities plus search, the personal page, and sharing links. Teams come after that delivery and before the desktop app.
- **Assistant recommendation:** C.
- **User's choice:** A.
- **Final business rule:** The first delivery is a browser application whose business data is held by the server. It includes registration and login, one personal calendar, events, public and private visibility, daily, weekly, and monthly recurrence, and conflict warnings. Search by username or nickname, the personal calendar page, calendar sharing links, teams, invitations, leaving, removal, and dissolution come after that delivery and before the desktop app. The desktop app is last. It connects to the same server and uses the identity, rules, and data already in service. Cursor's presence does not choose the web or server technology.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** The user had earlier called the desktop app the second phase. Under this choice, search and teams sit between the first browser-server delivery and the desktop app. Team rules in DEC-021 are confirmed and are not part of the first delivery.
- **Related decisions:** DEC-012, DEC-016, DEC-021
- **Change history:** None.

## DEC-014 — Calendar and Event are different objects

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Product objects
- **Context / question:** What Schedule means, and which confirmed behavior belongs to which object.
- **Options considered:**
  - First, whether Schedule is an entry, a container, or both. The user selected both and required two names.
  - Then: A. The container is a Calendar. The entry is an Event. Public and private visibility, recurrence, conflict warnings, and single or series changes belong to the Event. A Calendar contains Events. B. Both a Calendar and an Event can be public or private. C. Use the Chinese names only and leave the visibility layer open.
- **Assistant recommendation:** Both objects, with Calendar and Event as the names. Then A for the rule placement.
- **User's choice:** Both objects, then A.
- **Final business rule:** A Calendar is the container. The personal calendar page and a team calendar are Calendars. A sharing link is an address for one existing Calendar, not another Calendar. An Event is an entry in a Calendar. Public or private visibility, recurrence, conflict warnings, and modifying or deleting one occurrence or a whole series apply to the Event. One Calendar contains multiple Events. The word Schedule is not the formal name of either object.
- **Rationale:** The user selected those options.
- **Consequences / scope impact:** Each user has a personal calendar page. That page is the user's personal Calendar. How many personal Calendars a user may own beyond that page was not separately decided.
- **Related decisions:** DEC-013, DEC-017, DEC-021
- **Change history:** DEC-040 clarifies that a sharing link is an address for an existing Calendar, not a separate Calendar. The final rule above now states that address. The Calendar and Event distinction in this decision remains.

## DEC-015 — Username, nickname, and email login

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Identity
- **Context / question:** What a username and nickname do, which credential logs a user in, and whether a nickname is required at registration.
- **Options considered:**
  - Identity: A. The username is unique and stable and is the personal calendar link. The nickname can change and can duplicate another user's nickname. The login credential is decided next. B. Email is the unique identity. C. Username and nickname are both unique.
  - Credential: A. A private email and password. The username is set at registration. The email must be verified before login, and recovery uses that email. B. A one-time email link and no password. C. Username and password only, with no email.
  - Nickname at registration: A. Optional. An empty nickname uses the username as the display name and can be added later. B. Required. C. Omitted from the first delivery.
- **Assistant recommendation:** A for each of the three questions.
- **User's choice:** A for each.
- **Final business rule:** Registration requires a username, an email address, and a password. The username is unique and does not change. It is the personal calendar link. The nickname is optional, can be changed, and may match another user's nickname. With no nickname, the display name is the username. A username search identifies that one user. A nickname search can list more than one user. The email and password are the login credential. The email must be verified before the user can log in. Account recovery uses that email. The email does not appear in the calendar link, the personal page, search results, or a public Event. An email held by an unverified registration or a verified account cannot register a second account. DEC-024 releases it when that unverified registration is cancelled. DEC-022 releases it when account deletion completes.
- **Rationale:** The user selected A for identity, credential, and optional nickname. One active account for each email is the rule required by login, recovery, and the later choice that deletion frees the email for a new registration.
- **Consequences / scope impact:** The earlier product's unverified email session is not this account. Username characters, password rules, verification lifetime, and changing the email remain DEC-023.
- **Related decisions:** DEC-016, DEC-022, DEC-023
- **Change history:** DEC-047 states that a deleted username, nickname search, and the old personal-calendar link reach no account. DEC-048 states the fields in a search result and the whole-value match. DEC-024 holds an unverified email as well as a verified account. The final rule above now says so.

## DEC-016 — Phase 1 personal calendar audience

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Who can see Events in the first delivery
- **Context / question:** Public Events are visible to logged-in users, while search, the personal page, and sharing links are not in the first delivery. When can another user see a public Event?
- **Options considered:**
  - A. In the first delivery, only the creator manages public and private Events on that creator's personal Calendar. Other logged-in users cannot open another person's Calendar. Public viewing begins when search, the personal page, or a sharing link is available.
  - B. A logged-in user who enters another user's username can open that Calendar in the first delivery.
  - C. The first delivery stores only private Events. Public visibility waits for the later discovery surfaces.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** In the first delivery, the creator can create, distinguish, modify, and delete public and private Events on the creator's own personal Calendar. The creator can see both. Another logged-in user cannot open that Calendar and cannot see its Events. When search, the personal calendar page, or a sharing link becomes available, a public Event shows its full content to every logged-in user. A private Event remains invisible to everyone except its creator. Viewing another person's public Calendar requires login.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** Full public content is defined by DEC-017. The first delivery records visibility before other users have a way to open the Calendar.
- **Related decisions:** DEC-013, DEC-014, DEC-017
- **Change history:** None.

## DEC-017 — Event fields, visibility, and public content

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Event save and visibility
- **Context / question:** How a new Event chooses visibility, whether that choice can change, which fields a save requires, and what another logged-in user sees on a public Event.
- **Options considered:**
  - Initial visibility: A. An explicit public or private choice is required and there is no default. B. A new Event is private by default, and the creator may choose public. C. A new Event is public by default.
  - After saving: A. The creator may change one occurrence or the whole series. A series change does not affect a detached occurrence. Private hides the Event immediately. Public reveals its full content immediately. B. Visibility cannot change after saving. C. Public can become private, and private cannot become public.
  - Required content: A. Title, start, and end are required. The end is after the start. The title must still contain a character after outer whitespace is removed. Location and description are optional. The private default counts as the visibility choice. B. Only start and end are required. C. Location is also required.
  - Public content: A. Title, start, end, location, description, username, and nickname. An empty location or description is shown empty. No email. B. Title, time, and username only. C. Everything in A plus the email.
- **Assistant recommendation:** B for the default, then A for later changes, required content, and public content.
- **User's choice:** The user first selected required explicit visibility, then corrected that choice to the private default. The user selected A for later changes, required content, and public content.
- **Final business rule:** A new Event is private unless the creator chooses public before saving. The creator may later make one occurrence or the whole series public or private. Changing the series does not change an occurrence that has already detached. After the change, a private Event is no longer visible to anyone but its creator, and a public Event shows its full content to every logged-in user who can open it. A save requires a title, a start, and an end after the start. Removing whitespace from both ends of the title must leave at least one character. Location and description may be empty. A save that lacks a required value does not write, and the stored Event remains unchanged. There is no date-only Event. Once another user can open the Calendar, a public Event shows its title, start, end, location, description, and the creator's username and nickname. With no nickname, it shows the username. An empty location or description is shown empty. It does not show the creator's email. The creator can always see these fields on the creator's own public and private Events.
- **Rationale:** The user selected those options and corrected the default before this record was written.
- **Consequences / scope impact:** DEC-016 delays other users' access. It does not change the stored visibility or the content they will see later. The creator owns these edits. Team edit limits are DEC-021.
- **Related decisions:** DEC-014, DEC-015, DEC-016, DEC-019
- **Change history:** In the same interview, before this record existed, the user first chose a required public or private selection with no default, then replaced that choice with the private default. Only the private default is confirmed.

## DEC-018 — Calendar timezone

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Timezone
- **Context / question:** Which timezone interprets dates, recurrence, the 90-day conflict window, and displayed clock times.
- **Options considered:**
  - A. Each user has a calendar timezone. Registration uses the browser timezone. The user may change it. Entry, recurrence expansion, the 90-day window, and display use that timezone. Saved instants stay unchanged. A daylight-saving local time that does not exist cannot be saved. A local time that occurs twice must be chosen by the user.
  - B. Do not store a user timezone. Entry uses the browser zone at that moment, and display uses the viewer's current device zone.
  - C. Every user shares one fixed timezone.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** Each user has one calendar timezone. At registration it is the browser timezone, and the user may change it later. Creating or editing an Event, expanding recurrence, calculating the 90-day conflict window, and displaying clock times use the user's current calendar timezone. A non-repeating Event, a detached occurrence, and an attached occurrence that has already occurred keep their absolute instants when the timezone changes. Their displayed clock times use the new timezone. An attached occurrence that has not yet occurred is expanded again by DEC-027. A local time that does not exist in that timezone cannot be saved when the user is entering it. When the same local time occurs twice, the user chooses which occurrence to save.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** Future occurrences of a series are expanded in the user's current calendar timezone. DEC-019 limits which occurrences a series edit may move.
- **Related decisions:** DEC-019, DEC-020, DEC-027
- **Change history:** DEC-027 re-expands attached occurrences that have not yet occurred. The absolute-instant sentence applies to a non-repeating Event, a detached occurrence, and an attached occurrence that has already occurred. DEC-056 shows another viewer's clock time in that viewer's timezone and labels it.

## DEC-019 — Daily, weekly, and monthly recurrence

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Recurrence
- **Context / question:** Which repeats exist, how weekly and monthly dates are chosen, how one occurrence relates to its series, and what a series edit does to past occurrences.
- **Options considered:**
  - The user required daily, weekly, and monthly repetition, with no automatic end, in the first delivery. One occurrence or the whole series can be modified. One occurrence or the whole series can be deleted. A monthly date that does not exist must be previewed, shown to the user, and left for the user to change. The product must not move that date to the month's last day or skip it silently.
  - Monthly save: A. The selected day must exist in every month, or the series is not saved. B. The user may explicitly skip months that lack the day. C. The series saves and months that lack the day produce no occurrence.
  - One occurrence: A. Deleting it removes only that occurrence. Modifying it detaches it from the series. A later series change or series deletion does not affect it. Series deletion removes occurrences that are still attached. B. A modified occurrence stays in the series and follows a later series change. C. Series deletion also deletes modified occurrences.
  - Weekly day: A. The creator selects one or more weekdays. B. The series occurs only on the weekday of its start. C. The series occurs every seven days without a weekday.
  - All-day: A. No all-day Event. B. One date from 00:00 to the next 00:00. C. An all-day Event may cover multiple dates.
  - Past Events: A. Ended Events, Events that began in the past, and series that start in the past may be saved. Ended occurrences remain and participate in conflict comparison. B. The end must be in the future. C. A past single Event may be saved, but a series must start in the future.
  - Weekly start moved to another weekday: A. Future attached occurrences use the new weekday and time. Past attached occurrences keep their instants. B. The original weekday is locked. C. Past attached occurrences also move.
  - The same past-and-future rule for daily and monthly: A. Daily, weekly, and monthly series edits change only future attached occurrences. An invalid monthly day rejects the whole series save. B. Only weekly protects past occurrences. C. All three series edits also rewrite past occurrences.
- **Assistant recommendation:** A for the monthly save, detached occurrences, all-day exclusion, past Events, and series edits. B for the weekly weekday.
- **User's choice:** A for the monthly save, detached occurrences, no all-day Event, past Events, and series edits. B for weekly. The user required daily, weekly, and monthly repetition with no automatic end.
- **Final business rule:** The first delivery supports daily, weekly, and monthly Events that do not end automatically. There is no all-day or date-only Event. A daily series occurs on every calendar day in the user's current calendar timezone, at the start clock time, and lasts for the start-to-end duration. A weekly series occurs only on the weekday of its start, with that same duration. The creator does not select extra weekdays on that series. A monthly series occurs on the same date each month. That date must exist in every month in the user's calendar timezone. The preview names the types of month that lack it and lists the concrete missing dates only inside the 90 calendar dates defined by DEC-065. If the date does not exist in every month, the series is not saved and the stored Event remains unchanged. The product does not move the date to the month's last day and does not skip the missing month. Deleting one occurrence removes only that occurrence. Modifying one occurrence changes only that occurrence and detaches it. A later series modification or series deletion does not affect a detached occurrence. Deleting a series deletes occurrences that are still attached and keeps detached occurrences. A detached occurrence remains the original creator's Event. A series time change applies only to attached occurrences that have not yet occurred. Attached occurrences that have already occurred keep their absolute instants. DEC-032 updates visibility on started attached occurrences. DEC-033 updates title, location, and description on those occurrences and leaves their times unchanged. This rule applies to daily, weekly, and monthly series. Future weekly occurrences use the new weekday, clock time, and duration. A monthly series modification whose new date does not exist in every month does not save, and the stored series remains unchanged. Ended single Events, Events that cross the current instant, and series that start in the past may be saved. Ended occurrences stay on the creator's personal Calendar.
- **Rationale:** The user selected those options. Daily repetition was required by the user. Its every-calendar-day anchor follows that requirement together with DEC-018, and the user applied the later series rules to daily Events without correcting that anchor.
- **Consequences / scope impact:** DEC-006 excludes recurrence only for the earlier desktop baseline. It does not apply to this direction.
- **Related decisions:** DEC-013, DEC-017, DEC-018, DEC-020
- **Change history:** DEC-046 states that an ended team Event stays on the team Calendar until dissolution. The sentence above about the personal Calendar applies to an Event stored there. DEC-032 and DEC-033 narrow the series-modification sentence: a time change still skips started occurrences, while visibility and text follow those later decisions. DEC-065 bounds the monthly preview to month types and missing dates inside 90 calendar dates.

## DEC-020 — Conflict warnings

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Overlap
- **Context / question:** Which Events are compared, how far a repeating series is expanded, and what the warning shows.
- **Options considered:**
  - The user required that overlapping times may be saved, that the creator receives a warning, and that the warning does not block saving. The exact comparison set was then decided.
  - Comparison set: A. Only the creator's Events on the same Calendar. B. Every Event the creator still owns, on the personal Calendar, on team Calendars, and moved to the personal Calendar after dissolution. The warning is shown only to the creator. Create and modify both warn. C. Also compare other people's public Events.
  - Expansion: A. One occurrence compares only itself. A series compares every occurrence in the 90 days from the save and lists every overlapping date. Beyond 90 days, the warning says the repetition continues and does not list each date. B. The same rule with 365 days. C. One warning with no dates.
  - Display: A. Each overlapping Event's title, start, and end. B. Only the number of overlaps. C. Title, time, and whether the other Event is public or private.
- **Assistant recommendation:** B for the comparison set, then A for expansion and display.
- **User's choice:** B, then A, then A.
- **Final business rule:** Overlapping Events may be saved. Creating or modifying an Event compares it with every Event that creator still owns. The set includes the personal Calendar, Events the creator still owns on team Calendars, and Events moved to the personal Calendar when a team is dissolved. Another person's Events are not compared. The warning is shown only to the creator. Saving one occurrence compares only that occurrence. Saving a series compares every occurrence in the 90 calendar dates defined by DEC-053, including every overlap of a daily series, and lists each overlapping Event's title, start, and end. After those 90 calendar dates, the warning does not list each date and says the repetition continues. The warning does not show an email address and does not block saving. The first delivery has no team Calendar yet, so its comparison set is the creator's personal Calendar until DEC-021 is delivered.
- **Rationale:** The user selected those options.
- **Consequences / scope impact:** Ended Events from DEC-019 are included when they overlap. The warning does not reveal another person's private Event because other people's Events are outside the comparison.
- **Related decisions:** DEC-016, DEC-018, DEC-019, DEC-021, DEC-053
- **Change history:** DEC-053 defines the 90 days as calendar dates and includes overlaps before the save instant and overlaps already in progress.

## DEC-021 — Teams and the single team calendar

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Teams
- **Context / question:** How many team Calendars a team has, how a person joins, what leaving or removal does to Events, and what dissolution does.
- **Options considered:**
  - The user required that a person may create more than one team and belong to more than one team, that a team may have multiple members, that a member may create team Events and may modify or delete only Events that member created, and that the team creator manages members and invitations. A team creator cannot bypass a private Event.
  - Joining: A. The creator invites a username. The person accepts while logged in and only then becomes a member. Decline or cancellation means the person does not join. Membership is required before creating an Event on that team Calendar. B. The username becomes a member immediately. C. Any logged-in user who accepts a link may join.
  - Leaving or removal: A. Retained Events become uneditable. B. Retained Events stay on the team Calendar, and their creator can still modify or delete them. C. That member's team Events are deleted.
  - Dissolution: A. The team Calendar and every Event are deleted. B. Dissolution is allowed only when the creator is the sole member, with the same deletion result. C. The creator may dissolve a team that still has other members. Pending invitations and memberships end. Each Event moves to its creator's personal Calendar and keeps its visibility.
  - Count: A. Each team has exactly one team Calendar, created with the team. B. The creator may add more team Calendars. C. Each member has a separate team Calendar.
- **Assistant recommendation:** A for joining, dissolution, and the calendar count. B for leaving or removal.
- **User's choice:** A, B, C, and A in that order.
- **Final business rule:** A user may create more than one team and be a member of more than one team. Creating a team also creates its one team Calendar. The team does not gain another team Calendar. The team creator invites a person by username. That person becomes a member only by accepting while logged in. Declining or cancellation by the creator leaves the person out. A member may then create Events on that team's Calendar. A member may modify or delete only Events that member created. The team creator cannot modify or delete another person's Event and cannot see another person's private Event. A member may leave, and the creator may remove another member. Either action ends that membership immediately. The person can no longer create Events on that team Calendar. Events already there stay on it, with the same creator and visibility. Their creator can still modify or delete them. The creator may dissolve the team while other members remain. Dissolution ends that team Calendar, every membership, and every pending invitation. Each existing Event moves to its original creator's personal Calendar, keeps its public or private visibility, and can still be modified or deleted by that creator. A public Event remains visible to every logged-in user who can open the Calendar where it now resides. A private Event remains visible only to its creator.
- **Rationale:** The user selected those options and had already required the membership limits.
- **Consequences / scope impact:** DEC-013 places this entire rule after the first delivery and before the desktop app. DEC-004 and DEC-005 remain the earlier product's roster and removal rules. They are not this team's rules.
- **Related decisions:** DEC-013, DEC-014, DEC-017, DEC-020
- **Change history:** DEC-041 names where a former member modifies or deletes a retained team Event. DEC-042 states that the team creator is a member and the only administrator, and that leaving ends administration with no successor. DEC-043 states who can open the team Calendar. DEC-044 states the invitation boundaries. DEC-045 allows dissolution when the creator is the only current member and uses the same Event move. DEC-046 states that an ended team Event stays on the team Calendar until dissolution. DEC-063 makes team creation, acceptance, leaving, removal, and dissolution complete entirely or leave the prior state. The leave and removal rule in this decision remains.

## DEC-022 — Account deletion and identity reuse

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Account lifetime
- **Context / question:** Whether a user can delete the account, and whether the username and email can be used again.
- **Options considered:**
  - A. The user can delete the account. The personal Calendar and every Event are deleted immediately and are not restored. The user cannot log in. The email may be registered again. The username is never assigned again.
  - B. Deletion also allows the username to be registered again. The new account does not receive the deleted Events.
  - C. The first delivery does not offer account deletion.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** A user may delete that user's own account. Deletion removes the login, the personal Calendar, and every Event on it immediately. None of them is restored. The deleted username is not assigned to any later account. The same email may register a new account and choose a new username. The new account does not own the deleted Events.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** This rule covers the personal Calendar in the first delivery. The interview did not separately decide deletion of an account that still belongs to a team. That situation cannot occur until DEC-021 is delivered, and it remains unresolved for that later delivery.
- **Related decisions:** DEC-015, DEC-021, DEC-023
- **Change history:** DEC-047 states the search and link result after the account is deleted. The username remains unassigned.

## DEC-023 — Remaining registration details

- **Status:** OPEN
- **Date:** 2026-11-24
- **Topic:** Registration details
- **Context / question:** Which registration constraints are still undecided after DEC-015.
- **Options considered:** None. These items were left open so they would not block the confirmed baseline.
- **Assistant recommendation:** Leave them OPEN.
- **User's choice:** None yet.
- **Final business rule:** None. Username characters and length, password rules, verification-message lifetime, recovery-proof lifetime, and whether a user can change the account email are unresolved. They are not requirements.
- **Rationale:** The user authorized recording the confirmed decisions. These details were identified as remaining and not blocking.
- **Consequences / scope impact:** A later confirmation can replace this OPEN record without changing DEC-015.
- **Related decisions:** DEC-015, DEC-066
- **Change history:** DEC-066 adds the recovery-proof lifetime as an open item. It does not choose that lifetime. DEC-077 chooses the verification proof and leaves the verification-message lifetime open.

## DEC-024 — Cancel an unverified registration

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Unverified registration
- **Context / question:** An account exists before email verification and cannot log in. How can that registration release its username and email? This records the user's choice for review finding RR-01.
- **Options considered:**
  - A. The registrant can cancel the unverified registration without logging in. Cancellation releases the username and email for a new registration. Until cancellation, neither can be used for another account.
  - B. An unverified registration reserves only the username. The same email may be registered again.
  - C. The username and email stay reserved until that email is verified. The registrant cannot cancel early.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** A registration exists before its email is verified and cannot log in. Until the registrant cancels it or the email is verified, its username and email cannot be used for another account. The registrant may cancel that unverified registration without logging in. Cancellation removes the registration. The username and email may then be registered again. Verification-message lifetime remains OPEN in DEC-023.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-022 account deletion still applies to an account that can log in. It is not required to abandon an unverified registration. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-015, DEC-022, DEC-023, DEC-049
- **Change history:** DEC-049 states the email-and-password proof, the non-revealing failures, and which of cancellation or verification wins when both finish.

## DEC-025 — Login failure reveals nothing

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Login
- **Context / question:** What a login attempt shows for an unknown email, an unverified registration, and a wrong password. This records the user's choice for review finding RR-02.
- **Options considered:**
  - A. All three failures show the same result and do not say whether the email is registered. Only a verified email and the correct password open the personal Calendar.
  - B. Each failure states its own reason and can reveal that the email is registered or still unverified.
  - C. An unknown email and a wrong password share one result. An unverified email says that verification is still required.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** A login with a verified email and the correct password opens that user's personal Calendar. An unknown email, an unverified registration, and a wrong password all produce the same failure result. That result does not say whether an account or email exists. It does not say whether verification is still required.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-024 remains the way to abandon an unverified registration. This decision does not define account recovery. It does not approve the requirements baseline.
- **Related decisions:** DEC-015, DEC-024, DEC-026, DEC-051
- **Change history:** DEC-051 uses the same non-revealing result for a taken username, a taken email, and the start of recovery.

## DEC-026 — Password recovery for a verified account

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Account recovery
- **Context / question:** What recovery changes, and what an unknown or unverified email shows. This records the user's choice for review finding RR-03.
- **Options considered:**
  - A. Only a verified account can complete recovery. The user sets a new password, the old password stops working immediately, and the new password can log in. An unknown email and an unverified registration show the same non-revealing result as a failed login. An unverified registration is cancelled under DEC-024 and is not verified by recovery.
  - B. An unverified registration can also be verified and given a password through recovery. An unknown email still shows the non-revealing result.
  - C. Recovery signs the user in once and does not change the password.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** Only a verified account can complete recovery. Completion sets a new password and makes the previous password fail immediately. Completion does not open the personal Calendar. A later login with the new password opens it under DEC-025. An unknown email and an unverified registration produce the same failure result as DEC-025 and do not reveal whether an account exists. Recovery does not verify an unverified registration. Password composition remains OPEN in DEC-023.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-024 remains the exit for an unverified registration. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-015, DEC-024, DEC-025, DEC-023, DEC-051
- **Change history:** DEC-051 states that starting recovery shows the same result for an unknown email, an unverified registration, and a verified account. Only the verified account can still complete it. DEC-061 ends sessions already open when recovery completes. Completion does not open the Calendar. The new password opens it only through a later login. DEC-066 requires a one-time proof sent to that verified email before the new password is set.

## DEC-027 — Timezone change and future repeats

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Timezone change
- **Context / question:** When the user changes the calendar timezone and does not edit a repeating Event, what happens to future occurrences. This records the user's choice for review finding RR-05.
- **Options considered:**
  - A. Attached occurrences that have already occurred keep their absolute instants and change only their displayed clock time. Attached occurrences that have not occurred are expanded again at the same clock time in the new timezone. Detached and individually deleted occurrences are unchanged.
  - B. No existing Event moves. Future occurrences keep the instants from the previous timezone, and only their displayed clock time changes. Newly created Events use the new timezone.
  - C. Every attached occurrence, including those that have already occurred, moves to the same clock time in the new timezone.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** Changing the calendar timezone without editing a series does not change an attached occurrence that has already occurred, except the clock time displayed in the new timezone. Each attached occurrence that has not yet occurred is expanded again at its previous clock time in the new timezone. A future occurrence whose doubled start the creator has already chosen keeps that chosen absolute instant under DEC-070. A detached occurrence and an individually deleted occurrence stay as they were. A generated start that does not exist, or that occurs twice, follows DEC-028.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-018 still rejects a nonexistent entered time and requires a choice when an entered time occurs twice. DEC-028 defines a generated start that does not exist or occurs twice. A generated end that does not exist, and a later timezone change that makes a skipped or unchosen time valid, remain outside this decision. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-018, DEC-019, DEC-028
- **Change history:** DEC-028 defines a generated start that does not exist or occurs twice. The final rule above now points to that decision. DEC-070 keeps a chosen future doubled start at its chosen absolute instant.

## DEC-028 — Generated daylight-saving times

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Generated local times
- **Context / question:** What happens when a generated occurrence lands on a local time that does not exist or occurs twice. This records the user's choice for review finding RR-06.
- **Options considered:**
  - A. Duration stays on the clock, so 09:00 to 10:00 remains those clock times. A start that does not exist on that date produces no occurrence, the series remains, and the creator can see that the day was skipped. A start that occurs twice produces no occurrence until the creator chooses one. Until that choice, it is not included in conflict comparison.
  - B. A save or timezone change fails when any occurrence in the next 90 days has a missing or doubled local time.
  - C. A missing time moves automatically to the next valid time, and a doubled time uses the earlier instant automatically.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** A repeating Event keeps its clock-face duration. A generated start that does not exist on that date creates no occurrence. The series remains saved, and the creator can see that this date was skipped. A generated start that occurs twice creates no occurrence until the creator chooses one of the two instants. Before that choice, the occurrence is not saved and is not part of conflict comparison. An entered time still follows DEC-018.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** Skipping one generated occurrence does not delete the series and is not the monthly-date rejection in DEC-019. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-018, DEC-019, DEC-027, DEC-057
- **Change history:** DEC-057 skips a generated occurrence whose end is missing or whose interval crosses a missing local hour. A skipped date stays skipped, and an unchosen doubled start stays unchosen, after a later timezone change.

## DEC-029 — An occurrence in progress has occurred

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Series edit cutoff
- **Context / question:** Whether an occurrence that has started and has not ended is protected from a series edit or timezone re-expansion. This records the user's choice for review finding RR-07.
- **Options considered:**
  - A. An occurrence whose start has been reached has occurred, including one that is still in progress. A series edit and timezone re-expansion do not move it. Only an occurrence that has not started uses the new time.
  - B. Only an occurrence whose end has been reached has occurred. An in-progress occurrence moves with the series.
  - C. An in-progress occurrence ends at the current instant, and a new occurrence starts at the new time.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** An attached occurrence has occurred when its start has been reached, even if its end is still in the future. A series modification and a timezone re-expansion do not change that occurrence. Only an attached occurrence that has not started uses the new time or the re-expanded clock time. Detached and individually deleted occurrences remain unchanged.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-019's phrase "has already occurred" uses this cutoff. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-019, DEC-027
- **Change history:** None.

## DEC-030 — Conflict comparison and overlap

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Conflict comparison
- **Context / question:** Which owned occurrences are compared, whether a save overlaps itself, and whether touching endpoints overlap. This records the user's choice for review finding RR-08.
- **Options considered:**
  - A. Expand the creator's other repeating Events across the same 90 days from the save. Do not compare the occurrence or series being saved with its own occurrences. An end that equals the next start is not an overlap. Overlap means the two intervals share a positive length.
  - B. Use the same set, count a shared endpoint as an overlap, and warn when consecutive occurrences of the same series overlap one another.
  - C. Compare only individually stored Events, without expanding other series across the next 90 days.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** Conflict comparison expands every other repeating Event the creator owns across the 90 days from the save, using the same rules as the Event being saved. The occurrence or series being saved is not compared with its own attached occurrences. A detached occurrence is another owned Event and is compared. Two intervals overlap only when they share a positive length. An end that equals the next start is not an overlap. The warning still lists title, start, and end, and still does not block saving.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-020 remains the owner set, the 90-day window, and the displayed fields. A generated doubled start that is still waiting under DEC-028 is not an occurrence and is not compared. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-020, DEC-028, DEC-058
- **Change history:** DEC-058 compares a detached occurrence as another owned Event when the series is saved.

## DEC-031 — A deleted occurrence stays absent

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Deleted occurrence
- **Context / question:** Whether a later series edit restores an occurrence the creator deleted. This records the user's choice for review finding RR-09.
- **Options considered:**
  - A. The deleted occurrence stays absent. Later series edits, time changes, and timezone re-expansion do not generate that date again. Deleting the series removes these absence records with the series.
  - B. The deletion lasts only until the next series time change, which generates the date at the new time.
  - C. The deleted occurrence remains visible as cancelled after the series itself is deleted.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** Deleting one occurrence removes that occurrence and keeps it absent. A later series modification, time change, or timezone re-expansion does not generate it again. Deleting the series removes the series and its absence records. The absence is not a visible cancelled Event on the personal Calendar.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-019's one-occurrence deletion now survives later series edits. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-019, DEC-027, DEC-050, DEC-052
- **Change history:** DEC-050 states that a later series save keeps an absence or detachment that finished first, and that the later occurrence change wins when it finishes after the series save. DEC-052 identifies the absence by the deleted occurrence's original start instant.

## DEC-032 — Visibility changes and detachment

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Event visibility
- **Context / question:** Whether changing one occurrence's visibility detaches it, and which attached occurrences a series visibility change updates. This records the user's choice for review finding RR-10.
- **Options considered:**
  - A. Changing one occurrence's visibility detaches it. A later series change, including series visibility, does not affect it. Series visibility updates every occurrence still attached, including occurrences that have started. Those started occurrences change visibility only. Their time and other content stay.
  - B. A visibility-only change does not detach the occurrence. A later series time or visibility change still applies to it.
  - C. One occurrence's visibility change detaches it. Series visibility updates only occurrences that have not started.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** Changing the visibility of one occurrence detaches that occurrence. Later series modifications, including a series visibility change, do not affect it. Changing the series visibility changes every occurrence that is still attached, including occurrences that have started. For an occurrence that has started, a series save that changes visibility and does not change title, location, or description updates visibility and leaves its time and other content unchanged. Occurrences that have not started also receive the series visibility.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-017's series visibility rule now includes started attached occurrences and excludes detached occurrences. DEC-033 updates title, location, and description on started attached occurrences and leaves their times unchanged. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-017, DEC-019, DEC-029, DEC-054
- **Change history:** DEC-054 states that one series save applies visibility and text together. A visibility-only change still leaves the other content unchanged.

## DEC-033 — Series text updates attached history

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Series text
- **Context / question:** Whether a series change to title, location, or description updates occurrences that have already started. This records the user's choice for review finding RR-11.
- **Options considered:**
  - A. Title, location, and description update every occurrence still attached, including occurrences that have started. A started occurrence keeps its time. An occurrence that has not started uses the new text and any new time. A detached occurrence is unchanged.
  - B. Title, location, and description update only occurrences that have not started.
  - C. Title updates every attached occurrence. Location and description update only occurrences that have not started.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** A series modification of title, location, or description updates every occurrence still attached to the series, including occurrences that have started. An occurrence that has started keeps its time. An occurrence that has not started receives the new text and any new time in the same modification. A detached occurrence keeps its own title, location, description, time, and visibility.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-032 already keeps other content unchanged when the series change is visibility only. This decision applies when the series text itself changes. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-017, DEC-019, DEC-029, DEC-032, DEC-054
- **Change history:** DEC-054 states that title, location, and description in the same save as a visibility change still update a started attached occurrence.

## DEC-034 — Edit and delete one non-repeating Event

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Single Event edit and delete
- **Context / question:** What remains on the personal Calendar after a successful edit or deletion of an Event that does not repeat. This records the user's choice for review finding RR-17.
- **Options considered:**
  - A. A successful edit shows the new content immediately and does not keep the old content. A successful deletion removes the Event immediately, does not restore it, and removes it from later conflict comparison. A failed or cancelled deletion leaves the stored Event unchanged.
  - B. Deletion can be undone. Until it is undone, the Event is hidden and still included in conflict comparison.
  - C. Deletion hides the Event but keeps it in the creator's conflict comparison.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** A successful edit of a non-repeating Event replaces its stored content immediately. The previous content is not kept. A successful deletion removes that Event immediately. It cannot be restored and is not included in later conflict comparison. A deletion that fails or is cancelled leaves the stored Event unchanged.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-019 continues to govern repeating Events. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-017, DEC-020, DEC-019
- **Change history:** None.

## DEC-035 — Repetition kind is fixed at creation

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Repetition changes
- **Context / question:** Whether the creator can change an Event among non-repeating, daily, weekly, and monthly after it is saved. This records the user's choice for review finding RR-18.
- **Options considered:**
  - A. The repetition kind is fixed at creation. A non-repeating Event cannot become repeating, and daily, weekly, and monthly cannot change into one another. Changing kind requires deleting the Event and creating another. An edit that changes kind does not save, and the stored Event remains unchanged.
  - B. The creator may switch among all four. A monthly date must still exist in every month. Started occurrences keep their times, and occurrences that have not started follow the new kind.
  - C. A non-repeating Event may become repeating. A repeating Event cannot change to another kind or back to non-repeating.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** The choice among non-repeating, daily, weekly, and monthly is fixed when the Event is first saved. A later edit cannot change that choice. An edit that attempts the change writes nothing, and the stored Event remains unchanged. The creator may delete the Event and create a new Event with another repetition kind.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-034 deletion is the way to leave the old kind. The new Event does not inherit detached occurrences or absence records from the deleted Event. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-019, DEC-034
- **Change history:** None.

## DEC-036 — Conflict warning wording

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Conflict warning
- **Context / question:** What the creator sees when a save has no overlap, overlap only inside 90 days, or overlap only after 90 days. This records the user's choice for review finding RR-19.
- **Options considered:**
  - A. No overlap shows no conflict warning, and the save still succeeds. Overlaps inside 90 days are listed. Saving a series also says the repetition continues after 90 days. That sentence means only that the series continues. It does not mean a conflict was found after 90 days. Overlaps after 90 days are not detected and are not listed.
  - B. Overlaps after 90 days are also detected. If the only overlaps are after 90 days, the warning says a later conflict exists and does not list each date.
  - C. Saving a series always says the repetition continues, even when there is no overlap. Overlaps after 90 days are not detected.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** A save with no overlap inside 90 days shows no conflict warning and still succeeds. When overlaps exist inside those 90 days, the warning lists them. Saving a series also says the repetition continues after 90 days. That sentence means only that the series continues. It does not mean a conflict was found after 90 days. Overlaps after 90 days are not detected and are not listed.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-020 and DEC-030 still define the comparison set, the 90-day window, and what an overlap is. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-020, DEC-030, DEC-053
- **Change history:** DEC-053 defines which overlaps are inside the 90 calendar dates, including a partial overlap at the far boundary. DEC-078 states that a series save with no overlap still says the repetition continues, and that sentence is not a conflict warning.

## DEC-037 — Nickname display after a change

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Display name
- **Context / question:** What a blank or space-only nickname means, and which nickname an existing public Event shows after a change. This records the user's choice for review finding RR-16.
- **Options considered:**
  - A. A nickname that is empty after outer whitespace is removed counts as no nickname. The display name is the username. Changing the nickname updates the account display name immediately. When another person can later open the Calendar, a public Event shows the current nickname, or the username when there is none, without saving the Event again.
  - B. A space-only nickname is stored and displayed as entered. An existing public Event keeps the nickname from its last save until that Event is saved again.
  - C. A nickname cannot be changed after a public Event exists. A blank nickname still counts as no nickname.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** A nickname that is empty after outer whitespace is removed counts as no nickname, and the display name is the username. Changing the nickname updates the account display name immediately. A public Event shows the current nickname, or the username when there is none, without another Event save.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** Other people still cannot open a personal Calendar in the first delivery. The public display applies when that opening becomes available. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-015, DEC-016, DEC-017, DEC-062
- **Change history:** DEC-062 removes outer whitespace before a non-empty nickname is stored. Display and nickname search use that stored value.

## DEC-038 — Logged-out Calendar access

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Personal Calendar access
- **Context / question:** What a logged-out person, including the owner after logout, can see when opening the personal Calendar. This records the user's choice for review finding RR-22.
- **Options considered:**
  - A. A logged-out person, including the owner after logout, cannot open the personal Calendar and cannot see any Event on it. Continuing requires login. After login, the owner sees that owner's Calendar. In the first delivery, another logged-in user still cannot open someone else's Calendar.
  - B. After logout, the owner can still see that owner's Calendar by opening its address directly. Another logged-out person cannot.
  - C. A logged-out person can see the public Events on that Calendar. Private Events stay hidden.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** A logged-out person, including the owner after logout, cannot open the personal Calendar and cannot see any Event on it. Continuing requires login. After login, the owner sees that owner's Calendar. In the first delivery, another logged-in user still cannot open someone else's Calendar.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** This decision does not choose a session length. It does not approve the requirements baseline.
- **Related decisions:** DEC-016, DEC-025
- **Change history:** None.

## DEC-039 — Completed save and complete deletion

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Save and account deletion
- **Context / question:** Which content remains when two sessions save the same Event, and what remains when account deletion stops early. This records the user's choice for review finding RR-23.
- **Options considered:**
  - A. The same account may save twice. Each successful save replaces the stored Event with that save's complete content. When both succeed, the stored Event is the content of the save that finishes last. A failed save writes nothing. Account deletion has one result: the login, personal Calendar, and all its Events disappear together, or the account stays unchanged. A deletion that stops early does not remove the login while leaving the Events, and does not remove the Events while leaving the login.
  - B. The save that starts first is kept. A later save of the same Event writes nothing even when its content is valid. Deletion has the same all-or-nothing result as A.
  - C. Two saves merge field by field. Deletion may remove the login first and the Events later, and that incomplete account can be seen.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** The same account may save twice. Each successful save replaces the stored Event with that save's complete content. When both succeed, the stored Event is the content of the save that finishes last. A failed save writes nothing. Account deletion has one result: the login, personal Calendar, and all its Events disappear together, or the account stays unchanged. A deletion that stops early does not remove the login while leaving the Events, and does not remove the Events while leaving the login.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** This decision does not choose a locking mechanism. It does not import DEC-009. It does not approve the requirements baseline.
- **Related decisions:** DEC-022, DEC-034, DEC-050
- **Change history:** DEC-050 states that a save finishing after completed account deletion writes nothing, and that completed deletion still removes a save that finished first.

## DEC-040 — A sharing link addresses one Calendar

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Sharing link
- **Context / question:** Whether a sharing link is an address for an existing Calendar or a separate Calendar, who creates and revokes it, and whether one Event is in one Calendar. This records the user's choice for review finding RR-12. It is outside the first delivery.
- **Options considered:**
  - A. A sharing link is an address for one existing Calendar, not another Calendar. The user creates and revokes links to that user's personal Calendar. The person who created a team creates and revokes links to that team Calendar. One Calendar may have more than one link. Revoking one link removes only that address. The Calendar, its Events, and the other links remain. One Event is in exactly one Calendar at a time. A logged-in user who can open that Calendar sees the same public Events through the link. Private Events stay hidden. A logged-out person sees no Events through the link.
  - B. A sharing link is a new empty Calendar. The user copies Events into it, and each copy is another Event. Revoking the link deletes that new Calendar and its copies. The original Calendar stays unchanged.
  - C. A sharing link can address only a personal Calendar. Creation, revocation, and one Event in one Calendar otherwise match A.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** A sharing link is an address for one existing Calendar, not another Calendar. The user creates and revokes links to that user's personal Calendar. The person who created a team creates and revokes links to that team Calendar. One Calendar may have more than one link. Revoking one link removes only that address. The Calendar, its Events, and the other links remain. One Event is in exactly one Calendar at a time. A logged-in user who can open that Calendar sees the same public Events through the link. Private Events stay hidden. A logged-out person sees no Events through the link.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-014's statement that a sharing link is itself a Calendar is clarified by this decision. Search, the personal calendar page, sharing links, and teams remain outside the first delivery. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-014, DEC-016, DEC-017, DEC-021, DEC-059
- **Change history:** DEC-059 states that a revoked link, a team link stopped by the creator leaving or by dissolution, and a link after account deletion open no Calendar and show no Event.

## DEC-041 — Where a former member edits a team Event

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Team Events after leaving
- **Context / question:** Where a former member modifies or deletes Events that remain on a team Calendar, and what else that person can see. This records the user's choice for review finding RR-13. It is outside the first delivery.
- **Options considered:**
  - A. The Event stays on the team Calendar. The former member opens a list in that member's own account. The list contains only Events that member still owns on teams the member has left. From the list, the former member can see, modify, and delete those Events. The former member cannot open the rest of the team Calendar, cannot see another person's Events, and cannot create a team Event or manage the team. Current members still see the Event on the team Calendar according to its visibility.
  - B. The former member can open the whole team Calendar, see everything a current member can see, and modify or delete only Events that member created.
  - C. On leaving, those Events move immediately to the former member's personal Calendar and disappear from the team Calendar. This would change the confirmed rule that leaving leaves the Events on the team Calendar.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** An Event that remains after its creator leaves stays on the team Calendar. That former member opens a list in that member's own account containing only Events that member still owns on teams the member has left. From the list, the former member can see, modify, and delete those Events. The former member cannot open the rest of the team Calendar, cannot see another person's Events, and cannot create a team Event or manage the team. Current members still see the retained Event on the team Calendar according to its visibility.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-021 still keeps the Event on the team Calendar. DEC-040 still places the Event in one Calendar. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-021, DEC-040, DEC-055
- **Change history:** DEC-055 uses this list for removal as well as leaving, and ends that team's list entry when the former member becomes a current member again.

## DEC-042 — The team creator is a member and the only administrator

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Team administration
- **Context / question:** Whether creating a team makes that person a member, and who administers the team after that person leaves. This records the user's choice for review finding RR-14. It is outside the first delivery.
- **Options considered:**
  - A. The person who creates a team becomes a member immediately and can create the first team Event. While that person remains a member, that person is the only administrator and handles invitations, removal, dissolution, and creating or revoking the team Calendar's sharing links. When that person leaves, membership and administration both end and nobody succeeds. The team and its Calendar remain. Other members remain and may still create their own Events. Pending invitations end and can no longer be accepted. Existing team sharing links stop opening. The Calendar and its Events are not deleted for that reason. Events that person still owns follow DEC-041.
  - B. The person who creates a team is not a member and can only administer it. Creating an Event requires that person to invite and accept themselves. The result after leaving matches A.
  - C. After the creator leaves, the earliest remaining member becomes the administrator and takes over invitations, removal, dissolution, and sharing links.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** The person who creates a team becomes a member immediately and can create the first team Event. While that person remains a member, that person is the only administrator and handles invitations, removal, dissolution, and creating or revoking the team Calendar's sharing links. When that person leaves, membership and administration both end and nobody succeeds. The team and its Calendar remain. Other members remain and may still create their own Events. Pending invitations end and can no longer be accepted. Existing team sharing links stop opening. The Calendar and its Events are not deleted for that reason. Events that person still owns follow DEC-041.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** After the creator leaves, nobody can invite, remove a member, dissolve the team, or manage its sharing links. This decision does not import DEC-004. It does not approve the requirements baseline.
- **Related decisions:** DEC-021, DEC-040, DEC-041
- **Change history:** None.

## DEC-043 — Who can open a team Calendar

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Team Calendar audience
- **Context / question:** Which people can open a team Calendar, and which Events they see. This records the user's choice for review finding RR-15. It is outside the first delivery.
- **Options considered:**
  - A. A current member can open the team Calendar, see every public Event, and see private Events that member created. That member cannot see another person's private Event. Any other logged-in user can open the team Calendar and sees only public Events. A logged-out person cannot open it and sees no Event. A former member still cannot open the rest of the team Calendar and uses the retained-Event list from DEC-041.
  - B. Only a current member can open the team Calendar. Another logged-in user cannot open it, including through a sharing link. A logged-out person cannot open it.
  - C. A logged-out person can see the public Events on a team Calendar. Private Events stay hidden.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** A current member can open the team Calendar, see every public Event, and see private Events that member created. That member cannot see another person's private Event. Any other logged-in user can open the team Calendar and sees only public Events. A logged-out person cannot open it and sees no Event. A former member still cannot open the rest of the team Calendar and uses the retained-Event list from DEC-041.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-042 still stops a team sharing link from opening after the team creator leaves. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-016, DEC-017, DEC-021, DEC-041, DEC-042
- **Change history:** None.

## DEC-044 — Invitation boundaries

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Team invitations
- **Context / question:** What happens for an unknown username, an existing member, a duplicate invitation, acceptance by the wrong logged-in user, and acceptance after the invitation has ended. This records the user's choice for review finding RR-20. It is outside the first delivery.
- **Options considered:**
  - A. An unknown username creates no invitation and no account. An existing member receives no invitation, and that membership stays unchanged. A pending invitation to the same person for the same team is not duplicated, and the pending invitation remains. Only the invited account can accept, and only while that account is logged in. Another logged-in user cannot accept it and does not become a member. Acceptance after the invitation has ended does not add a member. An invitation ends when it is declined, cancelled by the creator, ended because the creator leaves, or ended because the team is dissolved.
  - B. An invitation to a username that does not yet exist is kept. That person may accept after registering that username. The other results match A.
  - C. Several invitations to the same member may exist at the same time. Accepting any one of them makes that user a member. An unknown username still creates no invitation.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** An unknown username creates no invitation and no account. An existing member receives no invitation, and that membership stays unchanged. A pending invitation to the same person for the same team is not duplicated, and the pending invitation remains. Only the invited account can accept, and only while that account is logged in. Another logged-in user cannot accept it and does not become a member. Acceptance after the invitation has ended does not add a member. An invitation ends when it is declined, cancelled by the creator, ended because the creator leaves, or ended because the team is dissolved.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-021 still requires a logged-in acceptance before membership. DEC-042 still ends pending invitations when the creator leaves. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-015, DEC-021, DEC-042, DEC-060
- **Change history:** DEC-060 places the invitation in the invited account, limits decline to that account, treats an unverified or retired username as unknown, and names the list fields.

## DEC-045 — Sole-member dissolution

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Team dissolution
- **Context / question:** Whether the team creator may dissolve a team while that creator is the only current member, and where its Events go. This records the user's choice for review finding RR-21. It is outside the first delivery.
- **Options considered:**
  - A. The creator may dissolve the team while that creator is the only current member. The result matches dissolution while other members remain. The team Calendar, membership, and pending invitations end. Each Event moves to its original creator's personal Calendar, including an Event left by a former member. Visibility is unchanged. This does not allow dissolution after the creator has already left.
  - B. A team with only one current member cannot be dissolved. The creator may leave. The team and Calendar remain, administration ends, and nobody can dissolve it afterward.
  - C. The only member may dissolve the team, and every Event on the team Calendar is deleted instead of moved.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** The creator may dissolve the team while that creator is the only current member. The result matches dissolution while other members remain. The team Calendar, membership, and pending invitations end. Each Event moves to its original creator's personal Calendar, including an Event left by a former member. Visibility is unchanged. The original creator can still modify or delete Events that creator owns. This does not allow dissolution after the creator has already left.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-042 still prevents dissolution after the creator leaves. DEC-040 still places each moved Event in exactly one Calendar. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-021, DEC-040, DEC-042, DEC-052
- **Change history:** DEC-052 states that an absence moves with its series when dissolution moves the series.

## DEC-046 — Where an ended team Event stays

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Team Event lifetime
- **Context / question:** Where a team Event stays after it ends and before the team is dissolved. DEC-019 says ended occurrences stay on the personal Calendar. DEC-021 says team Events stay on the team Calendar until dissolution. This records the user's choice for review finding RR-24. It is outside the first delivery.
- **Options considered:**
  - A. An ended team Event stays on the team Calendar until dissolution. Dissolution moves it to its original creator's personal Calendar with the other Events. The DEC-019 sentence about ended occurrences staying on the personal Calendar applies only to an Event stored on that personal Calendar. An ended team Event that its creator still owns continues to participate in that creator's conflict comparison.
  - B. When one occurrence ends, only that occurrence moves to the original creator's personal Calendar. The rest of the series stays on the team Calendar. The same Event is then in two Calendars.
  - C. Once any occurrence has ended, the whole team Event moves immediately to the original creator's personal Calendar, even when later occurrences have not started.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** An ended team Event stays on the team Calendar until the team is dissolved. Dissolution moves that ended Event to its original creator's personal Calendar together with the other Events. The rule that an ended occurrence stays on the personal Calendar applies only to an Event stored on that personal Calendar. An ended team Event that its creator still owns continues to participate in that creator's conflict comparison.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-040 still places each Event in exactly one Calendar. DEC-020 already compares Events the creator still owns on a team Calendar. DEC-045 still moves every Event, including an ended one, when the sole current member dissolves the team. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-019, DEC-020, DEC-021, DEC-040, DEC-045
- **Change history:** None.

## DEC-047 — A deleted username reaches no account

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Deleted identity
- **Context / question:** What a username search, a nickname search, and the old personal-calendar link show after the account is deleted. This records the user's choice for review finding RR-26. It is outside the first delivery.
- **Options considered:**
  - A. Username search finds no user. Nickname search does not list the deleted account. Opening the old link opens no Calendar and shows no Event, whether or not the visitor is logged in. A later account that reuses the email has its own username and link. The old username and old link do not open that new account.
  - B. Username search and the old link say the account was deleted. They show no Event and no email. Nickname search does not list the deleted account. The new account stays separate.
  - C. Username search and the old link show the deleted account's former public Events as read-only history, with no login and no email. The new account stays separate.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** After an account is deleted, username search finds no user. Nickname search does not list that deleted account. Opening its old personal-calendar link opens no Calendar and shows no Event, whether or not the visitor is logged in. A later account that reuses the email has its own username and its own link. The old username and the old link do not open that new account.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-022 still retires the username and deletes the personal Calendar and its Events. DEC-015 still uses the username for search and the personal-calendar link while the account exists. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-015, DEC-022, DEC-038
- **Change history:** None.

## DEC-048 — Search result fields and match

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Search results
- **Context / question:** Which fields distinguish several nickname-search results, and how a username search matches. This records the user's choice for review finding RR-27. It is outside the first delivery.
- **Options considered:**
  - A. Each result shows the current nickname and the username. With no nickname, the display name is the username and the result still includes the username. The email is not shown. A username search matches the entire username and returns at most that one account, with the same fields. A nickname search lists only accounts whose current nickname equals the entire searched text. It does not list a nickname that merely contains that text. Another person's username does not appear in a username search merely because it equals some nickname.
  - B. Each result shows only the nickname. Two identical nicknames cannot be distinguished before one is opened. A username search still returns at most one user.
  - C. Each result shows the nickname, the username, and whether that person's personal Calendar has a public Event. The email is still absent. The match rules are the same as A.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** Each search result shows the current nickname and the username. With no nickname, the display name is the username and the result still includes the username. The email is not shown. A username search matches the entire username and returns at most that one account, with the same fields. A nickname search lists only accounts whose current nickname equals the entire searched text. It does not list a nickname that merely contains that text. Another person's username does not appear in a username search merely because it equals some nickname.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-015 still allows duplicate nicknames and keeps email out of search results. DEC-047 still excludes a deleted account from both searches. DEC-037 still uses the current nickname as the display name. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-015, DEC-037, DEC-047, DEC-064
- **Change history:** DEC-064 requires login before search. A no-match and an empty search return no user.

## DEC-049 — Proof for cancelling an unverified registration

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Unverified registration
- **Context / question:** What proves that a person may cancel an unverified registration without logging in, what an unknown email, a wrong password, and a verified account produce, and which result wins when cancellation and verification both finish. This records the user's choice for review finding RR2-01.
- **Options considered:**
  - A. The person submits the registration email and password. An unknown email, a wrong password, and an already verified account all produce the same non-revealing failure and change nothing. Only an unverified registration whose email and password both match is cancelled. If verification finishes first, the later cancellation fails and the account stays verified. If cancellation finishes first, verification finds no registration and creates no account. A verified account cannot be cancelled by this path.
  - B. The person submits only the email. An unknown email and a verified account produce the same non-revealing result. Someone who knows the email can cancel the unverified registration. The race with verification matches A.
  - C. Cancellation uses a link sent to that email. An unknown email and a verified account produce the same non-revealing result. The link works only while the registration is still unverified. If verification finishes first, the link stops working.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** Cancelling an unverified registration without logging in requires the registration email and password. An unknown email, a wrong password, and an already verified account all produce the same failure result. That result does not reveal whether an account exists, and it changes nothing. Only an unverified registration whose email and password both match is cancelled. If verification finishes first, the later cancellation fails and the account stays verified. If cancellation finishes first, verification finds no registration and creates no account. A verified account cannot be cancelled by this path.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-024 still lets the registrant cancel without logging in and then reuse the username and email. DEC-022 still deletes a verified account only through account deletion. DEC-025's non-revealing login result is the same kind of result used here. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-022, DEC-024, DEC-025
- **Change history:** None.

## DEC-050 — Absence, detachment, and deletion races

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Concurrent Event changes
- **Context / question:** What remains when one session deletes or detaches an occurrence and another session later saves the series, and what remains when a save overlaps account deletion. This records the user's choice for review finding RR2-02.
- **Options considered:**
  - A. An absence and a detached occurrence are kept. A later series save may change occurrences that have not started, but it does not restore a deleted occurrence and does not reattach a detached occurrence. If the series save finishes first and the deletion or detachment finishes later, the later change wins. A save that finishes after account deletion has completed writes nothing. If the save finishes first and account deletion then completes, deletion still removes the login, personal Calendar, and every Event, including that save. An operation that does not finish leaves the prior state.
  - B. The series save that finishes last replaces the whole Event and restores a deleted occurrence. Between a save and account deletion, the one that finishes last wins entirely. A save that finishes last leaves the account in place with that save. Deletion that finishes last removes the account and its Events.
  - C. The first completed deletion or detachment always wins, even when an earlier series save finishes later. A save and account deletion cannot overlap. The one that starts second fails, and the first completed result remains.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** An absence and a detached occurrence are kept. A later series save may change occurrences that have not started, but it does not restore a deleted occurrence and does not reattach a detached occurrence. If the series save finishes first and the deletion or detachment finishes later, the later change wins. A save that finishes after account deletion has completed writes nothing. If the save finishes first and account deletion then completes, deletion still removes the login, personal Calendar, and every Event, including that save. An operation that does not finish leaves the prior state.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-031 still keeps a deleted occurrence absent through a later series time change. DEC-039 still lets the last finished ordinary save replace Event content and still makes account deletion all or nothing. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-031, DEC-034, DEC-039, DEC-068
- **Change history:** DEC-068 states that a detachment finishing after a series save stores the complete content submitted with that detachment.

## DEC-051 — Registration and recovery reveal nothing

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Registration and recovery privacy
- **Context / question:** What registration shows when a username or email is already held, and what starting recovery shows for a verified account. This records the user's choice for review finding RR2-03. How a recovery message is delivered remains OPEN in DEC-023.
- **Options considered:**
  - A. A taken username, an email held by an unverified registration, and an email held by a verified account all produce the same registration failure. That result does not say which value is taken or whether an account is verified, and no second account is created. Starting recovery shows the same result for an unknown email, an unverified registration, and a verified account. That result does not reveal whether an account exists or is verified. Only a verified account can later complete recovery and set a new password.
  - B. Registration says whether the username or the email is taken. It does not say whether the email is verified. Starting recovery for a verified account says that recovery was sent. An unknown email and an unverified registration stay non-revealing.
  - C. Registration says whether the email is already verified. Starting recovery for a verified account opens the new-password step directly. An unknown email and an unverified registration stay non-revealing.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** A taken username, an email held by an unverified registration, and an email held by a verified account all produce the same registration failure. That result does not say which value is taken or whether an account is verified, and no second account is created. Starting recovery shows the same result for an unknown email, an unverified registration, and a verified account. That result does not reveal whether an account exists or is verified. Only a verified account can later complete recovery and set a new password.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-025 still uses one non-revealing login failure. DEC-026 still lets only a verified account complete recovery. DEC-066 states the completion proof. DEC-023 still leaves the recovery-proof lifetime open. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-015, DEC-024, DEC-025, DEC-026, DEC-066
- **Change history:** DEC-066 states that completion uses a one-time proof sent only to the verified account's email. DEC-075 sends that proof when recovery starts, and only for a verified account.

## DEC-052 — Identity of a deleted occurrence

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Deleted occurrence
- **Context / question:** What identifies an occurrence that stays absent after deletion, and what a weekday change, a timezone re-expansion, and a move to another Calendar suppress. This records the user's choice for review finding RR2-04. The move applies when a team Event is dissolved; the identity applies in the first delivery.
- **Options considered:**
  - A. The absence remembers the original start instant of the deleted occurrence, which is its place in the series. A weekday change does not move the absence onto the new weekday. That original occurrence stays absent, and the new weekday's other occurrences appear. Timezone re-expansion does not recreate that same occurrence at the new clock instant. Moving the series to another Calendar, including dissolution, keeps the absence with the series. Deleting the series removes the absence records.
  - B. The absence remembers the calendar date. That date stays absent after a weekday or timezone change whenever an occurrence would still fall on it. The absence moves with the series.
  - C. The absence remembers the occurrence's position in the series. After a weekday change, the corresponding occurrence on the new weekday stays absent. After a timezone change, the re-expanded occurrence in that same position stays absent. The absence moves with the series.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** An absence remembers the original start instant of the deleted occurrence, which is its place in the series. A weekday change does not move the absence onto the new weekday. That original occurrence stays absent, and the new weekday's other occurrences appear. Timezone re-expansion does not recreate that same occurrence at the new clock instant. Moving the series to another Calendar, including dissolution, keeps the absence with the series. Deleting the series removes the absence records.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-031 still keeps the deleted occurrence absent and removes the absence when the series is deleted. DEC-027 still re-expands other attached occurrences that have not occurred. DEC-045 still moves the series to the original creator's personal Calendar, and this decision moves its absences with it. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-027, DEC-031, DEC-045, DEC-067
- **Change history:** DEC-067 states that a later clock-time change on the same weekday does not create the new time on the deleted occurrence's date.

## DEC-053 — Conflict window of 90 calendar dates

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Conflict warning
- **Context / question:** How the 90-day comparison window is counted, whether overlaps before the save instant and overlaps already in progress are included, and whether a partial overlap at the far boundary counts. This records the user's choice for review finding RR2-05.
- **Options considered:**
  - A. The 90 days are 90 calendar dates in the creator's current calendar timezone, starting on the calendar date of the save and including that date. An overlap is warned when the shared time falls inside that window, including an overlap entirely before the save instant and an overlap with an occurrence that has already started. An occurrence that crosses the far boundary counts when any positive shared length is inside the window. An overlap entirely after the window is not detected.
  - B. The 90 days are 90 periods of 24 hours starting at the save instant. An overlap entirely before the save instant is not compared. An occurrence that has already started is compared. A partial overlap at the far boundary counts.
  - C. Only overlaps after the save instant and inside the next 90 calendar dates are compared. A past overlap and an occurrence that started before the save do not warn. A partial overlap at the far boundary counts only when the whole overlap is inside the window.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** The 90 days are 90 calendar dates in the creator's current calendar timezone, starting on the calendar date of the save and including that date. An overlap is warned when the shared time falls inside that window, including an overlap entirely before the save instant and an overlap with an occurrence that has already started. An occurrence that crosses the far boundary counts when any positive shared length is inside the window. An overlap entirely after the window is not detected.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-020 still compares only Events the creator still owns and still does not block saving. DEC-030 still treats only a shared positive length as overlap. DEC-036 still withholds a warning when no overlap is inside the window and still does not detect overlaps entirely after it. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-018, DEC-020, DEC-030, DEC-036
- **Change history:** None.

## DEC-054 — One series save applies each field

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Series save
- **Context / question:** What one series save does when it changes visibility together with title, location, or description. This records the user's choice for review finding RR2-06.
- **Options considered:**
  - A. Each field follows its own rule in the same save. A started occurrence that is still attached receives the new visibility, title, location, and description, and keeps its time. An occurrence that has not started receives the new time, visibility, title, location, and description. A detached occurrence is unchanged.
  - B. A started occurrence receives only the new visibility and keeps its previous title, location, description, and time. An occurrence that has not started receives every new field.
  - C. A series that already has a started occurrence cannot change visibility and text in the same save. That save writes nothing, and the stored series remains unchanged.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** In one series save, each field follows its own rule. A started occurrence that is still attached receives the new visibility, title, location, and description, and keeps its time. An occurrence that has not started receives the new time, visibility, title, location, and description. A detached occurrence is unchanged.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-032 still updates visibility on a started attached occurrence and, when the save changes visibility only, leaves its other content unchanged. DEC-033 still updates title, location, and description on that occurrence. DEC-019 still withholds a time change from a started occurrence. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-019, DEC-032, DEC-033
- **Change history:** None.

## DEC-055 — Removal uses the retained-Event list

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Team membership
- **Context / question:** Whether removal uses the same retained-Event list as leaving, and what happens to that list when the former member joins the team again. This records the user's choice for review finding RR2-07. It is outside the first delivery.
- **Options considered:**
  - A. Removal uses the same list as leaving. The removed member can see, modify, and delete only Events that member still owns from that list, and cannot open the rest of the team Calendar. When that person later accepts an invitation and becomes a current member again, the list entry for that team ends. Those Events remain only on the team Calendar. The member edits them from the team Calendar, not from a second list.
  - B. Removal does not create a list. The edit right remains, but there is no place to use it until the person rejoins. After rejoining, the member edits from the team Calendar. A list created by leaving is unchanged.
  - C. Removal uses the list. After rejoining, the Events remain both on the team Calendar and on the list until the member deletes the list entry.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** Removal uses the same retained-Event list as leaving. The removed member can see, modify, and delete only Events that member still owns from that list, and cannot open the rest of the team Calendar. When that person later accepts an invitation and becomes a current member again, the list entry for that team ends. Those Events remain only on the team Calendar. The member edits them from the team Calendar, not from a second list.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-041 still limits the list to Events the former member owns and still keeps those Events on the team Calendar. DEC-040 still places each Event in exactly one Calendar. DEC-044 still requires the invited account to accept before becoming a member again. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-021, DEC-040, DEC-041, DEC-044
- **Change history:** None.

## DEC-056 — Viewer clock time

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Timezone display
- **Context / question:** Which timezone another logged-in user sees for a start and end, and whether that timezone is shown. This records the user's choice for review finding RR2-08. It is outside the first delivery.
- **Options considered:**
  - A. The viewer sees the same absolute start and end converted to the viewer's current calendar timezone, and the timezone is shown. The creator continues to see the creator's timezone. The stored instant does not change. Whether two Events overlap remains an absolute comparison and does not change with the viewer's timezone.
  - B. Everyone sees the creator's clock time, and the creator's timezone is shown. The viewer's timezone is not used for that display.
  - C. Everyone sees the creator's clock time, and no timezone is shown.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** Another logged-in viewer sees the same absolute start and end converted to the viewer's current calendar timezone, and the timezone is shown. The creator continues to see the creator's timezone. The stored instant does not change. Whether two Events overlap remains an absolute comparison and does not change with the viewer's timezone.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-018 still gives each user one calendar timezone and still keeps saved instants unchanged. DEC-020 still compares only the creator's owned Events. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-017, DEC-018, DEC-020
- **Change history:** None.

## DEC-057 — Generated gap and later timezone change

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Generated local times
- **Context / question:** What happens when a generated end does not exist or the interval crosses a missing local hour, and whether a skipped date or an unchosen doubled start appears after a later timezone change. This records the user's choice for review finding RR2-09.
- **Options considered:**
  - A. When the generated start exists and the generated end does not, or the interval would cross a missing local hour, that occurrence is skipped. The series remains. The creator can see that the date was skipped. The occurrence is not shortened and is not stored with a nonexistent clock time. After a later timezone change, a skipped date stays skipped, even when the old clock time exists once in the new timezone. A doubled start that is still waiting stays unchosen until the creator chooses one instant in the timezone that applies at the choice. The creator can see that a choice is required. Until the choice, it is not part of conflict comparison.
  - B. A missing end shortens the occurrence to the last existing minute. A later timezone change that makes the old clock time unambiguous creates the skipped or unchosen occurrence automatically.
  - C. A missing end skips the occurrence. A later timezone change creates it automatically when the clock time exists once. When two instants remain, the creator must choose before it appears.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** When a generated start exists and the generated end does not, or the generated interval would cross a missing local hour, that occurrence is skipped. The series remains. The creator can see that the date was skipped. The occurrence is not shortened and is not stored with a nonexistent clock time. After a later timezone change, a skipped date stays skipped, even when the old clock time exists once in the new timezone. A doubled start that is still waiting stays unchosen until the creator chooses one instant in the timezone that applies at the choice. The creator can see that a choice is required. Until the choice, it is not part of conflict comparison.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-028 still skips a missing generated start and still waits for a choice when a generated start occurs twice. DEC-027 still re-expands other attached occurrences that have not occurred. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-018, DEC-027, DEC-028, DEC-069, DEC-071
- **Change history:** DEC-069 states that an unchosen doubled start still offers its two original absolute instants when the current timezone no longer doubles that clock time. DEC-071 keeps a skipped date skipped after a series time change.

## DEC-058 — A detached occurrence is compared

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Conflict warning
- **Context / question:** Whether saving a series warns about overlap with an occurrence that was detached from that series. This records the user's choice for review finding RR2-10.
- **Options considered:**
  - A. A detached occurrence is another Event the creator still owns. Saving the series compares it with that occurrence and warns when they overlap. It is not excluded as one of the series' own occurrences.
  - B. A detached occurrence stays excluded from the series that produced it. Saving the series does not warn about overlap with it.
  - C. The warning appears only when the creator saves the detached occurrence. Saving the original series does not warn.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** A detached occurrence is another Event the creator still owns. Saving the series compares it with that occurrence and warns when they overlap. It is not excluded as one of the series' own occurrences.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-020 still compares every other Event the creator still owns. DEC-030 still excludes the series from its own attached occurrences and still requires a shared positive length. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-019, DEC-020, DEC-030
- **Change history:** None.

## DEC-059 — An ended sharing link opens nothing

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Sharing link
- **Context / question:** What a visitor sees for a revoked personal link, a team link that stops because its creator left, a team link after dissolution, and a sharing link after account deletion. This records the user's choice for review finding RR2-11. It is outside the first delivery.
- **Options considered:**
  - A. For all four links, a logged-out person and a logged-in person open no Calendar and see no Event. The result does not say whether the Calendar used to exist. A live link still follows DEC-040.
  - B. A logged-out person and a logged-in person both see that the link has ended. They see no Event and no email.
  - C. A logged-in person opening a revoked personal link still sees its public Events until the account is deleted. The other three links open no Calendar and show no Event. A logged-out person sees nothing through any of the four.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** A revoked personal sharing link, a team sharing link that stops because its creator left, a team sharing link after dissolution, and a sharing link after account deletion all open no Calendar and show no Event. This is the same for a logged-out person and a logged-in person. The result does not say whether the Calendar used to exist. A live link still follows DEC-040.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-040 still shows public Events through a live link to a logged-in user who can open that Calendar, and still shows no Event to a logged-out person. DEC-042 still stops existing team links when the creator leaves. DEC-047 still makes the old username link open nothing. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-040, DEC-042, DEC-045, DEC-047, DEC-072
- **Change history:** DEC-072 gives a team link revoked while its creator remains the same visitor result.

## DEC-060 — Where an invitation is accepted

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Team invitations
- **Context / question:** Where the invited account accepts or declines, who may decline, what an unverified or retired username produces, and which fields the member and pending-invitation lists show. This records the user's choice for review finding RR2-12. It is outside the first delivery.
- **Options considered:**
  - A. A verified invited account sees the invitation in that account after logging in. Only that logged-in account can accept or decline. Another logged-in user cannot decline it. An unverified username and a retired username produce the same result as an unknown username: no invitation and no account. The administrator sees current members and pending invitations. Each row shows the current nickname and the username. With no nickname, it shows the username. The email is not shown. A current member sees the member list with the same fields and does not see pending invitations.
  - B. Any logged-in user who knows the username can decline. An invitation to an unverified username is kept until that username is verified. The administrator's member list shows the email. A current member does not see the member list.
  - C. The invitation exists only in email, with no place in the product to accept or decline. The member list shows only the username and only to the administrator. A current member cannot see who belongs to the team. An unverified or retired username matches an unknown username.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** A verified invited account sees the invitation in that account after logging in. Only that logged-in account can accept or decline. Another logged-in user cannot decline it. An unverified username and a retired username produce the same result as an unknown username: no invitation and no account. The administrator sees current members and pending invitations. Each row shows the current nickname and the username. With no nickname, it shows the username. The email is not shown. A current member sees the member list with the same fields and does not see pending invitations.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-044 still limits acceptance to the invited logged-in account and still creates no invitation for an unknown username. DEC-015 still keeps email out of search and public Events. DEC-047 still excludes a deleted account from search. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-015, DEC-042, DEC-044, DEC-047
- **Change history:** None.

## DEC-061 — Recovery ends existing sessions

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Account recovery
- **Context / question:** What happens to sessions already open when recovery completes, and whether completion itself opens the personal Calendar. This records the user's choice for review finding RR2-13.
- **Options considered:**
  - A. When recovery completes, every session already open for that account ends and cannot continue editing. Completion itself does not open the personal Calendar. The person logs in with the new password, and that login opens the personal Calendar. The previous password fails immediately.
  - B. Sessions already open remain open and can continue editing. The browser where recovery completes also opens the personal Calendar.
  - C. Sessions already open remain until their next save. That save fails and the session then ends. The browser where recovery completes opens the personal Calendar.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** When recovery completes, every session already open for that account ends and cannot continue editing. Completion itself does not open the personal Calendar. The person logs in with the new password, and that login opens the personal Calendar. The previous password fails immediately.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-026 still lets only a verified account complete recovery and still makes the previous password fail immediately. The new password opens the Calendar through the later login, not through completion itself. DEC-038 still does not set a session length. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-025, DEC-026, DEC-038, DEC-073
- **Change history:** DEC-073 states that a save still unfinished when recovery completes writes nothing. A save that finished before recovery is kept.

## DEC-062 — Nickname outer whitespace

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Nickname
- **Context / question:** Whether outer whitespace is removed before a non-empty nickname is stored, displayed, and searched. This records the user's choice for review finding RR2-14. Storing the nickname is in the first delivery. Nickname search is later.
- **Options considered:**
  - A. Outer whitespace is removed before the nickname is stored. Display and nickname search use that stored value. Spaces inside the nickname remain. A value that is empty after the removal is still no nickname, and the display name is the username. A search for the trimmed text finds it. A search that includes the removed outer spaces does not, because the stored nickname does not contain them.
  - B. Outer spaces are stored. Display and search include them. A search for the text without those spaces does not find the nickname.
  - C. The stored nickname keeps the outer spaces. Display and search remove them, so the stored value and the searched value differ.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** Outer whitespace is removed before a non-empty nickname is stored. Display and nickname search use that stored value. Spaces inside the nickname remain. A value that is empty after the removal is still no nickname, and the display name is the username. A search for the trimmed text finds it. A search that includes the removed outer spaces does not, because the stored nickname does not contain them.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-037 still treats a nickname that is empty after outer whitespace is removed as no nickname. DEC-048 still matches the entire current nickname, which is the stored trimmed value. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-015, DEC-037, DEC-048
- **Change history:** None.

## DEC-063 — Team transitions finish or stay

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Team changes
- **Context / question:** What remains when creating a team and its Calendar, accepting an invitation, leaving, removal, or dissolution stops before it finishes. This records the user's choice for review finding RR2-15. It is outside the first delivery.
- **Options considered:**
  - A. Creating a team and its one team Calendar, accepting an invitation, leaving, removal, and dissolution that moves every Event each finish entirely or leave the prior state unchanged. Dissolution does not leave some Events moved and others still on the team Calendar. An Event is not left in two Calendars, or in none, because a transition stopped halfway.
  - B. Dissolution may move Events one by one. If it stops, moved Events stay on personal Calendars and unmoved Events stay on the team Calendar. Membership remains until every Event has moved.
  - C. If dissolution stops halfway, the team Calendar is deleted and unmoved Events are deleted. Moved Events stay on personal Calendars.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** Creating a team and its one team Calendar, accepting an invitation, leaving, removal, and dissolution that moves every Event each finish entirely or leave the prior state unchanged. Dissolution does not leave some Events moved and others still on the team Calendar. An Event is not left in two Calendars, or in none, because a transition stopped halfway.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-039 already uses this result for account deletion. DEC-040 still places each Event in exactly one Calendar. DEC-021 and DEC-045 still describe the completed results of leaving, removal, and dissolution. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-021, DEC-039, DEC-040, DEC-045
- **Change history:** None.

## DEC-064 — Who may search

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Search
- **Context / question:** Whether a logged-out person may search, and what a no-match or an empty search returns. This records the user's choice for review finding RR2-16. It is outside the first delivery.
- **Options considered:**
  - A. A logged-out person cannot search. A logged-in search with no match returns no user and does not say whether the username never existed or was retired. An empty search returns no user and does not list accounts. The email is not shown.
  - B. A logged-out person may search. Results show the current nickname and username. A no-match and an empty search return no user.
  - C. A logged-out person cannot search. A no-match says the username was not found and can be distinguished from a retired username. An empty search returns every user.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** A logged-out person cannot search. A logged-in search with no match returns no user and does not say whether the username never existed or was retired. An empty search returns no user and does not list accounts. The email is not shown.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-048 still defines the fields and the whole-value match for a search that returns users. DEC-047 still makes a deleted username return no user. DEC-038 still requires login before a personal Calendar opens. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-038, DEC-047, DEC-048
- **Change history:** None.

## DEC-065 — Monthly preview bound

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Monthly recurrence
- **Context / question:** How many months the preview names when a monthly date does not exist in every month. This records the user's choice for review finding RR2-17.
- **Options considered:**
  - A. The preview names the types of month that lack the date, such as months with fewer than 31 days. It lists the concrete missing dates only inside the same 90 calendar dates used for conflict comparison, starting on the calendar date of the save and including that date. It does not list every such month for the unbounded life of the series. The series is still not saved.
  - B. The preview lists only the concrete missing dates inside those 90 calendar dates and does not name month types.
  - C. The preview names every future month that lacks the date, with no bound, and lists concrete dates only inside 90 days.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** When a monthly date does not exist in every month, the preview names the types of month that lack the date. It lists the concrete missing dates only inside the same 90 calendar dates used for conflict comparison, starting on the calendar date of the save and including that date. It does not list every such month for the unbounded life of the series. The series is not saved, and the stored Event remains unchanged. The product does not move the date to the month's last day and does not skip the month.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-019 still rejects a monthly series whose date does not exist in every month. DEC-053 defines the 90 calendar dates used for this list. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-018, DEC-019, DEC-053
- **Change history:** None.

## DEC-066 — Recovery completion proof

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Account recovery
- **Context / question:** What the person submits to complete recovery, and what an unknown email or an unverified registration receives if completion is attempted. This records the user's choice for review finding RR3-01.
- **Options considered:**
  - A. Completion submits the new password and a one-time proof sent only to the verified account's email. An unknown email, an unverified registration, a proof that does not match, a proof that is no longer valid, and a second use of the same proof all produce the same non-revealing failure and change nothing. How long the proof remains valid stays OPEN. Only a matching proof sets the new password for that verified account. Sessions already open still end, and completion itself still does not open the personal Calendar.
  - B. Completion submits the email and the new password, with no separate proof. An unknown email and an unverified registration produce the same non-revealing failure. Anyone who can submit the email can set the password.
  - C. Completion submits the current password and the new password. Recovery cannot be completed when the current password is forgotten. An unknown email and an unverified registration produce the same non-revealing failure.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** Completing recovery submits the new password and a one-time proof sent only to the verified account's email. An unknown email, an unverified registration, a proof that does not match, a proof that is no longer valid, and a second use of the same proof all produce the same failure result. That result does not reveal whether an account exists, and it changes nothing. How long the proof remains valid stays OPEN in DEC-023. Only a matching proof sets the new password for that verified account. Sessions already open still end under DEC-061. Completion itself still does not open the personal Calendar.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-026 still limits completion to a verified account and still makes the previous password fail immediately. DEC-051 still gives starting recovery one non-revealing result. DEC-023 now lists the recovery-proof lifetime and does not choose it. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-023, DEC-026, DEC-051, DEC-061, DEC-075
- **Change history:** DEC-075 sends the one-time proof when recovery starts, and only to a verified account. DEC-076 makes every unused earlier proof invalid when a later proof is sent.

## DEC-067 — Deleted date stays empty after a time change

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Deleted occurrence
- **Context / question:** Whether a later clock-time change on the same weekday creates the new time on a deleted occurrence's date. This records the user's choice for review finding RR3-02.
- **Options considered:**
  - A. That date stays empty. The new clock time is not created on it. Other occurrences on that weekday that have not started use the new time. The absence still remembers the original start instant. A weekday change still leaves the absence on the original date, and the new weekday's other occurrences appear.
  - B. The new clock time is created on that date. The absence blocks only the original start instant, which the time change no longer generates.
  - C. The time change removes the absence. That date follows the series like every other date on the weekday.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** A later clock-time change on the same weekday does not create the new clock time on a deleted occurrence's date. That date stays empty. Other occurrences on that weekday that have not started use the new time. The absence still remembers the original start instant. A weekday change still does not move the absence onto the new weekday, and the new weekday's other occurrences appear.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-052 still identifies the absence by the original start instant. DEC-031 still keeps the deleted occurrence absent until the series is deleted. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-031, DEC-052, DEC-074
- **Change history:** DEC-074 applies the same empty-date result to a deleted daily date and a deleted monthly date.

## DEC-068 — Later detachment keeps its own content

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Detached occurrence
- **Context / question:** Which content a detachment keeps when it finishes after a series save. This records the user's choice for review finding RR3-05.
- **Options considered:**
  - A. The detached occurrence keeps the complete content submitted with the detachment. Changes the series save already made are not on that occurrence. It is no longer attached to the series.
  - B. The detached occurrence keeps the time the series save already wrote and uses the text submitted with the detachment.
  - C. The occurrence becomes detached and keeps the time and text the series save already wrote. The content submitted with the detachment is not stored.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** When a detachment finishes after a series save, the detached occurrence stores the complete content submitted with that detachment. Changes the series save already made are not on that occurrence. The occurrence is no longer attached to the series.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-050 still says the later detachment wins and is not reattached by the series save. This decision states the content that win stores. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-032, DEC-050
- **Change history:** None.

## DEC-069 — Unchosen doubled start keeps both instants

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Generated local times
- **Context / question:** Which instants are offered when an unchosen doubled start is no longer doubled in the current timezone. This records the user's choice for the first part of review finding RR3-06.
- **Options considered:**
  - A. The creator is still offered the two original absolute instants, labeled in the timezone that applies at the choice. The occurrence stays unchosen and out of conflict comparison until one is selected. It does not become the single local clock time automatically.
  - B. The choice ends. The occurrence uses the one local clock time that exists in the new timezone and enters conflict comparison.
  - C. The choice ends. The occurrence is skipped until the creator changes the series time.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** When an unchosen doubled start is no longer doubled in the current timezone, the creator is still offered the two original absolute instants, labeled in the timezone that applies at the choice. The occurrence stays unchosen until one is selected. Until that choice, it is not part of conflict comparison. It does not become the single local clock time automatically.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-057 still keeps an unchosen doubled start unchosen after a timezone change. This decision states which instants that choice offers. DEC-070 keeps a completed choice through a later timezone change. DEC-071 keeps a skipped date skipped after a series time change. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-027, DEC-028, DEC-057, DEC-070
- **Change history:** DEC-070 states that a chosen future doubled start keeps its chosen absolute instant through a later timezone change.

## DEC-070 — Chosen instant survives a timezone change

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Generated local times
- **Context / question:** Whether a future occurrence whose doubled start the creator has already chosen keeps that instant through a later timezone change. This records the user's choice for the second part of review finding RR3-06.
- **Options considered:**
  - A. The occurrence keeps the chosen absolute instant. The new timezone changes only the displayed clock time. It is not expanded again at the previous clock time. It remains in conflict comparison.
  - B. The occurrence is expanded again at the previous clock time in the new timezone. The previous choice is discarded. If that clock time is doubled again, it waits for a new choice and stays out of conflict comparison until chosen.
  - C. The occurrence is skipped until the creator chooses again.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** A future occurrence whose doubled start the creator has already chosen keeps that chosen absolute instant through a later timezone change. The new timezone changes only its displayed clock time. It is not expanded again at the previous clock time. It remains in conflict comparison.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-027 still re-expands other attached occurrences that have not occurred. DEC-057 still keeps an unchosen doubled start unchosen. DEC-071 keeps a skipped date skipped after a series time change. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-027, DEC-057, DEC-069, DEC-071
- **Change history:** DEC-071 closes the remaining part of RR3-06.

## DEC-071 — Skipped date stays skipped after a time change

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Generated local times
- **Context / question:** Whether a skipped date stays skipped when a later series time change uses a clock time that exists on that date. This records the user's choice for the last part of review finding RR3-06.
- **Options considered:**
  - A. That date stays skipped. The new clock time is not created on it. Other dates that have not started use the new time. The series remains.
  - B. The new clock time is created on that date. The earlier skip applied only to the clock time that did not exist.
  - C. A series time change writes nothing while any skipped date remains. The stored series stays unchanged.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** A skipped date stays skipped after a later series time change, including when the new clock time exists on that date. The new clock time is not created on that date. Other dates that have not started use the new time. The series remains.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-057 still skips the occurrence and still keeps that date skipped after a timezone change. DEC-067 still keeps a deleted date empty after a same-weekday clock-time change. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-057, DEC-067
- **Change history:** None.

## DEC-072 — Revoked team link while the creator remains

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Sharing links
- **Context / question:** What a visitor sees when the team creator revokes one team sharing link and remains the administrator. This records the user's choice for review finding RR3-07. It is outside the first delivery.
- **Options considered:**
  - A. The revoked address opens no Calendar and shows no Event. The result does not say whether the Calendar used to exist. A logged-out person and a logged-in person see the same result. The team Calendar and its other links remain.
  - B. A logged-out person sees nothing. A logged-in person who is not a member sees the team Calendar's public Events.
  - C. The address opens an empty Calendar and says the link was revoked.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** A team sharing link revoked while its creator remains a member opens no Calendar and shows no Event. The result does not say whether the Calendar used to exist. This is the same for a logged-out person and a logged-in person. The team Calendar, its Events, and its other links remain.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-040 still leaves the Calendar and the other links when one link is revoked. DEC-059 still gives the same visitor result to the four ended links already named there. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-040, DEC-059
- **Change history:** None.

## DEC-073 — Unfinished save after recovery

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Account recovery
- **Context / question:** What happens to a save that was submitted but had not finished when recovery completes. This records the user's choice for review finding RR3-08.
- **Options considered:**
  - A. The save writes nothing. The state before recovery completed remains. A save that finished before recovery completed is kept.
  - B. The save is kept if it finishes after recovery. Recovery only stops the session from starting another edit.
  - C. A save that finishes after recovery is kept only when it does not change the password. A save that changes the password is discarded.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** A save that has been submitted but has not finished when recovery completes writes nothing. The state before recovery completed remains. A save that finished before recovery completed is kept.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-061 still ends every session already open and still stops that session from continuing to edit. DEC-050 still leaves an unfinished operation in its prior state. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-050, DEC-061
- **Change history:** None.

## DEC-074 — Deleted daily and monthly dates stay empty

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Deleted occurrence
- **Context / question:** Whether a later clock-time change creates the new time on a deleted daily date or a deleted monthly date. This records the user's choice for review finding RR4-01.
- **Options considered:**
  - A. Both dates stay empty. The new clock time is not created on them. Other dates that have not started use the new time. The absence still remembers the original start instant.
  - B. Both dates receive the new clock time. The absence blocks only the original start instant.
  - C. The daily date stays empty. The monthly date receives the new clock time.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** A later clock-time change does not create the new clock time on a deleted daily date or a deleted monthly date. That date stays empty. Other dates that have not started use the new time. The absence still remembers the original start instant.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-067 still keeps a deleted weekly date empty after a same-weekday clock-time change. DEC-052 still identifies the absence by the original start instant. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-019, DEC-052, DEC-067
- **Change history:** None.

## DEC-075 — Starting recovery sends the proof

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Account recovery
- **Context / question:** Which action sends the one-time recovery proof. This records the user's choice for review finding RR4-02.
- **Options considered:**
  - A. Starting recovery sends the one-time proof only when the email belongs to a verified account. An unknown email and an unverified registration send nothing. All three still show the same non-revealing result. Completion still requires that proof and the new password.
  - B. Starting recovery sends nothing. A later send action shows the same non-revealing result and sends the proof only to a verified account.
  - C. Starting recovery for a verified account says the proof was sent. An unknown email and an unverified registration stay non-revealing.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** Starting recovery sends the one-time proof only when the email belongs to a verified account. An unknown email and an unverified registration send nothing. An unknown email, an unverified registration, and a verified account still show the same result, and that result does not reveal whether an account exists. Completion still requires that proof and the new password.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-051 still gives starting recovery one non-revealing result. DEC-066 still requires the proof before the new password is set. DEC-023 still leaves the proof lifetime open. DEC-076 makes an unused earlier proof invalid when a later proof is sent. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-051, DEC-066, DEC-076
- **Change history:** DEC-076 states that a later proof makes every unused earlier proof no longer valid.

## DEC-076 — A later proof replaces earlier proofs

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Account recovery
- **Context / question:** Whether a later recovery proof makes an unused earlier proof invalid. This records the user's choice for review finding RR4-03.
- **Options considered:**
  - A. An earlier unused proof becomes invalid. Completing with it fails, reveals nothing, and does not change the password. The newest proof can still complete recovery. Every earlier unused proof becomes invalid.
  - B. Each unused proof remains valid until it expires or is used. An earlier proof can still set the new password after a later proof was sent.
  - C. Starting recovery again while an unused proof exists fails and sends nothing. The earlier proof remains valid. The start result still reveals nothing.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** Sending a later recovery proof makes every unused earlier proof no longer valid. Completing with an earlier proof fails, does not reveal whether an account exists, and does not change the password. The newest proof can still complete recovery.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-066 still rejects a second use of the same proof and still leaves the proof lifetime open in DEC-023. DEC-075 still sends a new proof when recovery starts for a verified account. This decision does not approve the requirements baseline.
- **Related decisions:** DEC-066, DEC-075
- **Change history:** None.

## DEC-077 — Email verification proof

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Email verification
- **Context / question:** What makes an unverified registration verified. This records the user's choice for PRD audit finding PQ-01. It was confirmed after the requirements baseline was approved.
- **Options considered:**
  - A. Verification submits a one-time proof sent only to that registration's email. Registration sends that proof. A matching proof makes the registration a verified account. Login with that email and password can then open the personal Calendar. A proof that does not match, is no longer valid, or is used again fails without revealing whether a registration exists and does not verify it. How long the proof remains valid stays OPEN.
  - B. A reply sent from that registration email verifies it. A reply from any other address does not.
  - C. The first login with that email and password verifies the registration and opens the personal Calendar. No separate proof is required.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** Registration sends a one-time proof only to that registration's email. Submitting a matching proof makes the registration a verified account. Login with that email and password can then open the personal Calendar. A proof that does not match, is no longer valid, or is used again produces a failure result that does not reveal whether a registration exists, and it does not verify the registration. How long the proof remains valid stays OPEN in DEC-023.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-015 still requires verification before login. DEC-049 still decides the race between cancellation and verification by which one finishes last. DEC-023 still leaves the verification-message lifetime open. This decision was confirmed after the requirements baseline approval on 2026-11-24 and is part of that baseline. It does not approve the PRD.
- **Related decisions:** DEC-015, DEC-023, DEC-024, DEC-049
- **Change history:** None.

## DEC-078 — Series continuation sentence

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Conflict warning
- **Context / question:** What a series save shows when no Event overlaps inside the 90 calendar dates. This records the user's choice for PRD audit finding PQ-03. It was confirmed after the requirements baseline was approved.
- **Options considered:**
  - A. The save lists no overlapping Event and still succeeds. It still says the repetition continues after those 90 calendar dates. That sentence means only that the series continues. It is not a conflict warning and does not mean a conflict was found after 90 days.
  - B. The save shows nothing. It lists no overlapping Event and does not say the repetition continues.
  - C. The continuation sentence appears only when at least one overlapping Event is listed. A save with no overlap shows nothing.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** A series save with no overlap inside the 90 calendar dates lists no overlapping Event and still succeeds. It still says the repetition continues after those 90 calendar dates. That sentence means only that the series continues. It is not a conflict warning and does not mean a conflict was found after 90 days.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** DEC-036 still says a save with no overlap shows no conflict warning. This decision states that the continuation sentence is still shown and is not that warning. DEC-053 still defines the 90 calendar dates. This decision was confirmed after the requirements baseline approval on 2026-11-24 and is part of that baseline. It does not approve the PRD.
- **Related decisions:** DEC-036, DEC-053
- **Change history:** None.

## DEC-079 — Quality targets deferred

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Non-functional scope
- **Context / question:** Whether this PRD sets performance, availability, or accessibility targets. This records the user's choice for PRD audit finding PQ-12. It was confirmed after the requirements baseline was approved.
- **Options considered:**
  - A. Performance, availability, and accessibility remain unresolved. This PRD sets no response time, availability proportion, or accessibility standard. Confirmed save results and email non-disclosure remain.
  - B. No numeric target. A save result includes a required warning. The start-recovery result does not depend on proof delivery. The owner can still distinguish public from private.
  - C. The conflict result appears within 1 second, the recovery proof is delivered within 1 minute, and the product meets WCAG 2.2 AA.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** Performance, availability, and accessibility remain unresolved. This PRD sets no response time, availability proportion, or accessibility standard. Confirmed save results and the rule that an email address is not shown remain in force.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** These three items are not requirements. DEC-039 and DEC-063 still require the named operations to finish entirely or leave the prior state. DEC-015, DEC-020, and DEC-048 still hide the email in the places those decisions name. This decision was confirmed after the requirements baseline approval on 2026-11-24 and is part of that baseline. It does not approve the PRD.
- **Related decisions:** DEC-015, DEC-020, DEC-039, DEC-048, DEC-063
- **Change history:** None.

## DEC-080 — User approves the personal time PRD

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** PRD approval
- **Context / question:** Whether the user approves `docs/product/06-prd-personal-time.md`, version 0.1, after its status was READY FOR USER REVIEW.
- **Options considered:**
  - Approve the current PRD.
  - Leave it READY FOR USER REVIEW.
  - Change a requirement before approval.
- **Assistant recommendation:** None. Approval was the user's explicit instruction.
- **User's choice:** Approve the current personal time PRD.
- **Final business rule:** `docs/product/06-prd-personal-time.md` version 0.1 has status APPROVED as of 2026-11-24. This approval does not add, remove, or change DEC-012 through DEC-079. It does not supersede `docs/product/04-prd.md` or DEC-001 through DEC-011.
- **Rationale:** The user explicitly approved the current PRD version.
- **Consequences / scope impact:** The approved document is the product baseline for a later technical-design decision. This record does not authorize technical design or application code. Open items in DEC-023, DEC-038, and DEC-079 remain open.
- **Related decisions:** DEC-011, DEC-079
- **Change history:** None.

## DEC-081 — A proof that cannot be sent

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Verification and recovery when the proof is not sent
- **Context / question:** What the person sees when a one-time verification proof or recovery proof cannot be sent. This records the user's choice for architecture finding TDR-PT-004. It was confirmed during technical design, after the personal time PRD was approved.
- **Options considered:**
  - A. That registration or that start of recovery is not stored. The person sees a distinct send-failure result that does not reveal whether an account or registration exists. No proof remains outstanding. The person may try again.
  - B. The registration or the start of recovery is stored. The person sees the ordinary result. The send is retried later.
  - C. The person sees the same result as a taken username or an ordinary start of recovery. No proof is sent.
- **Assistant recommendation:** A.
- **User's choice:** A.
- **Final business rule:** When a one-time verification proof cannot be sent, that registration is not stored. When a one-time recovery proof cannot be sent, that start of recovery is not stored. The person sees a distinct send-failure result that does not reveal whether an account or registration exists. No proof remains outstanding. The person may try again. The ordinary registration, login, and recovery results in DEC-025, DEC-051, DEC-075, and DEC-077 stay unchanged when a proof is sent or when no proof is supposed to be sent.
- **Rationale:** The user selected A.
- **Consequences / scope impact:** This decision is confirmed product behavior for technical design. It does not rewrite `docs/product/06-prd-personal-time.md`. That PRD remains the approved text of DEC-080 and does not yet contain this rule. It does not change DEC-012 through DEC-080, and it does not authorize application code.
- **Related decisions:** DEC-051, DEC-066, DEC-075, DEC-077, DEC-080
- **Change history:** DEC-082 narrows the outage case. While mail cannot be sent, a taken username and an unknown email also receive the send-failure result. The sentence that ordinary results stay unchanged still applies when mail can be sent.

## DEC-082 — Who sees a failed send

- **Status:** CONFIRMED
- **Date:** 2026-11-24
- **Topic:** Send failure for every registration and recovery start
- **Context / question:** When mail cannot be sent, does a taken username or an unknown email still receive the ordinary failure? This records the user's choice for detailed-design finding TDR-PT-102. It was confirmed during technical design.
- **Options considered:**
  - A. Only an attempt that was supposed to send a proof returns the send-failure result. A taken username, an unknown email, and an unverified registration keep the ordinary failure. That difference can show that the username was free or that the email belongs to a verified account.
  - B. While mail cannot be sent, every registration and every start of recovery returns the send-failure result, including a taken username and an unknown email. Nothing is stored, and the result does not reveal whether an account exists. While mail can be sent, the ordinary failure results stay unchanged.
  - C. A failed send uses the ordinary failure result. The result does not reveal whether an account exists, and the person cannot tell that mail failed.
- **Assistant recommendation:** B.
- **User's choice:** B.
- **Final business rule:** While mail cannot be sent, every registration and every start of recovery returns the distinct send-failure result and stores nothing. A taken username, an unknown email, and an unverified registration receive that same result in that situation. The result does not reveal whether an account or registration exists. No proof remains outstanding. The person may try again. While mail can be sent, the ordinary registration, login, and recovery results stay unchanged, and a proof is sent only when DEC-075 or DEC-077 requires it.
- **Rationale:** The user selected B.
- **Consequences / scope impact:** This decision narrows the outage sentence of DEC-081. It does not rewrite `docs/product/06-prd-personal-time.md`. It does not change DEC-012 through DEC-080, and it does not authorize application code.
- **Related decisions:** DEC-051, DEC-075, DEC-077, DEC-081
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
