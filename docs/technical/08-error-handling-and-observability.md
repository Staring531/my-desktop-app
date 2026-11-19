# Error Handling and Observability

- Stage: 3 — Detailed Technical Design
- Date: 2026-11-19
- Status: APPROVED by the user on 2026-11-19. This approval does not authorize application code.
- Authority: PRD failure rules and `docs/technical/05-application-design.md`

## 1. Result shape

Every bind and command returns either the session's projection or a rejection:

```text
{ ok: true, projection }
{ ok: false, code, field?: 'start' | 'end' }
```

`ambiguous-local-time` returns one `field` and the `earlier` and `later` instants for that field. If both start and end are ambiguous, `field` is `start`. Those instants are not written. The unsent edit remains, and the next submit supplies an occurrence for the reported field.

A rejection does not change the document. The session's unsent edit remains until the operator discards it or rebinds the session.

## 2. Codes

| Code | When | Record |
|---|---|---|
| `unusable-email` | Create or invite input fails canonicalization. Bind of an unusable email while absent or dissolved. | Unchanged |
| `team-already-active` | `createTeam` whose stamp is the active generation and the loaded record is still that active team. | Unchanged |
| `not-allowed` | Actor lacks the right for this command, including a non-owner edit and a custody visibility change. | Unchanged |
| `invite-exists` | A second pending invite for the same email. | Original invite remains |
| `already-member` | Invite target is a current member. | Unchanged |
| `no-matching-invite` | Accept, decline, or cancel finds no pending invite. | Unchanged |
| `empty-title` | Title is empty after trim. | Unchanged |
| `end-not-after-start` | Resulting end is not after the resulting start. | Unchanged |
| `nonexistent-local-time` | The civil time does not occur in the OS zone. | Unchanged |
| `ambiguous-local-time` | The civil time occurs twice and no occurrence was sent. | Unchanged |
| `invalid-local-time` | The civil fields are not a real calendar time. | Unchanged |
| `recurrence-not-supported` | Payload is marked recurring. | Unchanged |
| `all-day-not-supported` | Payload is marked all-day. | Unchanged |
| `event-not-found` | Modify or delete names an id that is not in the record at execution. | Unchanged |
| `generation-mismatch` | Stamp does not match the loaded record. This includes a create stamped absent after another create has written a generation. | Unchanged |
| `dissolved` | Command other than `createTeam` runs against the dissolved generation. | Unchanged |
| `bind-rejected` | Active-team bind is not a current member or a pending invite. | Unchanged, session unchanged |
| `unbound-session` | Command before a successful bind. | Unchanged |
| `record-unreadable` | The file exists but is not a valid version 1 document. | File left as it is |
| `replace-failed` | The domain accepted a record and the rename failed. | Previous file remains |

No code sends a reminder, creates a second team, or restores a deleted event.

## 3. Operator-visible behavior

The session that issued the command shows the rejection. Other sessions do not see the unsent fields. After a successful command, other open sessions see only their new projections.

Canceling an edit or dismissing an ambiguous choice does not call a write (AC-046).

## 4. Recovery

- A leftover `team-record.json.tmp` is ignored on load.
- `record-unreadable` does not delete the file and does not create a replacement team.
- `replace-failed` retries only when the operator submits the command again. The design does not silently retry.
- Quitting the process ends the in-memory sessions. The document remains. The next launch starts unbound until the operator binds again.

## 5. Observability

Version 1 does not send logs, metrics, or errors to a remote service. There is no reminder job and no background scheduler.

A local diagnostic line may record the time, command name, result code, and generation. It does not record event title, location, description, or civil-time fields. Session email is already stored in the record file; the diagnostic line does not need to copy event content.

The user-facing surface for a failed command is the result code, not the diagnostic line.
