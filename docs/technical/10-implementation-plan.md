# Implementation Plan

- Stage: 6 — Implementation Planning
- Date: 2026-11-19
- Status: The user accepted the UI plan delta and authorized implementation on 2026-11-20. This document still does not change the approved PRD or technical design. Dependency installation remains limited to IMP-010.
- Product authority: `docs/product/04-prd.md`, version 0.1 draft, APPROVED (DEC-011, user approval 2026-11-19)
- Design authority: `docs/technical/02-architecture.md` through `09-test-strategy.md` and `docs/technical/technical-decisions/log.md`, APPROVED by the user on 2026-11-19, including TD-001 through TD-004
- Review disposition: `docs/technical/reviews/technical-design-review.md` records TDR-REV-010 through TDR-REV-030 as ADDRESSED. Those findings stay closed. This plan implements the revised text. It does not redesign architecture or add product behavior.

## Approval record

- The PRD remains APPROVED. Version text is `0.1 draft`. DEC-011 records the user's approval on 2026-11-19. A requirements review and a PRD audit did not approve the PRD.
- The technical design is APPROVED by the user on 2026-11-19. TD-001 and TD-002 were confirmed earlier that day. TD-003 and TD-004 were recommendations included in that approval.
- The user authorized implementation on 2026-11-20 and accepted the UI plan delta recorded as IMP-022. That authorization covers the approved plan plus IMP-022. It does not authorize deployment or a change to the PRD.
- The current desktop shell is the code this plan extends, not a behavior source. `apps/desktop/src/main/index.ts` opens one `BrowserWindow` with `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`, and the existing preload. `app.whenReady` creates that window. On `activate`, if no window is open, the same file creates another window outside any coordinator. `window-all-closed` quits except on `darwin`. There is no single-instance lock, no team record, and no command queue. `apps/desktop/package.json` script `test` is `vitest run --passWithNoTests`. This planning stage does not change those files.

## 1. Epics

The default order is IMP-001 through IMP-022. A later epic starts after the tasks it lists as prerequisites. Section 3 names the only parallel splits.

| Epic | Tasks | Approved work |
|---|---|---|
| E1 Domain pure module | IMP-001 – IMP-009 | Canonical email, records, commands, invariants, projection with record status and event ids, `busyAt`. The caller supplies generation and event id. A time-port type is included so event commands can call it. No package is installed. |
| E2 Time adapter | IMP-010 | `@js-temporal/polyfill` and `America/New_York` gap, overlap, and zone-label tests. This is the only install task. |
| E3 Store | IMP-011 – IMP-012 | `userData/team-record.json`, atomic synced replace, unreadable file, leftover temp file. |
| E4 Coordinator and sessions | IMP-013 – IMP-018 | Queue including bind, generation stamp, single-instance lock, second instance handled by the first process, projections per session, ignored payload actor, zone, generation, and create id, window registration including darwin `activate`. |
| E5 Preload and renderer | IMP-019 – IMP-022 | IMP-020 covers bind, another session, one event, an occurrence choice, and `busyAt`. IMP-022 implements the accepted UI package, S-01 through S-08 and I-01 through I-15. |
| E6 Acceptance gate | IMP-021 | `vitest run` without `--passWithNoTests` becomes the desktop test script after the acceptance tests exist. |

## 2. Task rules

Every task below is limited to the approved design. A task is done only when its tests pass under Vitest and its done criteria hold. A rejection returns the same record by value. The domain module does not read the clock, the file, or the renderer, and it does not mint a generation or an event id.

Design references point at the approved section that the task implements. TD-001 through TD-004 are in `docs/technical/technical-decisions/log.md`.

## 3. Dependencies and parallel work

Serial order is the default, because the domain, store, and coordinator land in one package and share types.

| Task | Needs first | May proceed beside |
|---|---|---|
| IMP-001 | None | None. It fixes the canonical email every later task compares. |
| IMP-002 | IMP-001 | None. |
| IMP-003, IMP-004, IMP-005 | IMP-002 | Each other, only as separate domain command modules re-exported by one entry. Default is IMP-003, then IMP-004, then IMP-005. |
| IMP-006 | IMP-002 | IMP-003 through IMP-005. The port type has no command logic. |
| IMP-007 | IMP-006 | None until the port type exists. |
| IMP-008 | IMP-007 | None. Modify uses the create save rules. |
| IMP-009 | IMP-003, IMP-004, IMP-005, IMP-008 | None. Projection is asserted on records those commands produce. |
| IMP-010 | IMP-006 | IMP-007, IMP-008, IMP-009, IMP-011, and IMP-012. Domain tests keep using a fake port. The adapter tests do not wait for team rules. |
| IMP-011 | IMP-002 | IMP-003 through IMP-010. The JSON shape is already fixed in `04-data-design.md`. |
| IMP-012 | IMP-011 | IMP-007 through IMP-010. |
| IMP-013 | IMP-001, IMP-002, IMP-009 | IMP-010, if the adapter is not yet wired. Bind tests can use a fixed zone double. |
| IMP-014 | IMP-003 through IMP-009, IMP-013 | IMP-010, using a fake port until the adapter lands. Wire the real adapter before E4 is called complete. |
| IMP-015 | IMP-014 | IMP-012, if the coordinator tests still use an in-memory store double. |
| IMP-016 | IMP-007, IMP-014 | IMP-015. |
| IMP-017 | IMP-012, IMP-014 | IMP-016 and IMP-018's design reading, not its shell edit. |
| IMP-018 | IMP-012, IMP-013, IMP-015, IMP-017 | IMP-019's type sketch only. The shell edit waits until the coordinator registers windows. |
| IMP-019 | IMP-013, IMP-014, IMP-016 | IMP-018, after the command and bind contracts are stable. |
| IMP-020 | IMP-009, IMP-016, IMP-019 | None. It is the first renderer behavior. |
| IMP-022 | IMP-020 | None. It applies the accepted UI package on that renderer path. |
| IMP-021 | IMP-001 through IMP-022 | None. |

Integration boundaries:

- Domain tests import `src/domain` and a fake time port. They do not open Electron or a file.
- Adapter tests import `src/domain/time` and the polyfill. They do not apply team rules.
- Store tests use a temporary directory. They do not judge permissions.
- Coordinator tests use an in-memory store double and two session ids on one queue. They do not launch a packaged app.
- The second-process check belongs to IMP-017. It does not rerun AC-001 through AC-051.
- The renderer may import `busyAt` and no other domain export.

## 4. Tasks

### IMP-001 — Canonical email

- Epic: E1
- Scope: Implement `canonicalize` in `apps/desktop/src/domain`. Trim the ends. Accept only a remainder with exactly one `@`, no whitespace anywhere, and at least one character on each side. Return that remainder in full lowercase. This is the only stored form for roster entries, invites, the maintainer, and event owners.
- Design: `03-domain-model.md` section 1; `02-architecture.md` section 4; TD-002 uses this form when a session email is stored later.
- PRD: BR-1, DEC-008, AC-001, AC-003, AC-006.
- Prerequisites: None.
- Deliverables: The pure function and its unit tests. No Electron, file, or package install.
- Tests: `Sam@Team.com` becomes `sam@team.com`. `sam @team.com` and a blank address are rejected. A missing `@`, a second `@`, and internal whitespace are rejected. Comparison of the canonical form treats case variants as the same email.
- Done when: Those cases pass, and the function has no IO.

### IMP-002 — Record shape and invariants

- Epic: E1
- Scope: Define the pure record: `absent` with no generation; `active` with generation, maintainer email, roster, invites, and events; `dissolved` with generation and without roster, invites, events, or maintainer. Event fields match `03-domain-model.md` section 2, including `id`. Check the invariants in section 6 before any later write: one maintainer who is on the roster, no duplicate roster email, invite email, or event id, no invite for a current member, visibility is one of the two values, title is non-empty, and end is after start. The checker reports failure. It does not repair a record.
- Design: `03-domain-model.md` sections 2 and 6; `04-data-design.md` sections 2 and 3.
- PRD: BR-1, BR-3, BR-4. Supports every later acceptance test that stores a record.
- Prerequisites: IMP-001.
- Deliverables: Record types and the invariant check. Generation and event id are fields the caller has already supplied. This task does not mint them.
- Tests: An active record that breaks each invariant fails the check. A valid active record and a dissolved record pass. Absent has no generation field to stamp.
- Done when: Invalid records are rejected unchanged, and no command is implemented yet.

### IMP-003 — Create team

- Epic: E1
- Scope: `createTeam` writes only when the loaded record is still the stamped base. Absent stamp plus a still-absent record stores the supplied non-empty generation as the first generation. Dissolved stamp plus a still-dissolved record stores the supplied generation as the next generation. The actor email must be usable. The new record is active, with that canonical email as the only roster entry and the maintainer, and with no invites and no events. Any other loaded record writes nothing. The domain does not create the generation string.
- Design: `03-domain-model.md` sections 1, 3, and 4; `02-architecture.md` sections 3 and 4; `07-concurrency-and-consistency.md` section 3 for the matching-base rule. The coordinator applies the full create decision table in IMP-014.
- PRD: BR-1, AC-001, AC-002, AC-003, AC-050.
- Prerequisites: IMP-002.
- Deliverables: `createTeam` and domain tests. Other commands against absent return the same record and do not write.
- Tests: AC-001 stores `sam@team.com` as the only member and the maintainer. AC-003 writes nothing for `sam @team.com` and for a blank address. AC-002 writes nothing while a team is active. AC-050 stores the caller-supplied next generation after dissolution and does not restore the cleared roster, events, or invites. An empty generation string writes nothing. A rejection equals the input record.
- Done when: Those tests pass without a clock, a file, or a new dependency.

### IMP-004 — Invites

- Epic: E1
- Scope: Implement `invite`, `cancelInvite`, `acceptInvite`, and `declineInvite` for an active record whose generation matches the stamp. Invite: actor is the maintainer, target is usable, not a current member, and has no pending invite. Cancel: actor is the maintainer and the target invite exists. Accept and decline: a pending invite exists for the actor. Accept adds that canonical email as a member, removes the invite, and does not change the maintainer. Decline and cancel remove the invite and do not change the roster. A missing invite writes nothing. An invite does not expire by time and is not retargeted by succession.
- Design: `03-domain-model.md` sections 3 and 4; `08-error-handling-and-observability.md` section 2 codes `unusable-email`, `not-allowed`, `invite-exists`, `already-member`, and `no-matching-invite`.
- PRD: BR-2, AC-004's invite record, AC-005, AC-006, AC-007, AC-008, AC-030, AC-032, AC-033, AC-034, AC-035.
- Prerequisites: IMP-002. Use IMP-003 to build the active team in fixtures.
- Deliverables: The four commands and domain tests. Projection of the invite is IMP-009.
- Tests: One pending invite per canonical email. A case variant of a current member creates no invite. A second invite leaves the original. Another email cannot accept or decline. Succession leaves the invite, and a later accept still adds the email. Accept does not change the maintainer. Decline and cancel end the invite without a roster change. No matching invite writes nothing. A rejected invite, decline, or cancel returns the same record, which is the incomplete-command rule at the domain layer. AC-035's stop-before-replace is IMP-014.
- Done when: Each listed acceptance case passes by comparing the record before and after.

### IMP-005 — Maintainer, removal, and dissolution

- Epic: E1
- Scope: Implement `designate`, `removeMember`, and `dissolve`. Designate makes a different current member the only maintainer and leaves the previous maintainer on the roster. Self-designation writes nothing. Remove drops another current member, deletes that owner's only-self events, and keeps team-visible events with the same owner email and visibility. Self-removal writes nothing. Dissolve writes only when the actor is the sole roster member: same generation, status `dissolved`, and roster, invites, events, and maintainer removed. Two or more members write nothing, whoever asks. Ordinary-member invite, cancel, removal, and self-removal write nothing.
- Design: `03-domain-model.md` sections 3 and 4; `06-security-and-access-control.md` section 3.
- PRD: BR-3, BR-5, AC-009, AC-010, AC-011, AC-019, AC-023, AC-026, AC-038, AC-039, AC-041's record half.
- Prerequisites: IMP-002, IMP-004 for the ordinary-member invite and cancel cases.
- Deliverables: The three commands and domain tests.
- Tests: AC-009 transfers the role immediately. AC-010 and AC-039 write nothing. AC-011 and AC-038 write nothing. AC-019 deletes only-self events and keeps team-visible events. AC-023 clears the sole member's team and does not allocate a new generation. AC-026 at this layer: a record that already contains the completed only-self event loses that event on removal. Queue order is IMP-014. A rejection returns the same record.
- Done when: Role, roster, and event assertions match those criteria.

### IMP-006 — Time port contract

- Epic: E1
- Scope: Add the port type at `apps/desktop/src/domain/time`. `convert(zone, civilTime, occurrence?)` returns an instant or `nonexistent`, `ambiguous`, or `invalid`. With no occurrence, a doubled civil time returns `ambiguous` and does not pick one. A missing civil time returns `nonexistent`. `earlier` or `later` selects that occurrence of an ambiguous time and still fails a nonexistent time. `invalid` is a civil field that is not a real calendar time, such as month 13. Seconds are 0. This task defines the contract and a test double. It does not install a package and does not implement the America/New_York adapter.
- Design: `05-application-design.md` section 6; TD-004. `09-test-strategy.md` section 1 says domain tests depend on port results, not on a particular package.
- PRD: BR-4, DEC-006, AC-014, AC-028, as the contract those tests will call.
- Prerequisites: IMP-002.
- Deliverables: The port type and a fake adapter the domain tests can inject. No `package.json` change.
- Tests: The fake demonstrates each result: instant, `nonexistent`, `ambiguous` without a choice, `earlier`, `later`, and `invalid`. A nonexistent time with `earlier` or `later` still fails.
- Done when: The contract is injectable and no time library has been added.

### IMP-007 — Create an event

- Epic: E1
- Scope: `createEvent` writes only for an active matching generation when the actor is a current member, the supplied id is non-empty and new, and the payload passes the save rules. The domain places that id. It does not read a renderer id and does not mint one. Visibility is explicit. Title is trimmed and must be non-empty. Location and description, when present, are trimmed and may be empty; omitted location and description are stored as `''`. Internal spaces, tabs, and newlines remain. A present start or end is converted through the injected port in the supplied zone. No occurrence on an ambiguous time rejects. A nonexistent time rejects. The resulting end is after the resulting start. Overlap and a past end are allowed. `recurring` or `all-day` rejects. There is no stored recurrence rule and no date-only event. A pending invitee or a removed email writes nothing. The owner email is the actor's canonical email.
- Design: `03-domain-model.md` sections 3 and 4; `05-application-design.md` section 3; `08-error-handling-and-observability.md` codes `empty-title`, `end-not-after-start`, `nonexistent-local-time`, `ambiguous-local-time`, `invalid-local-time`, `recurrence-not-supported`, `all-day-not-supported`, and `not-allowed`.
- PRD: BR-4, AC-012, AC-013, AC-014, AC-015, AC-028, AC-043, AC-044, AC-051.
- Prerequisites: IMP-006.
- Deliverables: `createEvent`, save-rule helpers shared with modify, and domain tests that inject the fake port.
- Tests: AC-012 stores trimmed title `HQ`, empty location, team-visible, and an end instant after the start, and the port is called with the supplied zone. AC-013 writes nothing for an empty-after-trim title or an end that is not after the start. AC-014 writes nothing when the port returns `nonexistent` for `2026-03-08 02:30`. AC-028 writes nothing when the port returns `ambiguous` and no occurrence is supplied. A supplied `earlier` or `later` stores the instant the port returns for that choice. AC-015 writes nothing. AC-043 keeps an internal newline. AC-044 stores a past team-visible event. AC-051 writes nothing for recurring and for all-day. A duplicate or empty supplied id writes nothing. A rejection returns the same record.
- Done when: Those cases pass against the fake port. The real New York instants remain IMP-010.

### IMP-008 — Modify and delete an event

- Epic: E1
- Scope: `modifyEvent` and `deleteEvent` require an active matching generation and an event that exists at execution. The current-member owner may modify or delete, including a visibility change. The maintainer may change text and entered clock times, or delete, only while the owner is not a current member and the event is team-visible. A maintainer payload that includes a different visibility writes nothing, including a title sent with it. No other actor may modify or delete. On modify, omitted visibility, title, location, or description keeps the stored value. A present title is trimmed and must be non-empty. A present location or description is trimmed and may be empty. An omitted start or end keeps the stored instant and does not call the port for that field. A present clock field is converted again in the supplied zone. The resulting end must be after the resulting start. After the owner accepts a later invite, that member is again the only editor and the maintainer's custody has ended. Only-self events deleted at removal stay absent.
- Design: `03-domain-model.md` sections 3 and 4; `05-application-design.md` section 3; `08-error-handling-and-observability.md` codes `event-not-found` and `not-allowed`.
- PRD: BR-4, BR-5, AC-020, AC-021, AC-022, AC-029, AC-031's domain half, AC-037, AC-046's failed-save half, AC-047, AC-048, AC-049.
- Prerequisites: IMP-007. Rejoin fixtures use IMP-004 and IMP-005.
- Deliverables: Modify and delete, plus domain tests.
- Tests: AC-020 writes nothing when custody includes an only-self visibility, and the title stays. AC-021 stores `Clinic` and keeps team-visible. AC-029 changes only the converted end and leaves the start instant identical; a location-only edit omits both clock fields and does not convert them. AC-037 writes nothing for the non-owner. AC-047 lets the maintainer delete the retained event. AC-048 changes location and description and keeps team-visible. AC-022 lets the rejoined owner modify, and the maintainer's modification writes nothing. AC-049 lets the rejoined owner delete, and deleted only-self events stay absent. AC-031 at this layer: after removal, the former member's visibility save returns the same record. AC-046 at this layer: a failed save returns the same record. A missing id returns `event-not-found` and the same record.
- Done when: Custody, owner rights, and omitted-clock behavior match those cases.

### IMP-009 — Projection and busyAt

- Epic: E1
- Scope: `project(record, actor)` returns the view the coordinator may send, not the stored document. Every projection includes `record`: `absent`, `active`, or `dissolved`, even when roster, events, and invites are omitted. No stored email, or an email that is not a member and has no pending invite, gets `no-access` plus `record`, and no roster, events, invites, or busy rows. A pending invitee who is not a current member gets `record: active` and that one invite address. A current member gets `record: active`, whether that actor is the maintainer, the roster, pending invites only when the actor is the maintainer, every team-visible event in full including ended events and events from before the actor joined, and that actor's own only-self events. Each visible event includes `id`, owner, title, location, description, and instants. `busyAt(projection, actor, instant)` is the only half-open implementation: one row per current member, start ≤ instant < end, the viewer's row counts that viewer's team-visible and only-self events, and every other row counts only that member's team-visible events. Busy rows are not part of the pushed projection. Add a pure label function that formats an instant with the supplied zone's offset at that instant. The domain module exports no reminder function and no scheduler.
- Design: `03-domain-model.md` section 5; `05-application-design.md` sections 1 and 8; `09-test-strategy.md` domain and board layers. TDR-REV-022, TDR-REV-024, and TDR-REV-026 are already addressed by this shape.
- PRD: BR-2, BR-4, BR-5, BR-6, AC-004, AC-016, AC-017, AC-018, AC-019's view half, AC-027, AC-036, AC-040, AC-041, AC-042, AC-045.
- Prerequisites: IMP-003, IMP-004, IMP-005, IMP-008.
- Deliverables: `project`, `busyAt`, the label function's domain-side contract, and tests. The renderer import is IMP-020. Real January and July offsets are IMP-010.
- Tests: AC-004 shows the invite and omits roster, events, and busy rows. AC-016 is busy at S and free at E for that event. AC-017 shows the owner's row busy, hides the only-self event from the other member, and still shows the owner busy from the team-visible event. AC-018 keeps an ended event visible in full and not covering a later instant. AC-036 shows pre-join and ended team-visible events in full to the new member. AC-040 lists both members and shows the member with no events as free. AC-041 omits the removed email's row and keeps the retained event attributed to the stored owner email. AC-019's removed actor is `no-access` on an active record. AC-042's busy answer agrees for the same instant. AC-045 shows both overlapping events and a busy member. A later "now" changes busy only because the instant changed, with no new save. Dissolved and absent projections carry `record` and omit team collections. A member projection's events include `id`. AC-027 fails if the domain module grows a reminder export or a reminder result code. A rejection path from earlier tasks still returns the same record.
- Done when: The board can call `busyAt` for a chosen instant and for a later instant, and the domain has one half-open implementation.

### IMP-010 — Time adapter and New York tests

- Epic: E2
- Scope: Install `@js-temporal/polyfill` in `@app/desktop` and implement the port with Temporal `ZonedDateTime`, disambiguation `reject`, `earlier`, or `later`. This is the approved adapter. Luxon is not installed. The main process will read the OS IANA zone with `Intl` in IMP-018. The adapter also formats a stored instant with that zone's offset at that instant, not with one current offset applied to every instant. This task is the first and only dependency installation in the plan. Do not install the package before this task is separately authorized.
- Design: `05-application-design.md` section 6; TD-004; `02-architecture.md` section 6 and risk R-5; `09-test-strategy.md` time-adapter layer.
- PRD: BR-4, BR-6, DEC-006, AC-014, AC-016, AC-028, AC-042.
- Prerequisites: IMP-006.
- Deliverables: The adapter, the package dependency, and adapter tests. No team-rule changes.
- Tests: In `America/New_York`, `2026-03-08 02:30` returns `nonexistent`, including when `earlier` or `later` is supplied. `2026-11-01 01:30` with no occurrence returns `ambiguous`. `earlier` and `later` return the two different instants of that civil time. Month 13 returns `invalid`. One zone-label case formats a January instant and a July instant with the offset of `America/New_York` at each instant, and those offsets differ. The team rules are not executed here.
- Done when: Those adapter tests pass, domain tests still pass against the fake port, and no other package has been added.

### IMP-011 — Load the team document

- Epic: E3
- Scope: Add `apps/desktop/src/main/store`. The production path is `app.getPath('userData')` joined with `team-record.json`. Tests pass a temporary directory. A missing file is absent. A dissolved team is a file, not a missing file. A valid version 1 document loads as that record. `formatVersion` must be the number `1`. Any other version, invalid JSON, or a document that fails the domain invariants is `record-unreadable`. The store does not treat that file as absent, does not delete it, and does not rewrite it. Instants on disk use `YYYY-MM-DDTHH:mm:ss.sssZ`. A stored newline is U+000A. Session emails, edit buffers, zones, labels, busy rows, reminders, recurrence, and all-day dates are not in the file.
- Design: `04-data-design.md` sections 1, 2, 5, 6, and 7; TD-003.
- PRD: BR-7, AC-025 and AC-050 require a dissolved file to remain readable. The load path supports every later command.
- Prerequisites: IMP-002.
- Deliverables: Load, the version 1 parser, and temporary-directory tests. No product permission checks.
- Tests: A missing file is absent. A valid active document and a valid dissolved document round-trip, including a description newline. `formatVersion` other than 1, invalid JSON, and an invariant failure are `record-unreadable`, and the file bytes stay. A load does not promote `team-record.json.tmp`.
- Done when: Those cases pass and the renderer is not given the path.

### IMP-012 — Atomic replace

- Epic: E3
- Scope: Replace the whole document only when the caller asks to commit a new record. Refuse the replace when the current file exists and is not a readable version 1 document. Serialize the next document to `team-record.json.tmp` in the same directory, sync that temporary file, then replace `team-record.json` without deleting the destination first. Use a same-directory rename where that rename is atomic. Leave the existing `team-record.json` bytes in place when a step fails. On the next successful load, ignore a leftover temp file and do not promote it. JSON serialization failure refuses the replace. The store does not repair invariants.
- Design: `04-data-design.md` section 4; `02-architecture.md` section 5 TD-B and risk R-4; TD-003.
- PRD: BR-7. A failed replace must not create a partial roster, invite, or event write.
- Prerequisites: IMP-011.
- Deliverables: The replace sequence and temporary-directory tests.
- Tests: A successful replace is the next load. A failed step keeps the original bytes. An unreadable current file is not overwritten. A leftover `team-record.json.tmp` is ignored on load and is not promoted. A missing file can be created by the first successful replace. A domain rejection never starts this sequence; that is asserted at the coordinator in IMP-014 by using a store double that records replace calls.
- Done when: The four store cases in `09-test-strategy.md` pass: missing file, original bytes kept on failure, leftover temp file ignored, unreadable file not overwritten.

### IMP-013 — Session queue and bind

- Epic: E4
- Scope: Add `apps/desktop/src/main/coordinator`. One queue runs team commands and `bind`, one item at a time. `bind` carries `{ requestedEmail }` for a known session and does not write the document. At its turn the coordinator loads the record once, canonicalizes a usable email, applies the binding rule to that load, stores the session email, and projects from that same load. Absent or dissolved: a usable email is stored; an unusable email leaves the session unbound. Active: the email must be a current member or a pending invite; otherwise the session email does not change and no new session is bound. A removed email with no pending invite is rejected. `openSession` creates an unbound session. A team command from an unknown or unbound session returns `unbound-session` and does not enter the domain. `bind` from a known unbound session is queued. An open session whose email is later removed stays bound to that email. The coordinator does not retarget it. Sessions live in main-process memory. Quitting ends them; the document remains.
- Design: `05-application-design.md` sections 2, 4, and 5; `06-security-and-access-control.md` sections 1 and 2; `07-concurrency-and-consistency.md` section 1; TD-002. TDR-REV-023 is already addressed: bind is on the queue.
- PRD: BR-2, BR-7, AC-004's session view, AC-015 and AC-019 for a removed session's later projection. Binding itself has no separate acceptance id; it is the TD-002 path those criteria use.
- Prerequisites: IMP-001, IMP-002, IMP-009.
- Deliverables: Session table, queue, and bind. Coordinator tests use an in-memory store double.
- Tests: Each row of the binding table in `06-security-and-access-control.md` section 2. Bind does not call replace. A bind queued behind a removal projects from the post-removal record, not from an earlier read. `unusable-email` and `bind-rejected` leave the file and the previous session email unchanged. An unbound command returns `unbound-session`.
- Done when: Bind and team commands share one queue and a rejected bind writes nothing.

### IMP-014 — Command execution

- Epic: E4
- Scope: Accept a team command by loading the file, stamping the generation or absent, and stamping the session id and the email stored at that moment. Ignore any actor email, zone, generation, or create id on the payload. If the file exists and is unreadable, return `record-unreadable` and do not stamp, call the domain, or replace. Enqueue the stamped command. At execution, load again. Apply the create decision table in `07-concurrency-and-consistency.md` section 3 before any create. A stamp mismatch returns `generation-mismatch` and does not write, including a missing file when the stamp has a generation. A dissolved record rejects every command except `createTeam` with `dissolved`. On `createTeam`, mint a non-empty generation string and pass it to the domain. On `createEvent`, mint a non-empty event id and pass it to the domain. Read the zone from the injected zone source and ignore a payload zone. Call the domain with the stamped email. A rejection does not touch the file. A new record is replaced, and the command completes at that replacement. A failed replace returns `replace-failed` and leaves the previous bytes. A thrown load, domain, or later push error is caught, returned, and the queue continues. Map domain rejections to the codes in `08-error-handling-and-observability.md` section 2.
- Design: `05-application-design.md` section 5; `07-concurrency-and-consistency.md` sections 2 and 3; `02-architecture.md` section 3; TD-001. TDR-REV-028 is already addressed: the coordinator supplies the generation.
- PRD: BR-7, AC-002, AC-024's completion point, AC-025, AC-026, AC-031, AC-035, AC-046, AC-050.
- Prerequisites: IMP-003 through IMP-009, IMP-013. The store double must be able to fail a replace. The real store from IMP-012 is wired in IMP-018.
- Deliverables: The execution path and coordinator tests. Two sessions are two ids on one queue.
- Tests: Two creates accepted against absent produce one write; the loser returns `generation-mismatch` and does not write a second team. A create stamped with the still-active generation returns `team-already-active`. AC-025: a save stamped on the dissolved generation writes nothing after dissolution, and a save stamped on the old generation writes nothing after a later create. AC-050's create after dissolution stores the minted next generation. AC-026: an only-self save that completes before removal is deleted by that removal. AC-031: removal that completes before the visibility save leaves the retained event unchanged. AC-035: an invite, decline, or cancel that stops before replace leaves invites and roster as they were. A payload actor, zone, generation, and create id are ignored; the stored session email, the zone source, the acceptance stamp, and the minted create id are what the domain receives. A rejected domain result does not call replace. `replace-failed` keeps the previous document. A command does not wait for another session to be open.
- Done when: Completion order matches section 4 of `07-concurrency-and-consistency.md`, and the payload cannot choose the actor, zone, generation, or create id.

### IMP-015 — Projections per session

- Epic: E4
- Scope: After a completed replace, or after a successful bind, ask the domain for a projection for every session that is still open and push each projection only to that session. Include the zone name. Do not send the stored document, another session's email, or busy rows frozen at push time. A failed push does not roll back a finished rename, and the queue continues. Closing a window drops that session before the next push. A session that is not open is not pushed; its next view loads the file. A second window of the same session is the same actor and is not the other member. `record: absent` or `record: dissolved` is the state in which a bound session may send `createTeam`. `record: active` with `no-access` is not.
- Design: `05-application-design.md` sections 5 and 8; `07-concurrency-and-consistency.md` sections 1 and 4; `02-architecture.md` section 3; TD-001.
- PRD: BR-2, BR-6, BR-7, AC-004, AC-024, AC-033, AC-036, AC-046.
- Prerequisites: IMP-014.
- Deliverables: Per-session publication and coordinator tests.
- Tests: AC-024: after a completed delete, the other open session's projection omits the event. A session opened afterward reads the stored record and also omits it. AC-046: a canceled edit is not a command, and a failed save does not appear in the other session's projection. The maintainer projection includes a pending invite; an ordinary member's projection omits it; the invitee's projection is only that invite. A removed session's next push is `no-access`, or `invite` when a pending invite exists for that same email. A failed push leaves the replaced document in place and the next queued item still runs. Dropping a closed session means that session receives no later push.
- Done when: Open sessions receive different projections from one record, and a failed push does not undo the file.

### IMP-016 — Ambiguous choice and local diagnostics

- Epic: E4
- Scope: Return `{ ok: true, projection }` or `{ ok: false, code, field? }`. When the port reports `ambiguous`, resolve `earlier` and `later` for that field and return those two instants with code `ambiguous-local-time`. If both start and end are ambiguous, `field` is `start`. Nothing is written. The unsent edit stays in the renderer. A nonexistent field returns `nonexistent-local-time` and no instants. No default occurrence is applied. The session that issued the command shows the rejection. Other sessions do not see the unsent fields. A local diagnostic line may record the time, command name, result code, and generation. It does not record event title, location, description, civil-time fields, or event content. No log, metric, or error is sent to a remote service. There is no reminder job and no background scheduler. `replace-failed` is not retried silently.
- Design: `05-application-design.md` section 7; `08-error-handling-and-observability.md` sections 1, 3, 4, and 5.
- PRD: BR-4, DEC-006, AC-014, AC-028, AC-046.
- Prerequisites: IMP-007, IMP-014.
- Deliverables: The result shape, the occurrence resolution, and the diagnostic constraint.
- Tests: An ambiguous start returns `field: 'start'` and two instants, and the store is not replaced. When both fields are ambiguous, the first result names `start`. The following submit, with an occurrence and that field's civil time, can commit. A nonexistent civil time returns `nonexistent-local-time` and no instants. Dismissing the choice performs no write. If a diagnostic line is produced, its recorded fields are only time, command name, result code, and generation.
- Done when: The occurrence result is available to the renderer and the document is unchanged until a later successful command.

### IMP-017 — Single-instance lock and the second process

- Epic: E4
- Scope: The first process takes Electron's single-instance lock before the first record read and handles `second-instance` by focusing its window and showing that a writer already exists. A process that does not acquire the lock exits without reading or writing and does not focus a window. Version 1 does not add a cross-process file lock on top of this lock. A process started with the lock disabled is outside this design and is not a supported mode.
- Design: `06-security-and-access-control.md` section 5; `07-concurrency-and-consistency.md` sections 1 and 5; `02-architecture.md` section 5. TDR-REV-027 is addressed in the design and unimplemented in the shell.
- PRD: BR-7. This is the one-writer rule, not an extra acceptance id.
- Prerequisites: IMP-012, IMP-014.
- Deliverables: The lock and the `second-instance` handler, plus the second-process test from `09-test-strategy.md`.
- Tests: The first process handles `second-instance` by focusing its window. The second launch does not change the fixture and does not focus a window itself. The test does not run AC-001 through AC-051. It does not require a packaged installer. It does require the lock to be held before a read.
- Done when: A second process cannot replace `team-record.json`, and the first process is the one that focuses a window.

### IMP-018 — Register windows in the existing shell

- Epic: E4
- Scope: Extend `apps/desktop/src/main/index.ts` so the coordinator creates and registers every window, including the first window and the window opened when the app is activated and no window is open. An unregistered window is not shown. Closing the last window does not by itself create a window outside the coordinator. Keep `contextIsolation`, `sandbox`, and `nodeIntegration: false`. Keep quitting on `window-all-closed` except on `darwin`. Pass `app.getPath('userData')` into the store. Read the OS IANA zone with `Intl` and pass that zone into the coordinator. Take the single-instance lock before the first read. Wire the real store and the IMP-010 adapter. Do not add team commands to `@app/website`, `@app/admin`, `@app/api`, `@app/shared`, or `@app/api-client`.
- Design: `05-application-design.md` sections 1, 6, 9, and 10; `02-architecture.md` section 2. TDR-REV-029 is addressed in the design. The current `activate` handler is the code this task replaces with coordinator registration.
- PRD: BR-7, AC-016, AC-024, AC-042. The later view after the last window closes has a registered session path.
- Prerequisites: IMP-012, IMP-013, IMP-015, IMP-017, and IMP-010 before the real adapter is wired.
- Deliverables: The shell extension. No new product screen.
- Tests: A window opened from `activate` when none are open is registered and can bind. A window the coordinator did not register is not shown. The zone passed to the domain is the `Intl` zone, not a renderer field. Existing isolation flags remain. Desktop typecheck covers the wiring. This task does not add a visual test.
- Done when: Startup, activate, lock, store path, and zone source all go through the coordinator, and the other workspace packages still have no team commands.

### IMP-019 — Preload API

- Epic: E5
- Scope: Extend `apps/desktop/src/preload` so `contextBridge` exposes `desktop.platform` and the team operations `bind`, `openSession`, `command`, and a projection push for this window's session. Payloads are only those in `05-application-design.md` sections 2 and 3. The renderer does not send an actor email, a zone, or a generation. `createEvent` has no renderer id. `modifyEvent` and `deleteEvent` use `eventId` from this session's projection. The preload does not expose the file path, the stored document, another session's email, or a general IPC send. The main process assigns the session id when it creates the window.
- Design: `05-application-design.md` section 2; `06-security-and-access-control.md` section 4.
- PRD: BR-7, AC-046. The bridge must not let the renderer commit an unsent edit by writing the file.
- Prerequisites: IMP-013, IMP-014, IMP-016.
- Deliverables: The typed preload API and a test that the exposed surface is those operations. Isolation flags stay as they are in the shell.
- Tests: A command payload has no place for actor, zone, or generation. `openSession` sends no email. `bind` sends only `requestedEmail`. A projection handler receives only this window's push. The file path is not on the exposed API.
- Done when: The renderer can call only that API, and `nodeIntegration` remains false.

### IMP-020 — Renderer operations

- Epic: E5
- Scope: Extend the existing React renderer so an operator can enter an email, bind, open another session, enter one event's fields, choose `earlier` or `later` when the result asks, and call domain `busyAt` for the instant being viewed and for a later now. The renderer may import `busyAt` and no other domain export. It does not keep a second half-open rule. Layout beyond these operations is not specified; do not invent a visual design, a component library, or extra screens. Hold the unsent edit in the session. Send `start` or `end` only when that clock field was edited or when the previous result asked for an occurrence on that field. Omit the other clock field unless the operator also edited it. A successful rebind discards that session's unsent edit. Canceling an edit or dismissing an occurrence choice does not send a write. The successful UI does not offer recurring or all-day modes. If a payload is still marked that way, the command path already rejects it. Show the rejection code to the session that issued the command. Clock labels use the zone name on the projection and the label function's offset at each instant. There is no reminder timer that writes the record.
- Design: `05-application-design.md` sections 1, 3, 7, and 8; `02-architecture.md` sections 2 and 3. TDR-REV-025 and TDR-REV-026 are already addressed by these rules.
- PRD: BR-4, BR-6, DEC-006, AC-012, AC-016, AC-017, AC-028, AC-029, AC-042, AC-046.
- Prerequisites: IMP-009, IMP-016, IMP-019.
- Deliverables: The minimum renderer path for those operations. No new product rules.
- Tests: Binding sends the requested email and renders the returned projection. Opening a session requests a new window without an email. An event submit sends the edited fields and omits an unedited clock field. An ambiguous result lets the operator choose `earlier` or `later`, and the next submit includes that occurrence and that field. Cancel and dismissing the choice send no command. A successful rebind drops the previous unsent fields. The board calls `busyAt` at a chosen instant and again at a later now. A source check, or an equivalent test, shows the renderer does not import domain command or record writers. AC-016 and AC-042 labels come from the supplied zone at each instant.
- Done when: Those interactions work against the preload API, and no layout beyond them has been added.

### IMP-022 — Accepted UI package

- Epic: E5
- Scope: Implement S-01 through S-08 and I-01 through I-15 from the accepted UI documents under `docs/ui-ux/`. Map `docs/ui-ux/tokens/design-tokens.json` to plain CSS custom properties in the desktop renderer. Do not install a token compiler or a component library. The renderer may import `busyAt` and no other domain export. Include create-team, invite accept and decline, no-access, the team workspace, maintainer actions, custody edit, I-15 in-place confirmation, the unreadable-record surface, and the writer notice. Clock entry is `YYYY-MM-DD HH:mm`. Dismissing an ambiguous choice returns to the workspace and discards the unsent edit. The first press of remove, delete, or dissolve does not send.
- Design: accepted UI package, 2026-11-20. Technical contracts stay `05-application-design.md` and `08-error-handling-and-observability.md`.
- PRD: AC-001 through AC-051, except AC-027, which has no reminder surface.
- Prerequisites: IMP-020.
- Deliverables: The renderer surfaces and token variables. No new domain rule.
- Tests: A source check still shows the renderer imports no domain command writer. Interaction tests cover bind, create team, invite response, one event save, an occurrence choice, busyAt, and the confirmation step not sending on the first press.
- Done when: Those surfaces follow the accepted English UI documents.

### IMP-021 — Acceptance command

- Epic: E6
- Scope: Change the `@app/desktop` test script from `vitest run --passWithNoTests` to `vitest run`. Run that command. Do not add `--passWithNoTests` back. This is the only planned edit to the test script. Leave the script unchanged until this task, so the current script is not treated as evidence that AC-001 through AC-051 passed.
- Design: `09-test-strategy.md` section 1. TDR-REV-021 is addressed by this gate. The design stage itself did not change `package.json`.
- PRD: AC-001 through AC-051.
- Prerequisites: IMP-001 through IMP-022.
- Deliverables: The updated script and a passing Vitest run whose tests cover every acceptance id in section 6.
- Tests: `vitest run` in `@app/desktop`, with no `--passWithNoTests`. A missing test file fails the command. The run includes the domain, time-adapter, store, coordinator, board, and second-process layers named in `09-test-strategy.md`.
- Done when: That command exits successfully and every id in section 6 has an assertion in the run.

## 5. Milestones

| Milestone | After | Outcome |
|---|---|---|
| M1 Domain | IMP-009 | Pure commands, invariants, projection, and `busyAt` pass against a fake time port. No package has been installed. |
| M2 Time | IMP-010 | The polyfill adapter passes the New York gap, overlap, and January/July label cases. |
| M3 Store | IMP-012 | Temporary-directory tests cover a missing file, a failed replace, a leftover temp file, and an unreadable file. |
| M4 Coordinator | IMP-018 | One queue, bind, generation stamps, per-session projections, the lock, and coordinator-owned windows including darwin `activate`. |
| M5 Operator path | IMP-022 | IMP-020's operations are in place, and the accepted surfaces S-01 through S-08 and I-01 through I-15 are implemented. |
| M6 Gate | IMP-021 | `vitest run` without `--passWithNoTests` is the acceptance command and passes. |

## 6. Risks

These risks are already accepted or mitigated in the approved design. Implementation follows that mitigation.

| ID | Risk | Plan response |
|---|---|---|
| R-1 | Members on separate computers do not share a live record. | No sync task. AC-024 uses another local session or a later view. |
| R-2 | Anyone at this computer can bind an allowed email. Inbox control is not proved. | IMP-013 implements the binding table only. No login task. |
| R-3 | Older architecture notes still call the API the trust boundary. | Tasks stay in `@app/desktop`. The main process plus the domain is the version 1 boundary. |
| R-4 | A crash during replacement can leave a partial file if the replace is not atomic. | IMP-012 syncs a temp file and replaces without deleting the destination first. |
| R-5 | A time library can disagree with the named New York civil times. | IMP-010 tests AC-014 and AC-028 against `@js-temporal/polyfill`. |
| R-6 | CI still installs without a lockfile. | This plan does not add a lockfile policy. The only new dependency is the polyfill in IMP-010. |

Further implementation constraints:

- Do not install `@js-temporal/polyfill`, or any other package, before IMP-010. The design stage did not install it. Planning does not install it.
- Do not change the desktop test script before IMP-021. Until that task, the script still uses `--passWithNoTests`, and that run is not the acceptance gate.
- Do not give the renderer a second half-open implementation.
- Do not leave the darwin `activate` path creating an unregistered window.
- Do not let the second process focus a window or read the record.

## 7. Out of scope

The approved design already excludes these. No task implements them.

- A second computer, a sync copy, a merge flow, or a shared database.
- Inbox proof, login, or a mail provider.
- Team commands, screens, or HTTP routes in `@app/website`, `@app/admin`, or `@app/api`.
- Using `@app/shared` or `@app/api-client` for team behavior.
- Start reminders, invite reminders, or any scheduler that writes the record.
- Recurring events and all-day or date-only events, except the rejection of those payloads.
- File encryption. Another process that can read the user-data directory is outside the actor model.
- SQLite, a server database, or a migration from an older document. An unknown `formatVersion` stays unreadable.
- Remote logs, metrics, or error reporting.
- A visual design other than the accepted UI package implemented by IMP-022.
- A cross-process file lock in addition to the single-instance lock.
- Restoring a dissolved team, a deleted only-self event, or a deleted event.
- Installing packages during planning or during any task other than IMP-010.

## 8. Definition of done

Version 1 of this plan is done when all of the following are true:

- IMP-001 through IMP-022 meet their done criteria.
- The `@app/desktop` acceptance command is `vitest run` without `--passWithNoTests`, and that command passes.
- Until IMP-021 changes the script, `apps/desktop/package.json` still has `vitest run --passWithNoTests`. A run of the unchanged script is not evidence that the acceptance map passed.
- AC-001 through AC-051 each have an assertion, in the groups in section 6.
- The desktop shell still isolates the renderer, and the coordinator owns every shown window.
- Website, admin, API, shared, and API client packages have no new team behavior.
- No task has added a reminder, a recurrence rule, an all-day success path, encryption, or a second computer.

The user authorized that work on 2026-11-20. This document still does not deploy it.

## 9. Acceptance traceability

Groups are the ones in `09-test-strategy.md` section 2. The task named first is the one that must make that group's domain or layer assertion pass. Later tasks wire the same rule through the queue, the file, or the renderer.

| Criteria | Assertion to preserve | Tasks that must make it pass |
|---|---|---|
| AC-001, AC-003, AC-050 | Canonical roster and maintainer; unusable input writes nothing; create after dissolution makes a new generation. | IMP-001, IMP-003. IMP-014 stamps the base and supplies the next generation. IMP-009 shows `record: absent` and `record: dissolved`. |
| AC-002 | Second create writes nothing. | IMP-003. IMP-014 returns one code when the second queued create loses. |
| AC-004, AC-005, AC-006, AC-007, AC-008, AC-030, AC-032, AC-033, AC-034, AC-035, AC-036 | Invite projection, only the invitee accepts or declines, one pending invite, succession keeps it, incomplete invite changes nothing, a new member sees existing team-visible events. | IMP-004 and IMP-009. IMP-013 projects the invitee from the bind load. IMP-014 covers a command that stops before replace. IMP-015 pushes the maintainer and invitee projections separately. |
| AC-009, AC-010, AC-011, AC-038, AC-039 | Maintainer transfer, self-removal, self-designation, ordinary-member roster actions, and multi-member dissolution write nothing. | IMP-005. |
| AC-012, AC-013, AC-043, AC-044 | Trim, empty location, kept newline, past event. A domain rejection returns the same record. | IMP-007. IMP-020 sends an edited event without inventing a layout. |
| AC-014, AC-028 | Nonexistent and ambiguous civil times write nothing. A supplied `earlier` or `later` stores that occurrence. | IMP-007 with the fake port. IMP-010 with `America/New_York`. IMP-016 returns the two instants without writing. IMP-020 submits the chosen occurrence. |
| AC-015, AC-037 | Invitee, removed email, and non-owner do not change events. | IMP-007 and IMP-008. |
| AC-016, AC-017, AC-018, AC-040, AC-042, AC-045 | Half-open busy at the viewed instant, including a later now. Only-self hidden from the other member. Ended event still visible. Free member listed. Labels use the zone offset at each instant, including January and July. Overlap shows both events. | IMP-009. IMP-010 for the January and July offsets. IMP-018 supplies the OS zone. IMP-020 calls `busyAt` and does not copy the rule. |
| AC-019, AC-020, AC-021, AC-022, AC-023, AC-029, AC-041, AC-047, AC-048, AC-049 | Removal, custody title without a visibility change, rejected visibility change, rejoin restores the owner and not the maintainer, sole dissolution. An omitted start or end keeps the stored instant. A modify that sends a clock field converts that field. | IMP-005 for removal and dissolution. IMP-008 for custody, rejoin rights, and omitted clocks. IMP-009 for the removed row and retained event. IMP-004 for the accept that rejoins. |
| AC-024, AC-046 | After a completed delete, the other open session's projection omits the event. Cancel and a failed save do not change the document and do not appear in the other session's projection. | IMP-015. IMP-007 and IMP-008 return the same record on failure. IMP-020 does not send a cancel as a write. IMP-013's successful rebind is the cue to drop the unsent buffer. |
| AC-025, AC-026, AC-031 | Completion order on one queue. | IMP-014. IMP-005 and IMP-008 hold the record results once that order has loaded. IMP-011 keeps the dissolved generation on disk. |
| AC-027 | No result code and no domain API schedules a reminder. A test fails if the domain module grows a reminder export. | IMP-009. No other task adds a reminder export or a scheduler. |
| AC-051 | Recurring and all-day payloads write nothing. | IMP-007. IMP-020 does not offer those modes. |

### Every acceptance id

| ID | Must pass in |
|---|---|
| AC-001 | IMP-003 |
| AC-002 | IMP-003, IMP-014 |
| AC-003 | IMP-001, IMP-003, IMP-004 |
| AC-004 | IMP-009, IMP-013 |
| AC-005 | IMP-004 |
| AC-006 | IMP-004 |
| AC-007 | IMP-004 |
| AC-008 | IMP-004 |
| AC-009 | IMP-005 |
| AC-010 | IMP-005 |
| AC-011 | IMP-005 |
| AC-012 | IMP-007 |
| AC-013 | IMP-007 |
| AC-014 | IMP-007, IMP-010 |
| AC-015 | IMP-007 |
| AC-016 | IMP-009, IMP-010, IMP-020 |
| AC-017 | IMP-009, IMP-020 |
| AC-018 | IMP-009 |
| AC-019 | IMP-005, IMP-009 |
| AC-020 | IMP-008 |
| AC-021 | IMP-008 |
| AC-022 | IMP-004, IMP-008 |
| AC-023 | IMP-005 |
| AC-024 | IMP-015 |
| AC-025 | IMP-014 |
| AC-026 | IMP-005, IMP-014 |
| AC-027 | IMP-009 |
| AC-028 | IMP-007, IMP-010, IMP-016, IMP-020 |
| AC-029 | IMP-008, IMP-020 |
| AC-030 | IMP-004 |
| AC-031 | IMP-008, IMP-014 |
| AC-032 | IMP-004 |
| AC-033 | IMP-004, IMP-015 |
| AC-034 | IMP-004 |
| AC-035 | IMP-004, IMP-014 |
| AC-036 | IMP-009 |
| AC-037 | IMP-008 |
| AC-038 | IMP-005 |
| AC-039 | IMP-005 |
| AC-040 | IMP-009 |
| AC-041 | IMP-005, IMP-009 |
| AC-042 | IMP-009, IMP-010, IMP-020 |
| AC-043 | IMP-007 |
| AC-044 | IMP-007 |
| AC-045 | IMP-009 |
| AC-046 | IMP-008, IMP-015, IMP-020 |
| AC-047 | IMP-008 |
| AC-048 | IMP-008 |
| AC-049 | IMP-004, IMP-008 |
| AC-050 | IMP-003, IMP-014 |
| AC-051 | IMP-007 |

AC-001 through AC-051 are all named above. Business rules BR-1 through BR-7 are covered by the same tasks: BR-1 by IMP-001 and IMP-003; BR-2 by IMP-004 and IMP-009; BR-3 by IMP-005; BR-4 by IMP-007 and IMP-008; BR-5 by IMP-005 and IMP-008; BR-6 by IMP-009; BR-7 by IMP-012, IMP-014, IMP-015, and IMP-017.
