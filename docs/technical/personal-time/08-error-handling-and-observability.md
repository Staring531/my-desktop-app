# Error Handling and Observability: Personal Time Management

- Stage: 3 — Detailed Technical Design
- Date: 2026-11-24
- Status: APPROVED by the user on 2026-11-24. This approval does not authorize application code.

## 1. Result bodies

The API returns JSON. The same failure group always uses the same HTTP status and the same `result` string.

| Result | HTTP | When |
|---|---|---|
| `ok` | 200 | The operation committed. A save may include `conflicts` and, for a series, `continuesAfterWindow: true`. |
| `registration_rejected` | 400 | The shared registration failure. Nothing was written. |
| `verification_rejected` | 400 | The shared verification failure. Nothing was verified. |
| `cancellation_rejected` | 400 | The shared cancellation failure. Nothing was removed. |
| `login_rejected` | 400 | The shared login failure. No session was created. |
| `recovery_rejected` | 400 | The shared completion failure. Nothing was written. An ordinary recovery start uses `login_rejected`, the same result as a failed login. |
| `send_failed` | 503 | DEC-081 and DEC-082. Nothing was written. While mail cannot be sent, every registration and every recovery start gets this result. |
| `operation_failed` | 500 | An unexpected failure, including a commit that fails after the mail port accepted the message. No provider text and no stack trace. |
| `logged_out` | 401 | No usable session. No Calendar and no Event in the body. |
| `save_rejected` | 400 | Invalid Event fields, missing local time, unchosen doubled time, repetition change, a monthly date that does not exist in every month, or a timezone name the server cannot resolve. Nothing was written. A monthly rejection includes the preview. |
| `not_found` | 404 | The session's own Event does not exist, or the Event belongs to someone else. |
| `account_gone` | 409 | A save reached commit after the account deletion committed. Nothing was written. |

`conflicts` entries contain `title`, `start`, and `end` only.

The monthly preview contains `monthTypes` and `missingDates`. `missingDates` lists only civil dates inside the 90-date window that do not exist. For a save on 2026-01-01 of a 31st, `monthTypes` names months with fewer than 31 days, and `missingDates` includes February 2026 because that month has no 31st. It does not list every later year.

## 2. What a failure must not contain

No failure body contains an email address, a statement that a username or email is taken, a statement that an account is verified, a password, a proof code, or a stack trace.

## 3. Logs

Each committed or rejected operation writes one log line with the operation name, the `result` string, and the account id when the account is already known to that session. The line omits email, password, proof code, password hash, and proof hash.

Mail provider errors are logged as "send failed" without the recipient address.

## 4. Targets that are not set

DEC-079 sets no response time, availability proportion, or accessibility standard. This design adds no dashboard requirement and no retry quota. A failed send is not queued for a later silent retry, because DEC-081 says that attempt is not stored.
