# Technical Requirements Baseline

- Stage: 1 — Technical Requirements Baseline
- Date: 2026-11-19
- Status: Baseline derived from the approved PRD. Module assignment below supersedes the "Unassigned" boundary in the tables.
- Closed on 2026-11-19: Q-REC is TD-001, one local record on one computer. Q-ACT is TD-002, session binding without inbox proof. See `docs/technical/technical-decisions/log.md`.
- Assigned modules: domain, store, and coordinator in `@app/desktop`, as specified in `docs/technical/03-domain-model.md` through `09-test-strategy.md`. The tables use that boundary. Q-REC and Q-ACT are closed.
- Product authority: `docs/product/04-prd.md`, version 0.1 draft, APPROVED (DEC-011)
- Repository evidence: `docs/technical/00-repository-analysis.md`
- Reviewer: not invoked. The Architecture Baseline Gate has not been reached.

## 1. Rules for this baseline

- Every row restates an approved rule as a technical capability or constraint. It does not add user-visible behavior.
- The current boundary is `@app/desktop`: domain, store, and coordinator. Website, admin, and API are not on the version 1 path. Q-REC is closed as TD-001. Q-ACT is closed as TD-002. Q-TZ and Q-AMB stay open where the tables still name them.
- Data notes name the information the approved rule needs to store or compare. They are not a schema.
- Verification means executing the approved acceptance criterion against a committed team record. Test tools and test layers are not selected.
- Open markers are defined in section 5. A marker is not a decision.
- Version-1 exclusions are technical constraints to reject or omit behavior, not features to design.

## 2. Capability groups

These groups only organize the approved rules.

| Group | Approved source | Technical capability or constraint |
|---|---|---|
| Team cardinality | BR-1, AC-002, AC-050 | At most one active team. A create while one is active changes nothing. After dissolution, a later create may start a new active team. |
| Email canonicalization | BR-1, DEC-008 | Outer trim, exactly one `@`, at least one non-whitespace character on each side, no spaces. Store and compare the trimmed lowercase form. |
| Invitation | BR-2 | One pending invite per canonical email. Only the invited email may accept or decline. Only the current maintainer may invite or cancel. Incomplete invite, decline, or cancel leaves invites and roster unchanged. |
| Maintainer | BR-3 | Exactly one current member holds the role while the team is active. Transfer is immediate on designation of a different current member. Self-removal, self-designation, and ordinary-member roster actions leave the record unchanged. |
| Event record | BR-4 | A current member's event stores canonical owner email, explicit visibility, trimmed title, trimmed location and description, and absolute start and end instants with end after start. Failed or canceled saves are not committed and are not shown. |
| Civil time | BR-4, DEC-006 | Entered clock times convert in the saving device's local zone at that save. An unchanged start or end keeps its stored instant. A nonexistent local time cannot be saved. An ambiguous local time is saved only after one occurrence is chosen. Display uses the viewer's current device-local zone. |
| Removal and custody | BR-5 | Completed removal drops that email's access, deletes that email's only-self events, and keeps retained team-visible events attributed to that email. The maintainer may edit their text and time or delete them, and a save that changes their visibility writes nothing. Rejoin returns edit and delete rights to that member. |
| Busy/free projection | BR-6 | Busy is half-open: start ≤ T < end. A member's own row includes that member's only-self events. Another member's view of that person uses team-visible events only. The board lists current members only. Overlap is allowed and each covering event remains visible. |
| Commit and conflict | BR-7 | A completed save, delete, removal, succession, dissolution, or acceptance replaces the record only as a whole. The first completed write wins. A later write is checked against the record at its write. It must not recreate a deleted event or a dissolved team, and it must not apply a permission that the current record no longer grants. |
| No side-channel behavior | AC-027, AC-051, PRD section 2 | No start reminder, no invite reminder, no recurring event, and no all-day event is written or sent. |

## 3. Business-rule traceability

| ID | Technical capability or constraint | Boundary | Data and interface implications | Verification | Open |
|---|---|---|---|---|---|
| BR-1 | Enforce one active team, usable email shape, and lowercase trimmed storage and comparison. | @app/desktop | Team presence; roster of canonical emails; maintainer identity. | AC-001, AC-002, AC-003, AC-050 | TD-001, TD-002 |
| BR-2 | Enforce maintainer-only invite and cancel, invitee-only accept and decline, one pending invite, and no time expiry. Succession does not end an invite. | @app/desktop | Pending invite keyed by canonical email; visibility of that address limited to the invitee and current maintainer. | AC-004 through AC-008, AC-030, AC-032 through AC-035 | TD-001, TD-002 |
| BR-3 | Keep the role occupied by exactly one current member until sole-member dissolution. Reject self-removal, self-designation, and ordinary-member roster changes without writing. | @app/desktop | Single maintainer reference that always names a current member while the roster is non-empty. | AC-009, AC-010, AC-011, AC-038, AC-039 | TD-001, TD-002 |
| BR-4 | Validate visibility, trimmed title, and end-after-start before commit. Convert only the clock fields entered on that save. Preserve internal whitespace. Attribute the event to the acting member's stored email. | @app/desktop | Event owner, visibility, title, location, description, absolute start, absolute end. | AC-012 through AC-015, AC-018, AC-028, AC-036, AC-037, AC-043, AC-044, AC-046, AC-051 | TD-001, TD-002, Q-TZ, Q-AMB |
| BR-5 | On completed removal, revoke access, delete only-self events permanently for version 1, and retain team-visible events. Custody edits cannot change visibility. Rejoin restores the owner's edit and delete rights. Sole-member dissolution clears roster, events, invites, and the role without a version-1 restore path. | @app/desktop | Membership state; event owner retained after removal; visibility frozen while the owner is removed. | AC-019 through AC-023, AC-029, AC-041, AC-047, AC-048, AC-049 | TD-001, TD-002, Q-TZ |
| BR-6 | Project busy/free from committed events using a half-open instant interval. Filter only-self events out of every other member's view. List current members only. | @app/desktop | Read model over committed events and the current roster. Clock labels are a view concern and are not a second stored time. | AC-016, AC-017, AC-018, AC-040, AC-042, AC-045 | TD-001, Q-TZ |
| BR-7 | Treat each listed command as complete or unchanged. Order conflicting commands by completion, then authorize the later command against the resulting record. Do not send reminders. | @app/desktop | One committed team record. An uncommitted edit is not part of that record. | AC-024, AC-025, AC-026, AC-027, AC-031, AC-035, AC-046 | TD-001 |

## 4. Acceptance-criterion traceability

| ID | Rule | Technical capability or constraint | Data and interface implications | Verification | Open |
|---|---|---|---|---|---|
| AC-001 | BR-1 | Creating a team from `Sam@Team.com` with no team present stores `sam@team.com` as the only member and the maintainer. | One roster entry and one maintainer reference, both the canonical email. | Stored roster and role match the criterion. | TD-001, TD-002 |
| AC-002 | BR-1 | A second create while a team is active fails and writes no roster or event change. | Create must observe whether an active team already exists. | Existing roster and events remain. | TD-001 |
| AC-003 | BR-1 | `sam @team.com` and a blank address fail for both team create and invite. | Rejection happens before any roster or invite write. | No team and no invite is created from those inputs. | TD-001 |
| AC-004 | BR-2 | Before acceptance, the invited email's view contains the pending invite and excludes roster, events, and busy/free. | View input is the acting email plus pending invites. | The invite is visible; the other three collections are not. | TD-001, TD-002 |
| AC-005 | BR-2 | An accept or decline by any email other than the invited email writes nothing. | Command carries the acting email and is compared with the invite's canonical email. | Invite and roster stay as they were. | TD-001, TD-002 |
| AC-006 | BR-2 | An invite whose canonical email is already a current member, including a case variant, creates no invite. | Membership lookup uses trim and case-insensitive comparison. | Pending-invite set is unchanged. | TD-001 |
| AC-007 | BR-2 | A second invite for an email that already has a pending invite fails and leaves the original. | At most one pending invite per canonical email. | Original invite remains the only one. | TD-001 |
| AC-008 | BR-2 | Maintainer designation does not delete or retarget a pending invite. A later accept still adds that email. | Role reference changes; invite collection does not. | Accept after succession adds the member. | TD-001, TD-002 |
| AC-009 | BR-3 | Designating the other current member makes that member the only maintainer immediately. The previous maintainer remains a member and loses invite and removal rights. | One maintainer reference. Rights are derived from that reference at each later command. | Role is the designee; previous member cannot invite or remove. | TD-001, TD-002 |
| AC-010 | BR-3 | The maintainer removing their own email writes nothing. | Removal target is compared with the current maintainer. | Roster and role unchanged. | TD-001, TD-002 |
| AC-011 | BR-3 | Dissolution with two or more members writes nothing, whoever requests it. | Dissolution reads the current member count. | Roster, events, and invites unchanged. | TD-001 |
| AC-012 | BR-4 | A team-visible save stores trimmed title `HQ`, empty location, and absolute instants with end after start. Outer whitespace is removed; the stated clock times convert in the saver's device zone. | Title, location, visibility, start instant, end instant. | Stored title, empty location, visibility, and instant order match. | TD-001, Q-TZ |
| AC-013 | BR-4 | An empty-after-trim title, or an end that is not after the start, writes no event. | Validation precedes commit. | Event collection unchanged. | TD-001 |
| AC-014 | BR-4 | Civil time `2026-03-08 02:30` in `America/New_York` is a nonexistent local time. The save writes nothing. | Conversion must detect a DST gap for the saving device zone. | No event is written. | TD-001, Q-TZ |
| AC-015 | BR-4 | A pending invitee or a removed email creating an event leaves the team record unchanged. | Create is allowed only for a current member. | No new event. | TD-001, TD-002 |
| AC-016 | BR-6 | For team-visible `[S, E)`, viewer B sees the owner busy at S and free from that event at E. Clock labels use B's current device-local zone. | Stored values are instants. Busy and labels are computed at view time. | Busy at S, free at E, labels in B's zone. | TD-001, Q-TZ |
| AC-017 | BR-6 | At instant T covered by both visibilities, the owner's row is busy. Another member does not receive the only-self event and sees the owner busy only from the team-visible event. | Read path filters events by actor and visibility. | A's row busy; B lacks the only-self event; B still sees A busy. | TD-001, TD-002 |
| AC-018 | BR-4 | An ended team-visible event stays visible with owner and full content, and it does not cover the current instant. | Visibility is not derived from whether the event has ended. | Event present; current instant not busy from it. | TD-001 |
| AC-019 | BR-5 | Completed removal removes A's access, deletes A's only-self events, and leaves A's team-visible events team-visible. | Membership transition and only-self deletion commit together. | A cannot view; only-self gone; team-visible remains. | TD-001, TD-002 |
| AC-020 | BR-5 | A maintainer save of a retained event that includes a change to only-self writes nothing, including the accompanying title. | Visibility change is rejected before any field write. | Title and visibility unchanged. | TD-001 |
| AC-021 | BR-5 | A maintainer save that changes the title to `  Clinic  ` and does not change visibility stores `Clinic` and keeps team-visible. | Text trim applies to custody edits. | Stored title `Clinic`; visibility unchanged. | TD-001 |
| AC-022 | BR-5 | After A accepts a later invite, A can modify the retained team-visible event and the maintainer cannot. Only-self events deleted at removal stay absent. | Edit right returns to the current member who owns the event. | A can modify; maintainer modification writes nothing; only-self still absent. | TD-001, TD-002 |
| AC-023 | BR-5 | Sole-member dissolution clears the roster, deletes all events, ends pending invites and the maintainer role, and version 1 has no restore of that team. | Dissolution is one commit. A later create is a new team, covered by AC-050. | Empty roster, no events, no invites, no role. | TD-001 |
| AC-024 | BR-7 | A completed delete is visible to a member who is already viewing, and to a member who is not viewing on that member's next view. | Committed record is what both reads return. Notification transport is not specified. | Viewing member sees the interval clear after completion; the other member sees it on the next view. | TD-001 |
| AC-025 | BR-7 | A save whose write is ordered after a completed dissolution does not recreate the team or the event. | The write checks the record after dissolution. | Team remains dissolved; event remains absent. | TD-001 |
| AC-026 | BR-7 | If the only-self save completes before removal, the completed removal deletes that event. | Removal reads visibility as committed at removal time. | Event is absent after removal. | TD-001 |
| AC-027 | MVP out | Arrival of a start instant or creation of an invite produces no start reminder and no invite reminder. | No reminder schedule or delivery is part of the commit path. | No reminder side effect. | None |
| AC-028 | BR-4 | Civil time `2026-11-01 01:30` in `America/New_York` occurs twice. Without a chosen occurrence, the save writes nothing. | Ambiguous conversion requires an explicit occurrence choice already required by DEC-006. The choice control is not designed here. | No event is written when no occurrence is chosen. | TD-001, Q-TZ, Q-AMB |
| AC-029 | BR-5 | Editing only the end clock time converts that end in the maintainer's device-local zone at that save and leaves the stored start instant unchanged. | Partial instant update. Custody edit still cannot change visibility. | Start instant identical; end matches the maintainer zone conversion. | TD-001, Q-TZ |
| AC-030 | BR-2 | Accept adds the invited email as a member and does not change the maintainer. | Membership insert without a role write. | Email is a member; maintainer email is the same. | TD-001, TD-002 |
| AC-031 | BR-7 | If removal of A completes before A's visibility save, that later save does not change A's retained team-visible event. | The later save is authorized against the post-removal record. A is no longer the editor. | Retained event unchanged. | TD-001 |
| AC-032 | BR-2 | Decline by the invited email ends the invite and does not add a member. | Invite deletion or terminal state; roster unchanged. | No pending invite and no new member. | TD-001, TD-002 |
| AC-033 | BR-2 | Maintainer cancel ends the invite and leaves the roster unchanged. | Same invite ending path, different actor. | Invite gone; roster unchanged. | TD-001, TD-002 |
| AC-034 | BR-2 | Accept, decline, or cancel with no matching pending invite writes nothing. | Command must find a matching pending invite first. | Invites and roster unchanged. | TD-001 |
| AC-035 | BR-2 | An invite, decline, or cancel that does not complete leaves pending invites and the roster as they were. | Those commands have no partial commit. | Pre-command invites and roster remain. | TD-001 |
| AC-036 | BR-4 | On accept, the new member sees every stored team-visible event, including events created before the join and events that have ended, with full content. | Team-visible events are not filtered by join time or end time. | Each such event is visible in full to the new member. | TD-001, TD-002 |
| AC-037 | BR-4 | A member who is not the creator cannot modify or delete another member's event. | Editor must be the owner, except the BR-5 custody exception. | Stored event unchanged. | TD-001, TD-002 |
| AC-038 | BR-3 | An ordinary member's invite, cancel, removal of another member, or self-removal writes nothing. | Those commands require the current maintainer. | Record unchanged. | TD-001, TD-002 |
| AC-039 | BR-3 | Designating the maintainer's own email writes nothing. | Successor must be a different current member. | Role and roster unchanged. | TD-001, TD-002 |
| AC-040 | BR-6 | The busy/free view lists every current member. A member with no events is free. | Rows come from the current roster, not from the set of people who have events. | A and B are listed; A is free. | TD-001 |
| AC-041 | BR-5 | After removal, the removed email has no busy/free row. Retained team-visible events stay visible and attributed to that stored email. | Board membership and event ownership are different collections. | Row absent; event present with the same owner email. | TD-001 |
| AC-042 | BR-6 | Two members in different device zones agree whether the owner is busy at the same instant. Each sees clock labels in that viewer's own current zone. | Busy is computed from instants. Labels are computed per viewer. | Same busy result; different clock labels. | TD-001, Q-TZ |
| AC-043 | BR-4 | A description's internal newline is stored. Outer trim still applies. | Stored text keeps internal spaces, tabs, and newlines. | Stored description contains the newline. | TD-001 |
| AC-044 | BR-4 | A team-visible interval whose end is already past can be saved and remains visible. | Past instants are valid. Ended does not mean deleted. | Event stored and visible. | TD-001, Q-TZ |
| AC-045 | BR-6 | Two overlapping team-visible events of one member are both shown at an instant they both cover, and that member is busy. | Overlap is not a validation error. Busy is the union of coverage. | Both events visible; member busy. | TD-001 |
| AC-046 | BR-4 | A canceled edit or a failed save is absent from every viewer's read of the committed event. | Uncommitted fields are not part of the team record. | Viewers see the stored event only. | TD-001 |
| AC-047 | BR-5 | The maintainer can delete a retained team-visible event of a removed owner. | Delete is allowed to the maintainer while the owner is removed. | Event no longer visible. | TD-001, TD-002 |
| AC-048 | BR-5 | The maintainer can change location and description of a retained event when visibility is not changed. | Field update without a visibility write. | Location and description change; visibility stays team-visible. | TD-001 |
| AC-049 | BR-5 | After rejoin, that member can delete a retained team-visible event. Only-self events deleted at removal are still absent. | Owner delete right follows current membership. Deletion of only-self events is not undone by accept. | Owner delete succeeds; only-self events remain absent. | TD-001, TD-002 |
| AC-050 | BR-1 | After dissolution, a usable email can create a new team and become its first member and maintainer. | Dissolved is not a permanent block on a later create. The new team is a new record. | New team exists with that canonical email as member and maintainer. | TD-001, TD-002 |
| AC-051 | MVP out | A save offered as a recurring event or an all-day event writes no event. | The commit path accepts only a single absolute interval. | No event is written. | TD-001 |

Boundary for every business-rule row in section 3: `@app/desktop`. Section 4 rows trace acceptance criteria to that same boundary.

## 5. State constraints

These restate PRD section 6. They do not add states.

| Object | Approved states | Technical constraint |
|---|---|---|
| Team | Absent; active; dissolved | Create from absent or dissolved starts a new active team. Dissolution from the sole member ends that team. Version 1 does not restore a dissolved team. A second active team cannot be created. |
| Maintainer role | Occupied by one current member; ended | While any member remains, the role names exactly one of them. It ends only at sole-member dissolution. |
| Email membership | Absent; invited; member; removed | Invite, accept, decline, cancel, removal, dissolution, and later accept are the only transitions in the PRD state table. |
| Event visibility | Team-visible; only-self | The creator may switch either way on a successful save. Removal deletes only-self events. A maintainer custody save cannot switch a retained event to only-self. |
| Event time | Absolute start inclusive, end exclusive | A save replaces only instants whose clock times were entered on that save. |

## 6. Explicit non-requirements

The following are constraints to keep behavior out. They are not technical features.

- Start reminders and invite reminders (AC-027).
- Recurring events and all-day or date-only events (AC-051, PRD section 2).
- Activity registration, incident management, shared-meeting booking as the primary job, and shift assignment.
- A second team at the same time (AC-002).
- A product flow that proves control of an email.
- A product flow that defines how the team record moves between devices.

## 7. Open questions and risks

| ID | Kind | Item | Effect on this baseline |
|---|---|---|---|
| Q-REC | Closed on 2026-11-19 as TD-001 | One local record on one computer. Another member in AC-024 is another local session, or a later view of that record. | Placement is no longer open. |
| Q-ACT | Closed on 2026-11-19 as TD-002 | A session binds without inbox proof, only to an allowed email when a team is active. | Binding is no longer open. |
| Q-TZ | Open technical choice | Which existing platform or library performs IANA zone conversion for gap and overlap detection. The civil times in AC-014 and AC-028 are fixed by the PRD. | Verification data is known. The implementation API is not selected. |
| Q-AMB | Specified in stage 3 | DEC-006 requires the saver to choose which occurrence of an ambiguous local time is stored. AC-028 requires failure when no choice is made. | The control is in `05-application-design.md` section 7. No default occurrence is applied. |
| Q-RUN | Recommended closed | Whether `apps/website`, `apps/admin`, or `apps/api` participate in version 1. | They stay in the workspace and gain no team commands. `@app/desktop` is the version 1 path. |

Risks carried from repository analysis, still not resolved here:

- The initialized architecture note that the API is the trust boundary is not a requirement mapping. Using it as one would be a Stage 2 choice and must still satisfy Q-REC without new product behavior.
- No current code implements these capabilities, so this baseline does not identify reusable domain modules.
- No acceptance test exists yet. The verification column names the oracle only.

## 8. Coverage check

- BR-1 through BR-7 each have a row in section 3.
- AC-001 through AC-051 each have a row in section 4.
- PRD section 6 states are restated in section 5.
- PRD section 2 exclusions are restated in section 6.
- No technical requirement in this document introduces a user-visible outcome that is absent from the approved PRD.

## 9. Stage exit

Stage 1 originally stopped at this baseline. Later stages assigned `@app/desktop` and closed Q-REC and Q-ACT. Those closures are the current reading of this file. The PRD text is unchanged.
