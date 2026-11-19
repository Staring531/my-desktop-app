# Architecture Baseline

- Stage: 2 — Architecture Baseline
- Date: 2026-11-19
- Status: APPROVED by the user on 2026-11-19. Reviewer status did not approve this document. This approval does not authorize application code.
- Product authority: `docs/product/04-prd.md`, version 0.1 draft, APPROVED (DEC-011)
- Inputs: `docs/technical/00-repository-analysis.md`, `docs/technical/01-technical-requirements.md`
- Detailed schema, API contracts, and test design are Stage 3. This document sets direction only.

Choices below are recommendations with alternatives. They become technical decisions only after this design is explicitly approved. They do not change the PRD.

## 1. Architecture style

**TD-A, selected for this baseline by the user on 2026-11-19: one desktop application on one computer owns version 1 behavior.** A pure domain module applies the approved rules to one local team record. The Electron main process is the only writer. It holds one email for each local session. The renderer sends commands and renders the projection for its own session. It does not decide permissions.

The user chose this in response to TDR-REV-001. Version 1 does not synchronize the record across computers. For AC-024, the other member is another session on this computer, or a later view of this same record. This choice is recorded here and does not change the PRD text.

Rationale:

- The approved product is a desktop app for one team. BR-7 is a single record with whole-commit updates and first-completed-write-wins.
- The user confirmed that version 1 keeps that record on one computer. The design does not add a sync product, a second copy, or a merge flow.
- The repository already has an Electron shell whose renderer is isolated from Node. Putting the writer in the main process keeps the untrusted renderer from bypassing rules.
- Website, admin, and API scaffolds have no approved behavior. Leaving them unused avoids a server, an account system, and a deployment that the PRD does not require.

### Alternatives

| ID | Alternative | Why it was not recommended |
|---|---|---|
| ALT-1 | Desktop clients plus the existing NestJS API and a shared database | The user did not select a shared record across computers for version 1. |
| ALT-2 | Put version 1 behavior in the website or admin app | Those apps have no approved actor or flow. |
| ALT-3 | Domain rules only in React components | Rejected writes, removal, and conflicting commands would depend on the view. The same rules must hold when a save fails or a view is closed (AC-046, BR-7). |

ALT-1 is not the version 1 path after the user's choice. Adopting it later would be a new decision.

## 2. Runtime and module boundaries

Version 1 runtime path:

```text
Renderer (uncommitted edits, civil time, optional occurrence choice, display)
    |  typed commands; no acting email and no trusted zone
Preload bridge
    |  no rule evaluation
Main-process coordinator (single writer, many local sessions)
    |  each session has its own email; OS zone stays here; load generation; call domain
Domain module (pure)
    |  command result or per-actor projection
Local team-record file in the OS user application-data directory
```

| Module | Responsibility | Does not do |
|---|---|---|
| Domain | Canonical email, team generation, invites, maintainer, event validation, civil-time outcome, removal, dissolution, authorization, and the per-actor projection | File IO, IPC, React, network, reminders, choosing the session email |
| Record store | Read and atomically replace one local team record under a single-writer lock. A failed replace leaves the previous file. | Interpret product rules or choose an actor |
| Coordinator | Create local sessions in the main process. Bind each session to one email under the user rule in section 3. Bind each window to one session. Read the OS IANA zone. Ignore any acting email or zone on a later command. Run one command at a time against the generation stamped for that command. After a commit, publish a separate projection to each open session. | Change a domain result, treat a second window of the same session as a second member, or send the stored document to a window |
| Preload | Expose the command and projection channel for the window's session. Keep `contextIsolation`, `sandbox`, and `nodeIntegration: false`. | Expose the file path, the stored document, another session's email, or a general Node API |
| Renderer | Collect input, hold unsaved edits, show the projection for its bound session, format clock labels from instants in the zone the main process supplies | Authorize, name a different session, choose the trusted zone, commit, or store the team record |

Existing packages outside this path, for version 1:

| Package | Version 1 role |
|---|---|
| `@app/desktop` | Hosts the modules above |
| `@app/website`, `@app/admin`, `@app/api` | Remain in the workspace. No version 1 behavior is assigned to them. |
| `@app/shared`, `@app/api-client` | Not used for team behavior. The bearer GET client is not a version 1 interface. |

Domain code stays inside `apps/desktop` until a second runtime must execute the same rules. A new shared package is not required to test the domain with Vitest.

## 3. Component interaction

1. The renderer keeps the edit buffer for its current session email. Other sessions do not see it. Changing a session's email discards that buffer, so the next actor does not commit the previous actor's unsent edit (AC-046).
2. A save, invite, accept, decline, cancel, removal, succession, dissolution, or delete is a command. The renderer sends the entered fields and an occurrence choice when the user has made one. It does not send an acting email, a trusted zone, a generation, or an authorization result. A separate bind request may carry the email the operator asks to attach to a session. That request is not a team-record command.
3. When the coordinator accepts the command, it stamps the generation it observes then and the session that submitted it. Absent is a base with no generation. At execution it loads the stored generation, reads the OS IANA zone, and calls the domain with the email stored for that session. A payload that names a different email, session, or zone is ignored. A stored generation that differs from the stamp writes nothing. That includes a save stamped on a team that was dissolved and then replaced by a new team (AC-025, AC-050).
4. The domain returns a new record only for the stamped generation. On `createTeam` the coordinator supplies the next generation string and the domain stores it. Create from absent stores the first generation. Create after dissolution stores the next generation. The domain does not mint that string. Any other command against absent writes nothing (AC-001). A save stamped with the generation of a team that is now dissolved writes nothing. Rejection does not call the store. On `createEvent` the coordinator supplies the event id and ignores an id from the renderer. The domain places that id.
5. On success, the store replaces the file. The command completes at that replacement. The coordinator asks the domain for a projection for every open session and publishes each projection only to that session.
6. The projection is per actor. A pending invite appears only in the invited email's projection and the current maintainer's projection (BR-2, AC-033). An ordinary member or a removed email does not receive another email's pending invite. A pending invitee receives that invite and not the roster, events, or busy/free (AC-004). A removed email receives no team view (AC-015, AC-019). A current member receives team-visible events in full, including events from before they joined and events that have ended (AC-018, AC-036). Only-self events appear only for their owner (AC-017). Busy/free rows list current members only. Only-self coverage counts only on the owner's row (BR-6). The stored document is not sent to the renderer.
7. An open session applies its new projection when the write completes. A session that is not open reads its projection on its next view (AC-024). Both sessions are on this computer and share the one local record. A second window bound to the same session is the same actor and is not the other member. A command does not wait for another session to be open (BR-7). Version 1 does not carry this record to another computer.

Session binding, confirmed by the user on 2026-11-19 for TDR-REV-002:

- The operator of this computer may set a session email. Version 1 does not prove control of that inbox.
- When the record is absent or dissolved, the operator may enter the email for the next create. The coordinator stores it only when it is a usable email. The domain still accepts that create only under AC-001 and AC-050.
- When the team is active, the coordinator may bind a session only to a canonical email that is a current member, or to a canonical email that has a pending invite. The operator may open another session bound to a different email that meets the same rule.
- A requested email that is anything else, including a removed email with no pending invite, does not change the session. A new session is not created for that email.
- The bind stores the canonical email in the main process. It runs on the same queue as team commands. The membership check and the projection use the record loaded on that turn. Later commands use the stored email and ignore an acting email in the payload. Binding does not change the roster, invites, or events.

Two commands in one writer are ordered by the coordinator. The later command loads the generation left by the earlier completed command (BR-7). A command that stops before the file replacement leaves the previous file in place.

## 4. Core domain model

This is the conceptual model for the architecture. It is not the persistence schema.

| Concept | Meaning | Identity and relationships |
|---|---|---|
| Team record | The single committed record. Status is absent, active, or dissolved. Each active or dissolved team has a generation identity. | At most one active record (BR-1). A command applies only to the generation it read. Dissolution clears roster, events, and invites and ends the role (BR-5). A later create allocates a new generation (AC-050). An older command does not write into that new generation (AC-025). |
| Canonical email | Trimmed, fully lowercased address that passed the usable-email rule. | Key for members, invites, event owners, and the maintainer. |
| Membership | Absent, invited, member, or removed for one email. | A current member has exactly one roster entry. One pending invite per email. |
| Maintainer | The one current member who may invite, cancel, remove another member, and designate a successor. | One reference while the team is active. Never vacant while a member remains (BR-3). |
| Schedule event | One absolute interval owned by a canonical email, with visibility, title, location, and description. | Owner is the creating member's stored email. Half-open interval. No recurrence and no all-day form. |
| Visibility | Team-visible or only-self. | Only-self is readable by the owner. Removal deletes the owner's only-self events. A retained team-visible event keeps that visibility while the owner is removed. |
| Local session | One actor binding inside the single desktop process. | The main process creates it and stores its email under the section 3 binding rule. A window is bound to one session. Two windows on one session are one actor. AC-024's other member is a different open session, or a session that reads the record on a later view. |
| Actor | The email on whose behalf a command or projection is judged. | The coordinator passes the stored email of the submitting session. The domain compares it with the current record. A renderer payload cannot replace it. |
| Device zone | The IANA zone of this computer at save or display. | The main process reads it from the operating system. The renderer does not supply the zone the domain trusts. It is used to convert entered clock times and to label instants. It is not stored as a second start/end. |
| Busy row | A current member, plus whether an instant is inside any event that this actor may count. | Computed. Removed emails have no row. Their retained events can still be shown. |

Invariants the domain must refuse to break:

- Usable email shape and canonical storage.
- One active team; one maintainer among current members; one pending invite per email.
- Event writes require an explicit visibility, a non-empty trimmed title, and an end instant after the start.
- Only the allowed actor may invite, cancel, remove, designate, modify, or delete.
- A custody save that changes visibility writes nothing.
- An incomplete command writes nothing.
- Absent is a base with no team generation. Create from absent stores the generation string the coordinator supplies. Every other command against absent writes nothing.
- A command is stamped with the generation observed when it was accepted. At execution, a different stored generation writes nothing. That write does not recreate a deleted event, a dissolved team, or an event inside a newer team. A save against a dissolved generation writes nothing.

## 5. Persistence direction

**TD-B, selected with the user's one-computer choice: one local document is the team record.** The store writes the next document to a temporary file and replaces the current file only after that write finishes. A crash before replacement keeps the previous document.

The document holds the generation identity, the active or dissolved team, the canonical roster, the maintainer, pending invites, and events with absolute instants. Absent means no team file, or no active or dissolved generation, and it is a legal base for the first create (AC-001). Creating after dissolution writes a new generation rather than restoring the cleared team (AC-050). A command keeps the generation stamped at acceptance. Execution writes nothing when the stored generation differs, including after that later create (AC-025). The generation check is the invariant. The dissolved document does not need to remain only "long enough."

The file lives in the operating-system user application-data directory for this app. Reading that file outside the app is outside the actor model. Version 1 does not add file encryption unless a later product decision requires it.

TD-B includes a single writer. The application takes a single-instance lock, or the store takes a file lock around read-modify-replace. A second process does not write. It stops without changing the file and surfaces that the record already has a writer. The current shell has no such lock; adding it is part of this direction.

### Consistency

| PRD rule | Architectural consequence |
|---|---|
| Complete or unchanged (BR-7) | Domain result is committed only by replacing the whole document. Field updates are not written one by one. |
| First completed write wins (BR-7) | Completion is the locked file replacement. One writer runs one command at a time, so completion order is that writer's order. A second process does not replace the file. |
| Viewers see the committed result (AC-024, AC-046) | After replacement, each open session on this computer receives its own projection. A session that is not open reads the record on its next view. Edit buffers stay in the submitting session. |
| Others need not be online (BR-7) | The writer does not wait for another session. There is no second computer in version 1. |

### Persistence alternatives

| Alternative | Trade-off |
|---|---|
| SQLite in one local file | Useful if later queries or partial indexes are needed. Heavier than a whole-document replace for one small team record. Not recommended for this baseline. |
| Server database behind `@app/api` | Same product cost as ALT-1. Not recommended while TD-A stands. |

No database product, hosting provider, or cloud store is selected.

## 6. Technology choices

| Topic | Recommendation | Alternatives still open | Status |
|---|---|---|---|
| Language and repo | Keep TypeScript strict mode, pnpm workspaces, and the existing desktop package. | None for the language. | Follows the repository. Not a new product decision. |
| UI shell | Keep Electron, the current preload isolation, and the React renderer. | A different desktop shell would discard the existing boundary without a PRD reason. | Recommended |
| Domain location | TypeScript modules inside `@app/desktop`, imported by the main process and by Vitest. | A new `packages/*` package if a second app must run the rules. | Recommended |
| Record storage | One local document on one computer, atomic replace. | SQLite on the same computer. A remote database is outside the user's version 1 choice. | Selected with the user's one-computer choice |
| Actor binding | The main process stores one email per local session under the section 3 rule. The domain receives the submitting session's email. A command payload cannot name a different principal. Several sessions can be open in the one process. Version 1 does not prove control of the inbox. | A login or mail-proof flow would add product behavior outside the current contract. | Selected by the user on 2026-11-19. |
| Time zones | The main process reads the OS IANA zone. The domain conversion port takes that zone, the entered civil time, and an optional occurrence, and returns an instant or a gap, ambiguous, or invalid failure. | Node ICU, Luxon, or a Temporal polyfill. | Zone source is fixed. Library is unresolved (Q-TZ). |
| Ambiguous time | The port accepts a choice only when the user has selected an occurrence. No choice is a failed save (AC-028). | The control's layout. | Rule is fixed. Control is Stage 3 (Q-AMB). |
| Reminders, recurrence, all-day | No module is given these jobs. | None in version 1. | Constraint |

## 7. PRD traceability

Module names refer to section 2. Verification remains the approved acceptance criteria. This mapping does not add behavior.

| Approved source | Modules | Persistence / interface effect |
|---|---|---|
| BR-1, AC-001, AC-002, AC-003, AC-050 | Domain, store, coordinator | One document. Create and invite reject unusable emails before a write. A second active team is a rejected command. |
| BR-2, AC-004 through AC-008, AC-030, AC-032 through AC-036 | Domain, coordinator | A pending invite is projected only to the invited email and the current maintainer. The invitee projection excludes the roster, events, and busy/free. Accept, decline, and cancel are whole-document commands on the stamped generation. |
| BR-3, AC-009, AC-010, AC-011, AC-038, AC-039 | Domain | Maintainer reference and member count are checked on the loaded document. |
| BR-4, AC-012 through AC-015, AC-018, AC-028, AC-037, AC-043, AC-044, AC-046, AC-051 | Domain, coordinator, renderer | Validation and time conversion happen before replace. The renderer keeps canceled and failed edits off the document. Recurrence and all-day commands have no successful domain result. |
| BR-5, AC-019 through AC-023, AC-029, AC-041, AC-047 through AC-049 | Domain, store | Removal, custody edit, rejoin, and dissolution are single replacements. Only-self deletion is part of the removal replacement. |
| BR-6, AC-016, AC-017, AC-040, AC-042, AC-045 | Domain, coordinator | Busy/free and visibility are part of the per-actor projection. Clock labels use the OS zone observed by the main process. |
| BR-7, AC-024, AC-025, AC-026, AC-027, AC-031, AC-035 | Coordinator, store | One local record, multiple sessions on that computer, single writer, generation stamp at acceptance, mismatch writes nothing, completion on replace, per-session publication, no reminder side effect. |

## 8. Assumptions, open questions, and risks

### Assumptions

| ID | Assumption | If it is wrong |
|---|---|---|
| A-LOCAL | One computer runs the single writer. Separate computers do not synchronize in version 1. Another member in AC-024 is another local session, or a later view of this record. | Confirmed by the user on 2026-11-19. A later request for several computers is a new decision. |
| A-ACT | The operator may bind a session as in section 3. Inbox control is not verified. | Confirmed by the user on 2026-11-19. A required proof flow would be new product scope. |
| A-ONE-PROCESS | One writer owns the file, enforced by a single-instance lock or a file lock. A second process does not write. | The lock mechanism is Stage 3. The requirement to have one is part of TD-B. |

### Open items carried forward

| ID | Status in this baseline |
|---|---|
| Q-REC | Closed by the user's one-computer choice on 2026-11-19. TDR-REV-001 is addressed for this baseline. |
| Q-ACT | Closed by the user's session-binding choice on 2026-11-19. TDR-REV-002 is addressed for this baseline. |
| Q-RUN | Recommendation: website, admin, and API are outside the version 1 path. Not an instruction to delete them. |
| Q-TZ | Open. Conversion port is specified; library is not. |
| Q-AMB | Open only for the control. The failure rule is fixed by AC-028. |

### Risks

| ID | Risk | Mitigation in this baseline |
|---|---|---|
| R-1 | A team that expects several computers will not see one shared record in version 1. | Accepted by the user's choice on 2026-11-19. Version 1 does not add a server for that case. |
| R-2 | Anyone at this computer can act as a current member or a pending invitee, and can enter a usable email when the record is absent or dissolved. | Accepted by the user's choice on 2026-11-19. The domain still rejects commands that the stored email is not allowed to perform. |
| R-3 | Initial architecture notes still say the API is the trust boundary and that requirements are missing. | Version 1 trust boundary in this draft is the main process plus the domain, not `@app/api`. Implementation must follow this document and the PRD, not those stale sentences. |
| R-4 | A crash during replacement can leave a partial file if the replace is not atomic. | Direction is temporary file, replace, and a writer lock. The concrete OS calls are Stage 3. A second process does not write. |
| R-5 | Time-zone conversion can disagree with the named `America/New_York` cases if the library or ICU data is wrong. | AC-014 and AC-028 are mandatory checks when the library is chosen. |
| R-6 | CI still installs without a lockfile. | Unchanged repository constraint. This design does not add dependencies yet. |

## 9. What this baseline does not decide

- Field names, indexes, and the on-disk JSON shape.
- IPC payload types and error codes.
- The screen layout, including the ambiguous-time control.
- The time-zone library.
- Logging and crash recovery beyond "failed replacement keeps the previous document."
- Implementation tasks. The Implementation Planner stays inactive until the user approves the completed technical design.

## 10. Gate readiness

The first independent Architecture Baseline review is `docs/technical/reviews/architecture-review.md`. The user closed TDR-REV-001 and TDR-REV-002 on 2026-11-19. Those choices select record placement and session binding. They do not approve the whole technical design.

Revisions after that review, still inside this proposed baseline:

- A published view is a per-actor projection. The stored document is not sent to the renderer.
- A command is stamped with the generation observed at acceptance, including the absent base for the first create. A mismatch at execution writes nothing.
- TD-B includes a single-writer lock and an application-data directory location.
- A pending invite is projected only to the invited email and the current maintainer.
- The main process reads the OS zone and stores each session email. The renderer cannot supply either trusted value.
- After the user's choice, one process hosts multiple sessions over one local record. A second window of the same session is the same actor.

The user's choices confirm A-LOCAL, A-ACT, TD-A, and TD-B for record placement and session binding. They do not approve the whole draft.
