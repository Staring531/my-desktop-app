# Data Design

- Stage: 3 — Detailed Technical Design
- Date: 2026-11-19
- Status: APPROVED by the user on 2026-11-19. This approval does not authorize application code.
- Authority: `docs/technical/02-architecture.md` TD-B and `docs/technical/03-domain-model.md`

## 1. Store

Version 1 stores one JSON document at:

`app.getPath('userData') / team-record.json`

The Electron user-data directory is the location from the architecture baseline. The renderer never receives this path. There is no second team file, no server database, and no sync copy.

Absent means the file does not exist. The coordinator treats that as `{ status: 'absent' }`. A dissolved team is a file, not a missing file, so a late command can see the dissolved generation (AC-025, AC-050).

## 2. Document

`formatVersion` is the number `1`.

```json
{
  "formatVersion": 1,
  "status": "active",
  "generation": "string",
  "maintainerEmail": "sam@team.com",
  "roster": [{ "email": "sam@team.com" }],
  "invites": [{ "email": "ada@team.com" }],
  "events": [
    {
      "id": "string",
      "ownerEmail": "sam@team.com",
      "visibility": "team-visible",
      "title": "HQ",
      "location": "",
      "description": "line one\nline two",
      "start": "2026-11-19T14:00:00.000Z",
      "end": "2026-11-19T15:00:00.000Z"
    }
  ]
}
```

A dissolved document is:

```json
{
  "formatVersion": 1,
  "status": "dissolved",
  "generation": "string"
}
```

| Field | Rule |
|---|---|
| `formatVersion` | Must be `1`. Any other value is unreadable. The store does not rewrite it. |
| `status` | `active` or `dissolved`. |
| `generation` | Non-empty string supplied by the coordinator on create and stored by the domain. Opaque to the product. |
| `maintainerEmail` | Present only when active. Canonical email that also appears in `roster`. |
| `roster`, `invites`, `events` | Present only when active. Arrays, possibly empty except `roster`, which has at least one entry while active. |
| `visibility` | `team-visible` or `only-self`. |
| `start`, `end` | UTC instants in the form `YYYY-MM-DDTHH:mm:ss.sssZ`. `end` is later than `start`. |
| Text fields | JSON strings. No HTML normalization. A stored newline is the character U+000A. |

The coordinator supplies a new id on `createEvent` only and ignores an id on the renderer payload. The domain rejects a duplicate or empty id and is the only component that puts the id into the record. The id's UUID version is not a product rule. The same coordinator supplies the generation string on `createTeam` only.

## 3. Constraints and indexes

There is no database index. Before a replacement, the domain enforces the invariants in `03-domain-model.md`. The store additionally refuses to replace the file when JSON serialization throws. It does not repair a record that fails those invariants.

Lookups by email and event id are scans of one small document. A secondary index would not express an approved requirement.

## 4. Replacement

1. Refuse the replace when the current file exists and is not a readable version 1 document.
2. Serialize the next document to `team-record.json.tmp` in the same directory.
3. Sync the temporary file to disk before the replace.
4. Replace `team-record.json` without deleting the destination first. Where a same-directory rename is atomic, that rename is the replace. On a platform where rename of an existing file is not atomic, use that platform's replace that keeps the destination until the new file is in place.
5. Leave a failed step's existing `team-record.json` bytes in place.
6. On the next successful load, ignore a leftover `team-record.json.tmp`. Do not promote it.

A crash before the rename keeps the previous document. A command that the domain rejects never starts this sequence.

## 5. Load failures

| Condition | Behavior |
|---|---|
| File missing | Absent. Create is allowed. |
| Valid version 1 document | That record. |
| Missing file during a command that was stamped with a generation | `generation-mismatch`. No new file is created. |
| `formatVersion` is not 1, JSON is invalid, or an invariant fails | `record-unreadable`. The coordinator stops before a generation stamp and before the domain. It does not treat the file as absent. The store rejects a replace while that file exists and is unreadable. The file is not deleted. |

## 6. Migration

Version 1 has no previous document to migrate. A later format is outside this design. Until a later approved design exists, an unknown `formatVersion` remains unreadable rather than being guessed.

## 7. What is not stored

- Session ids and session emails. They live in the main-process memory.
- Unsent edit buffers.
- Device zone, clock labels, and busy rows.
- Reminder schedules, recurrence rules, and all-day dates.
- A history of dissolved events. Dissolution removes them from the document.
