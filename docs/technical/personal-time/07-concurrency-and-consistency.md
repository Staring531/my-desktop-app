# Concurrency and Consistency: Personal Time Management

- Stage: 3 — Detailed Technical Design
- Date: 2026-11-24
- Status: APPROVED by the user on 2026-11-24. This approval does not authorize application code.
- Store: one PostgreSQL transaction per user operation (TD-PT-2)

## 1. Commit rule

Each operation in `05-application-design.md` runs in one transaction. If it commits, every row change from that operation is visible. If it rolls back, the earlier committed rows remain. The application does not write a partial Event, a verified account without a Calendar, or a retired username without deleting the account.

## 2. Last committed save

Two sessions saving the same Event both lock the Event row, in `id` order if more than one row is involved. The transaction that commits last replaces the stored content with the complete content it submitted. A rolled-back save leaves the stored Event unchanged.

A save locks the account row as well. Account deletion locks that account row, retires the username, and deletes the account. If deletion commits first, the save sees no account and writes nothing. If the save commits first, deletion then removes that saved Event with the account.

## 3. Recovery and an unfinished save

An Event write includes the session id and rechecks `ended_at` immediately before commit. Recovery locks the account, ends every session, and commits. A save whose session is ended at that recheck rolls back and writes nothing. A save that committed before recovery remains.

## 4. Verification and cancellation

Both operations lock the account row by id after finding it, or lock by email in a single statement. The operation that commits first wins.

- Verification commits first: cancellation sees `verified_at` and rolls back with the non-revealing failure.
- Cancellation commits first: verification finds no proof row and does not create an account.

## 5. Series save and a later occurrence change

A series save and an occurrence deletion or detachment lock the series row. The transaction that commits later determines the occurrence.

- The series save commits first and the detachment later: the detached Event has the content submitted with the detachment.
- The deletion commits later: the absence remains.
- The series save commits later: it does not delete an absence row and does not delete a detached Event.

## 6. Expansion and time

Reads and the conflict comparison use one snapshot of the account timezone, the template, freezes, absences, skips, and choices. A started occurrence with no freeze row is included from the template. After a freeze exists, the read uses the freeze and does not also emit the new clock time on that slot. An absence suppresses the stored civil date. A skip row suppresses that civil date even when the new clock time exists. A timezone change commits the new timezone and the new freeze rows together, so a reader does not see the new zone without the freezes.

The 90-date window is calculated in that timezone from the save's civil date. Started, detached, non-repeating, and chosen instants are the stored absolute times. Unstarted attached occurrences use the template clock in the current timezone, then drop absences, skips, and unchosen dates.

## 7. Isolation and extra locks

The recommended isolation for these transactions is read committed plus the row locks above. The locks, not a retry loop, decide which operation finishes last. A unique-index violation on username or email becomes the shared registration failure, not a separate error.

Registration and account deletion take the same transaction lock on the username, and registration rechecks `retired_usernames` under that lock before inserting. A recovery start locks the account and sets `superseded_at` on every other unused recovery proof in that transaction. A timezone change locks the account and each of its series rows, then computes freezes from those locked templates immediately before commit. A proof is accepted only when its `purpose` matches the route. Verification sets `used_at` in the same transaction that sets `verified_at`.
