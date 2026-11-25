# Architecture Review Report

- Review date: 2026-11-19
- Gate: Architecture Baseline Gate
- Design version reviewed: `docs/technical/02-architecture.md` as first submitted, before the revisions recorded in the disposition below
- Reviewer: Technical Design Reviewer (independent, read-only)
- Overall result: Changes required. The draft meets the structural gate checklist and is not a sufficient baseline to start detailed design.
- This report does not approve the architecture.

## Review scope

Evidence the reviewer reported reading: `docs/process/TECHNICAL_DESIGN.md`, `docs/product/04-prd.md` (APPROVED, version 0.1 draft, DEC-011), `docs/product/03-decision-log.md` (DEC-006, DEC-007, DEC-008, DEC-009, DEC-011), `docs/technical/00-repository-analysis.md`, `docs/technical/01-technical-requirements.md`, `docs/technical/02-architecture.md`. Repository checks: root `package.json`, `pnpm-workspace.yaml`, `apps/desktop/package.json`, `apps/desktop/src/main/index.ts`, `apps/desktop/src/preload/index.ts`, and `docs/architecture/overview.md`.

## Strengths

- Product authority is the approved PRD. TD-A and TD-B are labeled recommendations, not approval.
- Version 1 stays in `@app/desktop`. Website, admin, and API are left unused, matching the absence of approved behavior for them.
- The main-process writer, preload isolation, and renderer-not-authorizing split matches the current shell: `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`, and a preload that exposes only `desktop.platform`.
- Whole-document replace, rejection without a write, and no reminder/recurrence/all-day module match BR-7, AC-027, and AC-051.
- Section 7 names BR-1 through BR-7 and AC-001 through AC-051. The reviewer described this as a manual ID check, not an executed test.
- Q-TZ stays a library choice. The gap and ambiguous-time failure rule is fixed by AC-014 and AC-028.

## Material risks reported

- One local file may fail AC-024 for two members who are not two windows on one computer.
- A full snapshot pushed to every window can show only-self events and invites to the wrong actor.
- Letting the local operator select any known email is actor behavior the PRD did not confirm.
- A later create can erase the dissolved document a late command still needs to see.
- Two desktop processes can replace the same file.

## Limitations reported by the reviewer

- Detailed-design topics deferred by `02-architecture.md` section 9 were not reviewed as if they were specified.
- This pass did not re-read `apps/website`, `apps/admin`, `apps/api`, CI, or search the tree for `pnpm-lock.yaml`.
- No tests were run. The reviewer made no product decision.

## Findings

### TDR-REV-001

- **Severity:** HIGH
- **Affected design section and PRD requirement(s):** `02-architecture.md` sections 1, 3, and 8 (TD-A, A-LOCAL, Q-REC, R-1). PRD section 2, BR-7, AC-024, DEC-009.
- **Evidence and concrete scenario:** The PRD says movement of the team record between devices is outside the behavioral contract. It also says a member who is viewing sees a completed change, and a member who is not viewing sees it on the next view, without other members being online (BR-7, AC-024, DEC-009). The reviewed section 1 treats that out-of-contract sentence as a reason that version 1 has no shared record. The reviewed section 3 defines "not online" as "a command does not wait for another member or another window." Scenario: member A deletes an event on one computer; member B opens the app later on another computer. Under TD-A, B does not see the deletion. AC-024 says B sees it on the next view.
- **Problem and impact:** A-LOCAL is a product interpretation, not a consequence of the PRD. Detailed design of a local file (TD-B) would proceed against a requirement it may not meet. ALT-1 is held back, and Q-REC stays open, so this baseline cannot be the architecture that detailed design builds on until the user chooses.
- **Recommended resolution or alternatives:** Ask the user whether version 1 members share one record across computers. If yes, replace TD-A and TD-B with a design that has a shared record before detailed design. If no, record an explicit user decision that version 1 is one computer and that AC-024's other member is another window or later view on that computer. Do not close Q-REC by inference.
- **User/product decision required:** YES
- **Status:** OPEN

### TDR-REV-002

- **Severity:** HIGH
- **Affected design section and PRD requirement(s):** `02-architecture.md` sections 2, 3, 6, and 8 (actor binding, A-ACT, Q-ACT, R-2). PRD section 2, actors, BR-2, BR-3, BR-4, AC-004, AC-005, AC-015, AC-037, AC-038, DEC-008.
- **Evidence and concrete scenario:** The reviewed section 1 says the renderer does not decide permissions. The reviewed section 6 says each command carries an acting email chosen in the local session. A-ACT said anyone who can operate the app can select an email the record already knows. The coordinator attached that email, and the baseline did not say the main process is the only place the binding is stored, or that a command payload cannot name a different email. Scenario: the window's command is sent as the maintainer's email, and the domain allows an invite or a removal.
- **Problem and impact:** The trust boundary and A-ACT disagree. Implemented as first written, actor rules are only as strong as the renderer. A-ACT also adds a behavior the PRD does not state: any person at the keyboard may act as any roster email. "Proof of inbox control is out of contract" allows the design to skip a proof flow. It does not approve impersonation.
- **Recommended resolution or alternatives:** State that the main process stores the session email and ignores an acting email supplied on the command. Keep inbox proof out of version 1. Separately ask the user whether one local operator may act as any known roster email. If the user says no, the session-binding design has to change before detailed design of authorization.
- **User/product decision required:** YES
- **Status:** OPEN

### TDR-REV-003

- **Severity:** HIGH
- **Affected design section and PRD requirement(s):** `02-architecture.md` sections 2, 3, 4, and 7. PRD BR-2, BR-4, BR-5, BR-6, AC-004, AC-017, AC-018, AC-036, DEC-007, DEC-008.
- **Evidence and concrete scenario:** The reviewed coordinator publishes one committed snapshot to open windows, and each window applies that snapshot. The domain visibility row says only-self is readable by the owner, and it does not say that every current member sees team-visible events in full, including events from before they joined and events that have ended. Scenario: the maintainer's window and another member's window are both open. The maintainer saves an only-self event. The full document snapshot is pushed to both windows. The other member sees that event, which AC-017 forbids. The same path shows roster and events to a pending invitee, which AC-004 forbids.
- **Problem and impact:** The read path cannot satisfy the visibility rules. Detailed design of IPC payloads had no rule for what a snapshot may contain for a given actor.
- **Recommended resolution or alternatives:** Define the published view as a per-actor projection: invite-only for a pending invitee; no team data for a removed email; only-self events only for their owner; team-visible events, with full content, for every current member; busy/free rows for current members only, with only-self coverage counted only on the owner's row. Do not send the stored document to the renderer.
- **User/product decision required:** NO
- **Status:** OPEN

### TDR-REV-004

- **Severity:** MEDIUM
- **Affected design section and PRD requirement(s):** `02-architecture.md` sections 4 and 5. PRD BR-1, BR-7, AC-025, AC-050, DEC-009.
- **Evidence and concrete scenario:** A dissolved document must stay distinguishable "long enough" that a late command cannot recreate the dissolved team or its events. A later create replaces that document with a new team. Scenario: a member's save is still queued; the sole member dissolves the team; a new team is created; the queued save then runs against the new active document and can write an event into the new team.
- **Problem and impact:** "Long enough" is not an invariant. After AC-050, the dissolved generation is gone, so a command has no base record to be checked against.
- **Recommended resolution or alternatives:** Give the team record a generation identity. A command applies only to the generation it read. A mismatch, including dissolved-then-created, writes nothing.
- **User/product decision required:** NO
- **Status:** OPEN

### TDR-REV-005

- **Severity:** MEDIUM
- **Affected design section and PRD requirement(s):** `02-architecture.md` sections 5 and 8 (A-ONE-PROCESS, R-4). PRD BR-7, AC-035, DEC-009.
- **Evidence and concrete scenario:** The coordinator queue serializes commands in one main process. The reviewed baseline called two writers an operational limit. `apps/desktop/src/main/index.ts` creates a window when the app is ready and does not take a single-instance lock. Scenario: the user opens the app twice. Two processes each replace the file. The second replace can drop the first completed command.
- **Problem and impact:** BR-7's consistency rule is only true inside one process unless a lock makes the one-writer assumption hold.
- **Recommended resolution or alternatives:** Make a single-writer constraint part of TD-B: an application single-instance lock, or a file lock around read-modify-replace. Specify the failure the second process shows.
- **User/product decision required:** NO
- **Status:** OPEN

### TDR-REV-006

- **Severity:** LOW
- **Affected design section and PRD requirement(s):** `02-architecture.md` sections 3 and 6. PRD BR-4, DEC-006, AC-014, AC-028, AC-042.
- **Evidence and concrete scenario:** The reviewed coordinator passes a device zone into the conversion port and does not say the main process reads that zone from the operating system. Scenario: a command supplies `America/Los_Angeles` while the machine zone is `America/New_York`. The `2026-03-08 02:30` gap in AC-014 is not rejected, or a real local time is rejected.
- **Problem and impact:** Stored instants depend on the saving device's zone. An untrusted zone breaks that rule.
- **Recommended resolution or alternatives:** State that the main process observes the OS IANA zone at save and at display. The renderer may send civil time and, when required, an occurrence choice. It does not send the zone that the domain trusts.
- **User/product decision required:** NO
- **Status:** OPEN

### TDR-REV-007

- **Severity:** LOW
- **Affected design section and PRD requirement(s):** `02-architecture.md` section 5 (TD-B). PRD BR-4 only-self visibility, DEC-003 as reflected in BR-4.
- **Evidence and concrete scenario:** The reviewed store is one local document with no directory and no file-access constraint. Any other process that can read the file sees only-self content. The reviewer found no existing persistence path in the repo.
- **Problem and impact:** Actor projection does not protect the file. An unspecified path can land in a shared or backup location.
- **Recommended resolution or alternatives:** Place the document in the OS user application-data directory and treat filesystem access outside the app as outside the actor model. Do not add encryption unless a later product decision requires it.
- **User/product decision required:** NO
- **Status:** OPEN

## Primary-agent disposition

The reviewer does not edit the design. The dispositions below are the primary Technical Designer's.

| Finding | Classification | Action | Status |
|---|---|---|---|
| TDR-REV-001 | Product decision | Wording in `02-architecture.md` now says TD-A is not a confirmed reading of AC-024. Q-REC stays open. The user is asked which record scope version 1 has. | OPEN |
| TDR-REV-002 | Product decision, plus a technical binding | `02-architecture.md` now stores the session email in the main process and ignores an acting email on the command. Inbox proof stays out of version 1. Whether one operator may select any roster email stays open. | OPEN |
| TDR-REV-003 | Technical design | Per-actor projection added in sections 2, 3, 6, and 7. The stored document is not sent to the renderer. | ADDRESSED in the draft; re-review pending |
| TDR-REV-004 | Technical design | Generation identity added. A command applies only to the generation it read. | ADDRESSED in the draft; re-review pending |
| TDR-REV-005 | Technical design | TD-B now includes a single-instance lock or a file lock. A second process does not write. | ADDRESSED in the draft; re-review pending |
| TDR-REV-006 | Technical design | The main process reads the OS IANA zone. The renderer does not supply the trusted zone. | ADDRESSED in the draft; re-review pending |
| TDR-REV-007 | Technical design | The document location is the OS user application-data directory. Encryption is not added. | ADDRESSED in the draft; re-review pending |

Detailed design stays blocked while TDR-REV-001 and TDR-REV-002 are OPEN.

## Re-review

A second read-only pass reviewed the revised `docs/technical/02-architecture.md`. It did not edit this report. Its result: detailed design may not start.

| Finding | Re-review result |
|---|---|
| TDR-REV-001 | OPEN. The text no longer treats local-only as a confirmed reading of AC-024. The user still has to choose. One session email in the main process means a second window on the same computer is the same actor and does not by itself provide AC-024's other member. |
| TDR-REV-002 | OPEN for the product half. The technical half is in the text: the main process stores the session email and ignores an acting email on the command. |
| TDR-REV-003 | Resolved in the current text. |
| TDR-REV-004 | OPEN. Generation was named, and the execution path reloaded the latest generation instead of the generation observed at acceptance. |
| TDR-REV-005 | Resolved in the current text. The current shell still has no lock; the baseline says adding it is part of TD-B. |
| TDR-REV-006 | Resolved in the current text. |
| TDR-REV-007 | Resolved in the current text. |
| TDR-REV-008 | OPEN. Pending-invite audience was incomplete. |
| TDR-REV-009 | OPEN. Create from an absent record had no base generation. |

### TDR-REV-008

- **Severity:** MEDIUM
- **Affected design section and PRD requirement(s):** Section 3 step 6 and section 7 BR-2 row. PRD BR-2, AC-033.
- **Evidence and concrete scenario:** BR-2 says the pending address is visible only to that email and the current maintainer. The reviewed projection did not say an ordinary member excludes other pending invites, and it did not say the maintainer includes them. Scenario: ordinary member B can see `sam@team.com`'s pending invite, or the maintainer has no read model for cancel.
- **Problem and impact:** Detailed design of the projection can show a pending address to the wrong member or hide it from the maintainer.
- **Recommended resolution or alternatives:** A pending invite appears only in the invited email's projection and the current maintainer's projection.
- **User/product decision required:** NO
- **Status:** OPEN

### TDR-REV-009

- **Severity:** MEDIUM
- **Affected design section and PRD requirement(s):** Sections 3, 4, and 5. PRD BR-1, AC-001.
- **Evidence and concrete scenario:** A command must carry the generation it read, and a mismatch writes nothing. Absent has no generation. Scenario: no team file exists, the founder submits `Sam@Team.com`, and the mismatch rule writes nothing.
- **Problem and impact:** The first create cannot complete unless absent is an explicit base case.
- **Recommended resolution or alternatives:** Absent is a base with no team generation. Create from that base allocates the first generation. Every other command against absent writes nothing.
- **User/product decision required:** NO
- **Status:** OPEN

## Disposition after the re-review

| Finding | Action after the re-review | Status |
|---|---|---|
| TDR-REV-004 | The coordinator stamps the generation observed at acceptance. Execution writes nothing on mismatch. Create after dissolution allocates the next generation. A save against a dissolved generation writes nothing. | ADDRESSED. A later read-only pass confirmed the current text. |
| TDR-REV-008 | Section 3 step 6 and the BR-2 traceability row limit a pending invite to the invited email and the current maintainer. | ADDRESSED. A later read-only pass confirmed the current text. |
| TDR-REV-009 | Absent is a base with no generation. Create from absent allocates the first generation. Every other command against absent writes nothing. | ADDRESSED. A later read-only pass confirmed the current text. |

A third read-only pass checked only TDR-REV-004, TDR-REV-008, and TDR-REV-009. It found them satisfied and added no TDR-REV-010. It did not close TDR-REV-001 or TDR-REV-002. No technical finding other than those two still blocks detailed design. That pass is not approval of the architecture.

## User decision on TDR-REV-001

On 2026-11-19 the user selected one computer. Version 1 does not synchronize the team record across computers. AC-024's other member is another local session, or a later view of the same local record. The primary designer recorded that choice in `docs/technical/02-architecture.md` and changed the runtime from one session email to multiple sessions in the one writer process. A second window bound to the same session remains the same actor.

| Finding | Action | Status |
|---|---|---|
| TDR-REV-001 | User choice recorded. Design revised to one local record and multiple local sessions. | ADDRESSED. A later read-only pass found the revision consistent with the user's choice and opened no TDR-REV-010. |

TDR-REV-002 remains recorded below. The PRD text was not changed.

## User decision on TDR-REV-002

On 2026-11-19 the user selected the session-binding rule. The operator of this computer may enter the founder email when no team exists. When a team exists, a session may be bound only to a current member or to an email with a pending invite. The operator may open another session for a different email that meets that rule. Version 1 does not prove inbox control. A bind request that fails does not change the session or the team record. The primary designer recorded the rule in `docs/technical/02-architecture.md` section 3.

| Finding | Action | Status |
|---|---|---|
| TDR-REV-002 | User choice recorded as the session-binding rule. Commands still use the stored session email. | ADDRESSED. A later read-only pass found no new finding and no remaining technical finding that blocks detailed design. |
