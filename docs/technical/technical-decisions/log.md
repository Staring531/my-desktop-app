# Technical Decision Log

- Date: 2026-11-19
- Status: APPROVED. The user approved the complete technical design on 2026-11-19, including TD-001 through TD-004. TD-001 and TD-002 were confirmed earlier the same day. TD-003 and TD-004 were recommendations included in that approval. This approval does not authorize application code.

## TD-001 — One computer, one local record

- **Status:** Confirmed by the user on 2026-11-19 (TDR-REV-001, option A)
- **Decision:** Version 1 keeps one team record in the desktop app on one computer. It does not synchronize that record to another computer.
- **AC-024:** The other member is another session on that computer, or a later view of the same record. A second window of the same session is the same actor.
- **Alternative rejected for version 1:** Desktop clients plus the NestJS API and a shared database.
- **Consequence:** Members on separate computers do not share a live record in this version.

## TD-002 — Session binding without inbox proof

- **Status:** Confirmed by the user on 2026-11-19 (TDR-REV-002, option A)
- **Decision:** The operator may bind a session without proving control of the inbox. Absent or dissolved: a usable email may be stored for the next create. Active: only a current member or a pending-invite email may be bound. Another session may use a different allowed email.
- **Alternative not selected:** A login or mail-proof flow. That would add product behavior outside the approved contract.
- **Consequence:** Anyone at this computer can act as an allowed email. The domain still enforces what that email may do. A rejected bind does not write the record.

## TD-003 — JSON document replaced atomically

- **Status:** Recommended in this draft. Not a separate user approval.
- **Decision:** One version-1 JSON document in the Electron user-data directory. The next document is written to a temporary file and renamed over the current file.
- **Alternative:** A local SQLite file. Not selected. One small document does not need a query engine to meet the approved rules.
- **Consequence:** Constraints are domain checks before replace. There is no SQL index and no migration from an older format.

## TD-004 — Time conversion port

- **Status:** Recommended in this draft. Not a separate user approval.
- **Decision:** The domain calls a port that returns an instant, `nonexistent`, `ambiguous`, or `invalid`. The recommended adapter is Temporal `ZonedDateTime` through `@js-temporal/polyfill`, using disambiguation `reject`, `earlier`, or `later`. The OS IANA zone comes from `Intl` in the main process.
- **Alternative:** Luxon, if it implements the same three failure results. Node's `Intl` alone is not the converter, because it does not by itself reject a missing or doubled civil time.
- **Consequence:** AC-014 and AC-028 are adapter tests. This design does not install the package.
