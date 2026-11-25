# Security and Access Control: Personal Time Management

- Stage: 3 — Detailed Technical Design
- Date: 2026-11-24
- Status: APPROVED by the user on 2026-11-24. This approval does not authorize application code.

## 1. Authority

Every read and write in section 1 of `05-application-design.md` is checked on the server. The website is an untrusted client. Hiding a button is not the control.

## 2. Session

- The cookie is HttpOnly and SameSite=Lax. In a production HTTPS deployment it is Secure.
- The cookie value is the session id and a secret. The database stores only a hash of the secret.
- A route marked "session" rejects a missing cookie, an unknown id, a wrong secret, and a session with `ended_at` set. The response is the logged-out result and contains no Calendar and no Event.
- Logout ends only the presented session. Recovery and account deletion end every session of that account.

## 3. Personal Calendar

- `GET /api/calendar` loads the Calendar whose `owner_account_id` is the session account. It does not accept another account id.
- Event writes load the Event and require `creator_account_id` to equal the session account. A mismatch writes nothing and returns the same not-found result as a missing Event, so the first delivery does not reveal another person's Event.

## 4. Enumeration

These operations share one failure body each. The server uses the same status and the same JSON for every cause in the group.

| Operation | Causes that share one result |
|---|---|
| Register | Username taken, email held by an unverified registration, email held by a verified account, username retired |
| Cancel | Unknown email, wrong password, verified account |
| Login | Unknown email, unverified registration, wrong password |
| Start recovery | Unknown email, unverified registration, verified account |
| Complete recovery | Unknown email, unverified registration, wrong or reused or superseded proof |
| Verify | Mismatch, reuse, unknown proof |

The start-recovery group uses the same result as a failed login while mail can be sent. DEC-082: while mail cannot be sent, every registration and every recovery start returns `send_failed` and writes nothing. Sendability is checked again on the next attempt. A registration or recovery start that is still waiting when a proof message is rejected also returns `send_failed`. The body does not say whether an account exists.

## 5. Secrets

- Passwords and proof codes are hashed before storage.
- Logs, conflict warnings, and Calendar responses do not include an email address, a password, a proof code, or a password hash.
- A public Event display name is the current nickname or the username.

## 6. Account deletion

The deletion transaction deletes freezes, absences, skips, choices, Events, and the Calendar, then deletes the account and inserts `retired_usernames`, in that order, in one commit. A request that fails before commit leaves the account able to log in and leaves its Events in place. No cascade from a series row deletes a detached Event.

## 7. Out of scope

No first-delivery route grants access to another person's Calendar, a team, or a sharing link. Those rules are specified in the PRD for a later delivery and are not implemented by an unused route.
