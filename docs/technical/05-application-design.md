# Application Design

- Stage: 3 — Detailed Technical Design
- Date: 2026-11-19
- Status: APPROVED by the user on 2026-11-19. This approval does not authorize application code.
- Authority: `docs/technical/02-architecture.md`, `03-domain-model.md`, `04-data-design.md`

Version 1 behavior lives in `@app/desktop`. Website, admin, and API packages stay in the workspace and gain no team commands.

## 1. Modules

| Module | Path inside `@app/desktop` | Depends on |
|---|---|---|
| Domain | `src/domain` | No Electron, React, or file APIs |
| Time port | `src/domain/time` | A zone adapter injected by the main process |
| Store | `src/main/store` | Node file APIs and the user-data path |
| Sessions and coordinator | `src/main/coordinator` | Domain, store, time adapter, Electron single-instance lock |
| Preload | `src/preload` | `contextBridge` only |
| Renderer | `src/renderer` | The preload API |

Vitest imports `src/domain` directly. The renderer may import `busyAt` and no other domain export. It does not keep a second copy of the half-open rule.

## 2. Preload API

The preload keeps `contextIsolation`, `sandbox`, and `nodeIntegration: false`. It exposes `desktop.platform` and these team operations. It does not expose the file path, the document, or a general IPC send.

| Operation | Direction | Payload the renderer may send |
|---|---|---|
| `bind` | request | `{ requestedEmail: string }` for this window's session |
| `openSession` | request | No email. The main process opens a new window and a new unbound session. |
| `command` | request | Command name and the product fields below. No actor email, zone, or generation. |
| `projection` | main to renderer | The projection for this window's session, pushed after bind and after every completed command. |

The main process assigns the session id when it creates the window. The renderer does not choose it.

## 3. Commands

| Name | Fields |
|---|---|
| `createTeam` | None. Uses the bound email. |
| `invite` | `{ email }` |
| `cancelInvite` | `{ email }` |
| `acceptInvite` | None. |
| `declineInvite` | None. |
| `designate` | `{ email }` |
| `removeMember` | `{ email }` |
| `dissolve` | None. |
| `createEvent` | `{ visibility, title, location, description, start, end, startOccurrence?, endOccurrence?, recurring?, allDay? }`. The coordinator mints `eventId` and ignores an id on this payload. |
| `modifyEvent` | `{ eventId, visibility?, title?, location?, description?, start?, end?, startOccurrence?, endOccurrence?, recurring?, allDay? }`. `eventId` is the `id` from this session's projection. |
| `deleteEvent` | `{ eventId }` from this session's projection. |

`start` and `end` are civil times: `{ year, month, day, hour, minute }`. `startOccurrence` and `endOccurrence` are `earlier` or `later`. `recurring: true` or `allDay: true` is rejected and writes nothing (AC-051). The successful UI does not offer those modes.

`location` and `description` may be omitted on create and are then stored as empty. On modify, an omitted text field keeps the stored value. The renderer includes `start` or `end` only when the operator edited that clock field, or when the previous result asked for an occurrence on that field. Omitting a clock field keeps the stored instant and does not convert the displayed label (AC-029).

## 4. Bind and sessions

`bind` does not write the team document. It still runs on the same queue as team commands, after the queue is idle.

- At that turn the coordinator loads the record once. It canonicalizes `requestedEmail` when it is usable, applies the rule below to that record, stores the session email, and projects from that same load. It does not project from an earlier read.
- Absent or dissolved: a usable email is stored on the session. An unusable email leaves the session unbound.
- Active: the email must already be a current member or a pending invite. Otherwise the session email does not change, and a new session is not bound to it.
- A successful rebind discards that session's unsent edit buffer.
- `openSession` creates an unbound session. The operator then binds an allowed email.

An open session whose email is later removed stays bound to that email. Its next projection is `no-access` until that email has a pending invite, in which case the projection is `invite`. The coordinator does not retarget it.

## 5. Coordinator sequence

1. Reject a team command from an unknown session or an unbound session. Queue `bind` from a known session even when that session is unbound. Ignore any actor email, zone, or generation in the payload.
2. Load the file. If it exists and is not a valid version 1 document, return `record-unreadable` and do not stamp, call the domain, or replace.
3. At acceptance, stamp the generation, or stamp absent when the file is missing. Also stamp the session id and the email stored at that moment.
4. Enqueue the command or bind. The queue runs one item at a time. A thrown load, domain, or push error is caught, returned as a result, and the queue continues.
5. At execution, load again. Apply the create decision table in `07-concurrency-and-consistency.md` before any create. If the stamp does not match, return `generation-mismatch` and do not write. If the record is dissolved and the command is not `createTeam`, return `dissolved` and do not write.
6. Read the OS IANA zone. Ignore any zone in the payload.
7. Call the domain with the stamped email, zone, and record. On `createTeam`, also pass the generation string the coordinator just minted. On `createEvent`, pass the event id the coordinator just minted. Ignore an id on the renderer payload.
8. On rejection, do not touch the file.
9. On a new record, replace the file. The command completes at that replacement. A failed replace returns `replace-failed` and leaves the previous bytes.
10. Project for every session that is still open and push each projection only to that session. A failed push does not roll back a finished rename. Closing a window drops that session before the next push.

A command that stops before step 9 leaves the previous file in place (BR-7, AC-035).

## 6. Time port

```text
convert(zone, civilTime, occurrence?) =>
  | { ok: true, instant }
  | { ok: false, reason: 'nonexistent' }
  | { ok: false, reason: 'ambiguous' }
  | { ok: false, reason: 'invalid' }
```

- No `occurrence`: a civil time that occurs twice returns `ambiguous` and does not pick one (AC-028). A civil time that does not occur returns `nonexistent` (AC-014).
- `earlier` or `later`: an ambiguous civil time returns that occurrence. A nonexistent civil time still fails.
- `invalid` covers a calendar date or clock field that is not a real civil time, such as month 13.

The adapter recommended for this port is Temporal's `ZonedDateTime` through `@js-temporal/polyfill`, with disambiguation `reject`, `earlier`, or `later`. Luxon is the alternative if it implements the same three results. The domain tests depend on the port's results, not on a particular package. This stage does not install the package.

The main process reads which IANA zone the operating system reports now. It formats each stored instant with that zone's offset at that instant, not with one current offset applied to every instant (AC-016, AC-042).

## 7. Ambiguous-time control

When the port reports `ambiguous`, the coordinator resolves `earlier` and `later` for that field and returns those two instants. Nothing is written. If both start and end are ambiguous, the result names `start` first. The unsent edit stays. The next submit includes an occurrence for the reported field and includes that field's civil time. It omits the other clock field unless the operator also edited it. A later submit reports `end` if that field is still ambiguous. A nonexistent field returns `nonexistent-local-time` and no instants. Closing or canceling the choice does not write. No default occurrence is applied.

The rest of the screen layout is not specified. The renderer must be able to enter an email, open another session, enter one event's fields, and choose an occurrence.

## 8. Projection delivery

The pushed value is the domain projection plus the zone name. It includes `record` and, for each visible event, `id` and the instants. It omits every event, invite, and roster entry the actor must not see. It does not include busy rows frozen at push time. `record: absent` or `record: dissolved` is the state in which a bound session may send `createTeam`. `record: active` with `no-access` is not that state.

The board calls domain `busyAt` for the instant being viewed. "Now" is recomputed on each display from the OS clock. A chosen instant, such as an event start or end, uses that instant. The viewer's own row counts that viewer's team-visible and only-self events; every other row counts only that member's team-visible events; coverage is half-open. There is no reminder scheduler and no timer that writes the record.

## 9. Windows

The coordinator creates and registers every window, including the window opened when the app is activated and no window is open. An unregistered window is not shown. Closing the last window does not by itself create a window outside the coordinator. A window the coordinator did not register cannot bind or receive a projection.

## 10. Packages that do not change

`@app/website`, `@app/admin`, `@app/api`, `@app/shared`, and `@app/api-client` are not on this command path. No new HTTP route is part of version 1.
