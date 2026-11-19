# Security and Access Control

- Stage: 3 — Detailed Technical Design
- Date: 2026-11-19
- Status: APPROVED by the user on 2026-11-19. This approval does not authorize application code.
- Authority: approved PRD actors and `docs/technical/02-architecture.md` session rule

## 1. Trust boundary

The main process holds the record, the session table, and the OS zone. The renderer is untrusted input. A command payload cannot set the actor, the zone, or the generation. `bind` may carry an email the operator requests, and the coordinator accepts it only under the binding rule.

Version 1 does not prove control of an inbox. Anyone who can operate this computer can bind an allowed email. That consequence was accepted by the user on 2026-11-19. It is not an authentication system.

The record file sits in the OS user application-data directory. Another process that can read that directory can read only-self events. That access is outside the actor model. Version 1 does not encrypt the file.

## 2. Session binding

| Record | Requested email | Result |
|---|---|---|
| Absent or dissolved | Usable email | Session stores the canonical email. |
| Absent or dissolved | Unusable email | Session stays unbound. No file write. |
| Active | Canonical email of a current member, or of a pending invite | Session stores that email. |
| Active | Any other input, including a removed email with no pending invite | Session unchanged. No new bound session. |

Binding does not write the team document.

## 3. Command authorization

The actor is the email stored for the session at acceptance. The domain checks it again against the record loaded at execution.

| Action | Allowed actor | Everyone else |
|---|---|---|
| Create team | Bound email while absent or dissolved | No write |
| Invite, cancel invite, remove another member, designate another member | Current maintainer | No write |
| Accept or decline | The invited email | No write |
| Dissolve | The sole current member | No write |
| Create event | Current member | No write. The event owner is that member. |
| Modify or delete own event | That current member | No write |
| Modify text or time, or delete, a retained team-visible event | Current maintainer, and only while the owner is not a current member | No write |
| Change visibility of that retained event | Nobody. The maintainer's attempt writes nothing | No write |
| See only-self event | Its owner | Omitted from the projection |
| See a pending address | That invited email, and the current maintainer | Omitted from the projection |
| See roster, team-visible events, and busy rows | Current member | Omitted. An invitee sees only the invite. A removed email with no invite sees nothing. |

A removed member's open session is not given maintainer or member rights. Removal and projection updates happen in the same completed command, so the next push to that session is `no-access` or, if a new invite already exists, `invite`.

## 4. What the renderer must not be able to do

- Read or replace `team-record.json`.
- Subscribe to another session's projection.
- Send a maintainer email on a save and have that email honored.
- Receive the stored document and filter it locally. Filtering happens before the push.

The preload does not add a generic `ipcRenderer` bridge.

## 5. Second process

The first process takes Electron's single-instance lock before it opens the record, and it handles `second-instance`. On that event the first process focuses its window and shows that a writer already exists. A process that does not acquire the lock exits without reading or writing, and it does not focus a window.
