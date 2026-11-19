# Concurrency and Consistency

- Stage: 3 — Detailed Technical Design
- Date: 2026-11-19
- Status: APPROVED by the user on 2026-11-19. This approval does not authorize application code.
- Authority: PRD BR-7 and `docs/technical/02-architecture.md`

## 1. One writer

One Electron process owns the record. It takes the single-instance lock before the first read and handles `second-instance` by focusing its window and showing that a writer already exists. A process that does not get the lock exits without reading or writing, and it does not focus a window.

Inside the owner process, one queue runs team commands and `bind`. Acceptance appends to the queue. Execution removes one item. For a team command it loads the file, applies the domain, and replaces the file only for a new record. For `bind` it loads the file once, applies the binding rule to that record, updates the session email, and projects from that same load. It does not write the file. A thrown error is caught and becomes a result. The next item starts after that attempt finishes, including after a failed push. Closing a window drops that session before the next push. A failed push does not undo a finished rename.

Sessions share that queue. A command does not wait for another session to be open or for an operator to look at the window (BR-7).

## 2. Completion

A command is complete when the file replace finishes. Until that replace, viewers still see the previous document. After it, the coordinator pushes a new projection to each open session.

A command is not complete when the domain rejects it, the stamp does not match, the process stops, or the rename fails. Those outcomes leave the previous document in place. There is no partial roster, invite, or event write.

## 3. Generation stamp

The stamp is taken when the command is accepted, from the record loaded at that moment.

`createTeam` is decided only from the loaded record and the stamp, before a new record is built:

| Stamp | Loaded record | Result |
|---|---|---|
| Absent | Still absent | May create the first generation. |
| Absent | Any generation exists | `generation-mismatch`. Does not write (AC-002). |
| Active generation G | Still G and active | `team-already-active`. Does not write. |
| Dissolved generation G | Still G and dissolved | May create the next generation (AC-050). |
| Generation G | A different generation | `generation-mismatch`. Does not write (AC-025). |

Other commands:

| Stamp | Loaded record | Result |
|---|---|---|
| Absent | Still absent | No write. |
| Generation G | Still G and active | The domain applies the command. A normal save keeps G. |
| Generation G | Still G and dissolved | `dissolved`. No write. |
| Generation G | A different generation | `generation-mismatch`. A save stamped on the old team does not create an event in the new team. |

Two commands accepted against the same active generation both keep that stamp. The first to complete changes the record and still leaves the generation in place. The second then runs on the updated record. If the first command removed the actor or deleted the event, the domain rejects the second. That is first-completed-write-wins (AC-026, AC-031).

Dissolution keeps the generation and changes the status. It does not by itself allocate the next generation. The following successful create does.

## 4. Ordering examples

| Order of completion | Later command |
|---|---|
| Only-self save completes, then removal | Removal deletes that event (AC-026). |
| Removal completes, then the removed member's visibility save | The save writes nothing (AC-031). |
| Dissolution completes, then an in-flight save | The save writes nothing and does not recreate the team (AC-025). |
| Delete completes while another session is open | That session's next push omits the event (AC-024). A session opened afterward reads the file and also omits it. |

## 5. File races

The queue prevents two in-process replacements from overlapping. The single-instance lock prevents a second process from replacing the same file. Publication syncs the temporary file and then replaces the destination without deleting it first. A leftover temporary file is not loaded as the record. A failed replace leaves the original bytes.

Version 1 does not add a cross-process file lock on top of the single-instance lock. A process started with the lock disabled would be outside this design.
