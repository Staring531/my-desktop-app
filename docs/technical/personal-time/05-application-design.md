# Application Design: Personal Time Management

- Stage: 3 — Detailed Technical Design
- Date: 2026-11-24
- Status: APPROVED by the user on 2026-11-24. This approval does not authorize application code.
- Applications: `apps/website` calls `apps/api`. `apps/admin` has no routes for this product. `apps/desktop` is unchanged in the first delivery.

The website sends JSON to the API and renders the API result. It does not decide whether a save, warning, or proof is valid.

## 1. API operations, first delivery

All routes are under `/api`. A session cookie, when required, is the TD-PT-3 cookie. Error bodies are defined in `08-error-handling-and-observability.md`.

| Operation | Route | Session | Commit result |
|---|---|---|---|
| Register | `POST /api/registrations` | no | While mail can be sent: unverified account, optional nickname using the existing trim rules, and one verification proof, after the proof is sent. Duplicate username, duplicate email, and retired username share one failure and write nothing. While mail cannot be sent: `send_failed` and nothing stored, including a taken username. The timezone is stored only when the server can resolve it as an IANA name. Otherwise nothing is written. |
| Verify | `POST /api/registrations/verify` | no | A matching unused verification proof sets `verified_at` and `used_at` and creates the personal Calendar. A mismatch, reuse, unknown proof, or a proof of another purpose shares one non-revealing failure and does not verify. |
| Cancel registration | `POST /api/registrations/cancel` | no | Email and password match an unverified row: delete that row. Unknown email, wrong password, and a verified account share one non-revealing failure and write nothing. |
| Login | `POST /api/sessions` | no | Verified email and password create a session. Unknown email, unverified registration, and wrong password share one failure and create no session. |
| Logout | `DELETE /api/sessions/current` | yes | Sets `ended_at` on that session. |
| Start recovery | `POST /api/recoveries` | no | While mail can be sent, the same result as a failed login for unknown, unverified, and verified email. A proof is stored and sent only for a verified account. While mail cannot be sent, `send_failed` for every email and nothing is stored. |
| Complete recovery | `POST /api/recoveries/complete` | no | New password and a matching unused recovery proof replace the password hash, mark the proof used, and end every session. The response does not create a session. Unknown email, unverified registration, mismatch, reuse, a superseded proof, and a proof of another purpose share one failure and write nothing. |
| Change nickname | `PATCH /api/account` | yes | Stores the trimmed nickname or null. |
| Change timezone | `PATCH /api/account/timezone` | yes | Stores the name only when the server can resolve it in its IANA database. Otherwise returns `save_rejected` and writes nothing. A valid change freezes attached occurrences that have started. |
| Choose a generated doubled start | `POST /api/events/:id/choices` | yes | Body includes the civil date and one of the two stored instants. Sets `chosen_instant`. Any other instant writes nothing. |
| Read own Calendar | `GET /api/calendar?from=&to=` | yes | `from` and `to` are civil dates. The response is finite. It returns that account's Calendar and the occurrence objects in that range. Another account and a logged-out request receive no Calendar and no Event. |
| Create or update Event | `PUT /api/events` and `PUT /api/events/:id` | yes | A series-field save. Validates fields, computes the warning or the monthly preview, and commits the whole save or writes nothing. |
| Detach one occurrence | `POST /api/events/:id/detach` | yes | Body includes the occurrence's original start instant and the submitted content. Inserts a detached Event with `repetition = none`. |
| Delete one Event or one occurrence | `DELETE /api/events/:id` and `DELETE /api/events/:id/occurrences` | yes | Occurrence delete includes the original start instant. A committed delete removes the target. A cancelled request writes nothing. |
| Delete account | `DELETE /api/account` | yes | One transaction retires the username, deletes the account, and therefore its sessions, Calendar, and Events. A failure before commit leaves all of them. |

The first delivery does not register search, public Calendar, sharing, or team routes.

## 2. Save rules

- Trim the title. Reject an empty title, a missing clock time, an end that is not after the start, and a repetition change. Write nothing.
- Default visibility is private.
- A non-repeating save replaces title, times, location, description, and visibility. The last committed save is the stored Event.
- A series save updates the template. It applies time only by recomputing unstarted occurrences. It applies title, location, description, and visibility from the series row to every occurrence still attached, including one that has started.
- Before committing a timezone change or a series time change, insert `series_freezes` for attached occurrences whose start has been reached and that are not already frozen.
- A one-occurrence save uses the detach route. It inserts a detached Event with `repetition = none` and the content submitted with that detachment, including the original start instant. The series no longer emits that occurrence.
- Deleting one occurrence includes the original start instant, inserts `series_absences` with that instant and its civil date, and does not create a cancelled Event.
- A series save, a timezone change, or a series time change stores a skip rule for the current timezone and clock. Any civil date that rule marks missing stays skipped after a later timezone or clock change, even when the new clock exists on that date. The read applies every stored rule inside the requested range. It does not insert one row for every future year.
- Generated gaps are not left until a later read. A doubled generated start inserts `series_choices` with `chosen_instant` null. It is not part of the conflict set until chosen.
- An entered missing local time writes nothing. An entered doubled local time without a chosen instant writes nothing. The stored choice is that absolute instant.
- The response of a successful save includes the conflict list and, for a series, the continuation sentence. The continuation sentence is present even when the list is empty. A rejected monthly save returns the preview and writes nothing.
- A Calendar occurrence object has `state` (`scheduled`, `skipped`, or `choice_required`), `visibility`, `title`, `location`, `description`, the account display name, and absolute `start` and `end` when the state is `scheduled`. A skipped date has no cancelled Event. A required choice lists the two original instants.

## 3. Proof send

DEC-082 decides the outage. Sendability is checked on every registration and every recovery start. A rejected message does not leave mail marked unable. The next request checks again. The check does not store a registration or a recovery proof.

1. Take the mail lock. Ask the port whether it can send. This check does not use the submitted username or email.
2. If the port cannot send, release the lock, return `send_failed`, and write nothing.
3. If the port can send, keep the lock and apply the ordinary registration or recovery rules. Send a proof only when those rules require one.
4. The mail call has a finite wait. The wait is an implementation bound, not a product response-time target.
5. If the proof message is not accepted, roll the attempt back, release the lock, and return `send_failed`. Every registration or recovery start that is still waiting on the lock and has not yet returned a result also returns `send_failed` and writes nothing. Do not return `registration_rejected` or `login_rejected` for those waiting starts.
6. If the port accepts the message, commit and release the lock.
7. If the commit fails, or any other unexpected error occurs, return `operation_failed`. That body has no provider text, no email, and no stack trace. No proof row remains when the commit fails.

A unique username or email violation becomes `registration_rejected` only after step 3 has the lock and step 5 has not failed a send. It is not returned for an attempt that rolls back because the message was not accepted.

## 4. Website

- Registration, verification, cancellation, login, recovery, Calendar, and Event forms call the routes above.
- The Calendar page shows public and private to the owner.
- The timezone control sends an IANA name. The website does not recompute occurrence instants.
- No page in the first delivery offers search, a sharing link, a team, or another person's Calendar.

## 5. Password storage

The API stores passwords with Argon2id. Proof codes are at least 128 bits from a cryptographic random source and are stored only as a one-way hash. These choices do not set a password composition rule or a proof lifetime. DEC-023 remains open. The plain password and the proof code are not logged.
