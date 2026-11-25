# Implementation Plan: Personal Time Management

- Stage: 6 — Implementation Planning
- Date: 2026-11-24
- Status: APPROVED by the user on 2026-11-25 as the personal-time implementation baseline. The user authorized implementation on 2026-11-25. That authorization covers application code for PT-001 through PT-024 in `apps/api` and `apps/website`, including the package installs and the CI database service those tasks name. It does not authorize deployment, a production host, a mail provider, or a change to the PRD or the Technical Design.
- Product authority: `docs/product/06-prd-personal-time.md`, version 0.1, APPROVED (DEC-080, user approval 2026-11-24)
- Design authority: `docs/technical/personal-time/01-technical-requirements.md` through `09-test-strategy.md` and `docs/technical/personal-time/technical-decisions/log.md`, APPROVED by the user on 2026-11-24, including TD-PT-1, TD-PT-2, and TD-PT-3
- Review disposition: `docs/technical/personal-time/reviews/architecture-review.md` and `docs/technical/personal-time/reviews/technical-design-review.md` record TDR-PT-001 through TDR-PT-005 and TDR-PT-101 through TDR-PT-111 and TDR-PT-201 through TDR-PT-203 as addressed or closed. This plan implements that approved text.
- This document does not change the PRD or the Technical Design. It does not replace `docs/technical/10-implementation-plan.md`, which belongs to `docs/product/04-prd.md`.

## Approval record

- The personal-time PRD remains APPROVED. Version 0.1. DEC-080 records the user's approval on 2026-11-24. A requirements review and a PRD audit did not approve the PRD.
- The user explicitly approved the complete personal-time technical design on 2026-11-24. TD-PT-1 was confirmed earlier that day. TD-PT-2 and TD-PT-3 were included in the complete-design approval.
- The user explicitly confirmed this implementation plan on 2026-11-25. That confirmation accepts PT-001 through PT-024, the dependencies in section 3, the milestones in section 5, the open items in section 6, the deferred deliveries in section 8, and the risks in section 7. It does not change the PRD or the Technical Design, and it does not authorize application code.
- On the same day the user directed the plan to follow the approved application design where two plan sentences disagreed. The generated doubled-start completion write is in the first delivery. PT-019 implements `POST /api/events/:id/choices`. PT-023 sends that choice and renders the returned body. The acceptance map and the definition of done no longer leave that write out of the plan. This alignment does not add a product rule and does not authorize application code.
- On 2026-11-25 the user approved the personal-time UI/UX package and the presentation delta in `docs/ui-ux/personal-time/14-implementation-readiness.md`. PT-023 now follows that package. The handoff is `docs/ui-ux/personal-time/15-handoff.md`. This approval does not change the PRD or the Technical Design. GAP-PT-01, Q-02, Q-03, and Q-04 stay open.
- On 2026-11-25 the user separately authorized implementation. Coding starts at PT-001. Deployment remains unauthorized.
- The first delivery is the existing Next.js website (`apps/website`) talking only to the existing NestJS API (`apps/api`). The API owns the business rules and one PostgreSQL database. The browser renders input and server results.
- `apps/api` currently exposes `GET /health` and listens on `PORT` or `4000`. `apps/website` currently renders the scaffold page. Both test scripts are `vitest run --passWithNoTests`. `apps/desktop` keeps the approved local `team-record.json` design for the other PRD. `apps/admin` has no personal-time route. This planning stage changes none of those files.
- DEC-013 stays unresolved as a product selection. TD-PT-1 accepts the two existing applications for this delivery only.

## 1. Epics

The default order is PT-001 through PT-024. A later task starts after the tasks it lists as prerequisites. Section 3 names the only parallel splits.

| Epic | Tasks | Approved work |
|---|---|---|
| E1 Store and ports | PT-001 – PT-004 | PostgreSQL schema, transaction runner, result bodies, Argon2id, proof hashes, IANA civil time, mail port and mail lock. No mail provider and no host. |
| E2 Identity | PT-005 – PT-010 | Registration, verification, cancellation, session cookie, recovery, nickname. No password policy, proof lifetime, or session length. |
| E3 Calendar and single Events | PT-011 – PT-013 | Owner-only Calendar read, non-repeating save and delete, conflict window for stored absolute intervals. |
| E4 Series and timezone | PT-014 – PT-020 | Daily, weekly, and monthly templates, expansion, series save, detach, absence, skips, doubled starts, timezone change. |
| E5 Deletion and races | PT-021 – PT-022 | Account deletion and the PostgreSQL race suite from `07-concurrency-and-consistency.md`. |
| E6 Website and gate | PT-023 – PT-024 | Website forms that show the API body, then the acceptance command. |

Search, the personal calendar page, sharing links, teams, and the desktop client are confirmed later deliveries. They appear in section 8 as deferred work. They are not tasks in this plan.

## 2. Task rules

Every task is limited to the approved design. A task is done only when its verification passes and its done criteria hold. The API is the authority for uniqueness, visibility, verification, conflict results, and deletion. The website displays the API result.

Tests assert the HTTP result and the PostgreSQL rows, as `09-test-strategy.md` requires. Race tests run against PostgreSQL. A single-process test that does not assert lock order may use SQLite. SQLite is not the shared store. The desktop suite for `docs/product/04-prd.md` stays as it is.

The current `@app/api` and `@app/website` scripts include `--passWithNoTests`. A run of those scripts before the acceptance files exist is not evidence that AC-P01 through AC-P40 passed. PT-024 removes that flag from those two packages only.

Design references point at the approved personal-time document. TD-PT-1 through TD-PT-3 are in `docs/technical/personal-time/technical-decisions/log.md`.

Package installs, SQL, application code, and the CI database service belong to these tasks and wait for a separate implementation authorization. This plan does not perform them.

## 3. Dependencies and parallel work

| Task | Needs first | May proceed beside |
|---|---|---|
| PT-001 | None | PT-003. The schema does not need the time module. |
| PT-002 | None | PT-001 and PT-003. Hashing and result bodies have no tables. |
| PT-003 | None | PT-001 and PT-002. |
| PT-004 | PT-001 | PT-002 and PT-003. The mail lock is shared through PostgreSQL. |
| PT-005 | PT-001, PT-002, PT-003, PT-004 | None. Registration uses the timezone check, the hashes, and the mail protocol. |
| PT-006 | PT-005 | None. |
| PT-007 | PT-005, PT-006 | None. Cancellation is defined against both unverified and verified rows. |
| PT-008 | PT-006 | PT-007. Login needs a verified account and its Calendar. |
| PT-009 | PT-008 | None. Recovery ends sessions that login created. |
| PT-010 | PT-008 | PT-009. Nickname needs a session. |
| PT-011 | PT-008, PT-010 | PT-009. The read shows the display name. |
| PT-012 | PT-011 | None. Event writes use the owner session and the Calendar row. |
| PT-013 | PT-012 | None. The first conflict cases compare stored absolute intervals. |
| PT-014 | PT-012, PT-013 | None. A series save returns the conflict list and the continuation sentence. |
| PT-015 | PT-014 | None. |
| PT-016 | PT-015 | None. |
| PT-017 | PT-015, PT-016 | None. |
| PT-018 | PT-015, PT-016 | PT-017. Absence and detach lock the same series row; the default order is detach, then absence. |
| PT-019 | PT-003, PT-014, PT-015 | PT-016 through PT-018 for entered-time rejection on create. Generated skip and choice rows need the series write path. |
| PT-020 | PT-015, PT-016, PT-019 | PT-017 and PT-018. A timezone change freezes started occurrences and keeps stored skip rules. |
| PT-021 | PT-012 | PT-014 through PT-020. Deletion of a non-repeating Event is enough to prove the transaction; the same transaction must also remove series child rows once those tables have rows. Call E5 complete only after a series account is deleted in this task. |
| PT-022 | PT-007, PT-009, PT-017, PT-018, PT-020, PT-021 | None. |
| PT-023 | The API task for each form | A form may be built after its route exists. The Calendar and Event forms wait for PT-020 so skipped dates, choices, warnings, and timezone labels are real API bodies. |
| PT-024 | PT-001 through PT-023 | None. |

Integration boundaries:

- API tests boot the NestJS app and read PostgreSQL. They do not launch Electron or the website.
- Race tests use PostgreSQL locks. They assert committed rows, not a statement interleaving.
- Website tests supply an API body and assert what the page shows. They do not calculate a second overlap, preview, or instant.
- `packages/api-client` currently sends a bearer token and drops the JSON body on a non-2xx status. This product uses the TD-PT-3 cookie and returns the shared JSON `result` on the statuses in `08-error-handling-and-observability.md`. The website calls the API with that cookie. It does not adopt the bearer client.
- No task imports `apps/desktop/src/domain` or reads or writes `team-record.json`.
- No task adds a route or a page for search, another person's Calendar, a sharing link, a team, or the desktop client.
- `GET /health` stays where it is. Personal-time controllers live under `/api` and do not move the health route.

## 4. Tasks

### PT-001 — PostgreSQL schema

- Epic: E1
- Scope: In `apps/api`, add the only connection this product uses to PostgreSQL and one first migration. The migration creates `accounts`, `retired_usernames`, `sessions`, `proofs`, `calendars`, `events`, `series_freezes`, `series_absences`, `series_skip_rules`, and `series_choices` with the columns, nullability, and keys in `04-data-design.md`. Unique username, unique email, and unique `calendars.owner_account_id` are constraints. `sessions` has no expiry column. `proofs` has no lifetime column. `detached_from_event_id` does not delete a detached Event when the series row is deleted. The migration creates no team, invitation, link, or search table.
- Design: `04-data-design.md` sections 1 and 2; TD-PT-2.
- PRD: Supports BR-P3, BR-P12, and every later AC-P that stores a row. No acceptance criterion is fully met in this task.
- Prerequisites: None.
- Deliverables: The migration, a connection used only by `apps/api`, and a test that applies the migration on PostgreSQL.
- Verification: The ten tables exist. A second username or email insert fails. A second personal Calendar for one account fails. Inserting a detached Event and then deleting the referenced series row by the application deletion order leaves the detached Event. `team-record.json` is untouched.
- Done when: The migration applies on an empty PostgreSQL database and the constraint checks pass.

### PT-002 — Result bodies, hashes, and logs

- Epic: E1
- Scope: Add the JSON `result` values and HTTP statuses from `08-error-handling-and-observability.md`. Add Argon2id password hashing and one-way hashing of proof codes. A proof code is at least 128 bits from a cryptographic random source. Store the hash only. Add one log line per committed or rejected operation with the operation name, the `result` string, and the account id when that session already knows the account. The line omits email, password, proof code, password hash, and proof hash.
- Design: `05-application-design.md` section 5; `06-security-and-access-control.md` section 5; `08-error-handling-and-observability.md` sections 1 through 3.
- PRD: Supports BR-P4 and the shared failure results in AC-P01, AC-P02, AC-P24, AC-P25, and AC-P26. This task does not choose a password composition rule or a proof lifetime.
- Prerequisites: None.
- Deliverables: The result mapper, the hash helpers, and the log helper in `apps/api`.
- Verification: Each documented `result` maps to its documented status. A failure body used by a later task has no email, no "taken" statement, no password, no proof code, and no stack trace. A known proof code verifies against its hash, and a different code does not. The log line for a hashed password contains neither the password nor the hash.
- Done when: Those checks pass, and no route is registered yet.

### PT-003 — IANA civil time

- Epic: E1
- Scope: Add a server time module in `apps/api` that resolves an IANA name, converts a local civil date and clock to absolute instants, detects a local time that does not exist, and detects a local time that occurs twice. It calculates 90 calendar dates in a timezone starting on a civil date and including that date. It supports the named `America/New_York` examples. Add `@js-temporal/polyfill` to `@app/api` if the module uses it. Do not import `apps/desktop`.
- Design: `03-domain-model.md` sections 2 and 4; `05-application-design.md` timezone sentences; `09-test-strategy.md` named dates.
- PRD: Supports BR-P11. The module is necessary for AC-P09, AC-P14, AC-P15, AC-P23, AC-P27, AC-P32, and AC-P36. This task stores no Event.
- Prerequisites: None.
- Deliverables: The time module and its unit tests.
- Verification: `America/New_York` resolves. 02:30 on 2026-03-08 does not exist. 01:30 on 2026-11-01 occurs twice, and the earlier and later instants differ. A 90-date window that starts on 2026-01-01 includes that day and 2026-02's relevant dates and excludes a date on day 91. An unknown timezone name does not resolve.
- Done when: Those cases pass without a database write.

### PT-004 — Mail port and mail lock

- Epic: E1
- Scope: Add a mail port with two answers: it can send one proof, or it cannot. The concrete provider stays unset. Tests use a double. Follow the seven steps in `05-application-design.md` section 3. The sendability check does not use the submitted username or email. A failure to send stores nothing, returns `send_failed`, and does not leave the port marked unable. The next request checks again. Waiting registration and recovery starts that have not yet returned also return `send_failed` when a proof message is rejected. A failed send is not queued. The mail call has a finite wait; that wait is an implementation bound, not a DEC-079 target, and this plan does not choose the number. Share the mail lock through PostgreSQL so every API process using this database shares it. Log a provider failure as "send failed" without the recipient.
- Design: `02-architecture.md` section 3; `05-application-design.md` section 3; `08-error-handling-and-observability.md` sections 1 and 3; DEC-081; DEC-082.
- PRD: Supports AC-P01 and AC-P26 where they require a sent or unsent proof. The account rules are PT-005 and PT-009.
- Prerequisites: PT-001.
- Deliverables: The port, the PostgreSQL mail lock, and lock tests with the double.
- Verification: While the double cannot send, the caller receives `send_failed` and the transaction writes nothing. While it can send and then rejects the message, the attempt rolls back, the lock is released, and a waiter also receives `send_failed`. A later call asks the port again and can succeed. An unexpected error after an accepted message returns `operation_failed` with no provider text, no email, and no stack trace.
- Done when: Those protocol tests pass with no registration route.

### PT-005 — Registration

- Epic: E2
- Scope: `POST /api/registrations`. The body has username, email, password, optional nickname, and the browser timezone. Store the submitted username and email without adding a character, length, or case policy. Hash the password. Apply the nickname trim: outer whitespace is removed, an all-space value is stored as null, and internal spaces remain. Store the timezone only when PT-003 can resolve it. While mail can be sent, commit the unverified account and one verification proof only after the port accepts the message to that registration email. A taken username, an email held by an unverified registration, an email held by a verified account, and a retired username share `registration_rejected` and write nothing. While mail cannot be sent, return `send_failed` and write nothing, including when the username is taken or retired. Lock the username and recheck `retired_usernames` in that transaction. An unverified account cannot log in. The response reveals neither which field conflicted nor whether an account exists.
- Design: `03-domain-model.md` section 1; `05-application-design.md` sections 1 and 3; `06-security-and-access-control.md` section 4; `07-concurrency-and-consistency.md` section 7.
- PRD: AC-P01 registration and the login block before verification; AC-P02; AC-P17; the nickname storage rule used by AC-P33 and AC-P39 when the nickname is submitted here.
- Prerequisites: PT-001, PT-002, PT-003, PT-004.
- Deliverables: The route and its API tests.
- Verification: A new username, email, and password with an empty nickname creates an unverified row, sends one proof only to that email, and stores the display name as the username. The same failure body is returned for a taken username, an unverified email, a verified email, and a retired username, and no second account is created. With the mail double unable to send, a new registration and a taken username both return `send_failed` and leave the previous rows unchanged. `Sam Lee` keeps the internal space. A space-only nickname is stored as null. An unresolved timezone writes nothing.
- Done when: Those tests pass. An unresolved timezone returns `save_rejected` and writes nothing.

### PT-006 — Verification and the personal Calendar

- Epic: E2
- Scope: `POST /api/registrations/verify`. A matching unused verification proof sets `verified_at` and `used_at` and inserts the personal Calendar with `kind = personal` in the same transaction. A mismatch, a reuse, an unknown proof, and a proof whose purpose is recovery share `verification_rejected` and do not verify. Accept a proof only when its purpose is verification. Lock the account row after finding it.
- Design: `04-data-design.md` `calendars`; `05-application-design.md` verify row; `07-concurrency-and-consistency.md` sections 1 and 4.
- PRD: AC-P01 matching proof, mismatched proof, reused proof, and the non-revealing failure.
- Prerequisites: PT-005.
- Deliverables: The route and its API tests.
- Verification: The matching proof verifies the account and creates one Calendar. A second use and a wrong code return the same `verification_rejected` body and leave `verified_at` unset. A recovery proof does not verify the account. No email or proof code appears in the failure body.
- Done when: A verified account has one personal Calendar, and a rejected proof leaves the registration unverified.

### PT-007 — Cancel an unverified registration

- Epic: E2
- Scope: `POST /api/registrations/cancel` with email and password. When both match an unverified row, delete that row and its proofs. The username is not retired. An unknown email, a wrong password, and a verified account share `cancellation_rejected` and write nothing. Lock the account row. The commit that finishes first wins against verification.
- Design: `05-application-design.md` cancel row; `06-security-and-access-control.md` section 4; `07-concurrency-and-consistency.md` section 4.
- PRD: AC-P24.
- Prerequisites: PT-005, PT-006.
- Deliverables: The route and its API tests, including the two finish-order cases on PostgreSQL.
- Verification: A matching cancel removes the unverified row, and that username and email can be registered again. The three failure causes share one body and leave the rows unchanged. When verification commits first, cancellation returns `cancellation_rejected` and the account stays verified with its Calendar. When cancellation commits first, verification returns `verification_rejected` and creates no account.
- Done when: Both finish orders match AC-P24.

### PT-008 — Login and logout

- Epic: E2
- Scope: `POST /api/sessions` and `DELETE /api/sessions/current`. A verified email and the correct password create a session row and set the TD-PT-3 cookie. The cookie value is the session id and a secret. The database stores only a hash of the secret. The cookie is HttpOnly and SameSite=Lax. It has no expiry attribute and no Max-Age. In a configuration marked as production HTTPS, the cookie is also Secure. The server stores no session duration. Unknown email, unverified registration, and wrong password share `login_rejected` and create no session. A missing cookie, an unknown id, a wrong secret, and a session with `ended_at` set return `logged_out` and contain no Calendar and no Event. Logout sets `ended_at` on the presented session only.
- Design: `04-data-design.md` `sessions`; `06-security-and-access-control.md` section 2; TD-PT-3.
- PRD: AC-P25; AC-P34 for the logged-out request. AC-P01's successful login is completed here.
- Prerequisites: PT-006.
- Deliverables: The session routes, cookie writer, and session guard.
- Verification: The three login failures share one body and create no session. A verified login returns a cookie with no expiry attribute. Logout ends that session, and the next guarded request returns `logged_out` with no Calendar and no Event. A second session of the same account stays open after the first logs out. No test sets a lifetime.
- Done when: AC-P25 passes and the cookie carries no duration.

### PT-009 — Password recovery

- Epic: E2
- Scope: `POST /api/recoveries` and `POST /api/recoveries/complete`. While mail can be sent, every start returns `login_rejected`. Store and send a recovery proof only for a verified account, and only after the port accepts the message. An unknown email and an unverified registration send nothing and store nothing. A later recovery proof sets `superseded_at` on every other unused recovery proof for that account in the same transaction. While mail cannot be sent, every start returns `send_failed` and stores nothing. Completion takes the email, the new password, and the proof. A match replaces the password hash, sets `used_at`, and ends every session. The response creates no session. Unknown email, unverified registration, mismatch, reuse, a superseded proof, and a proof of another purpose share `recovery_rejected` and write nothing. There is no clock expiry.
- Design: `05-application-design.md` recovery rows and section 3; `06-security-and-access-control.md` sections 2 and 4; `07-concurrency-and-consistency.md` sections 3 and 7.
- PRD: AC-P26 except the unfinished-save race, which is PT-022; AC-P39's recovery-start sentence.
- Prerequisites: PT-008.
- Deliverables: The two routes and their API tests.
- Verification: Verified, unknown, and unverified starts share `login_rejected` while mail can send, and only the verified account receives a proof. With mail unable to send, all three return `send_failed` and add no proof. Completion ends every open session, makes the old password fail, and does not set a session cookie. A later login with the new password opens the Calendar. An earlier unused proof, a reused proof, a mismatched proof, an unknown email, and an unverified registration share `recovery_rejected` and leave the password hash unchanged. The newest proof still completes recovery.
- Done when: Those cases pass without a proof-lifetime column.

### PT-010 — Nickname

- Epic: E2
- Scope: `PATCH /api/account` for the session account. Store the trimmed nickname, or null when the trimmed value is empty. Internal spaces remain. The display name is the stored nickname, or the username when the nickname is null. The change is visible on the next read without another Event save.
- Design: `03-domain-model.md` section 1; `05-application-design.md` nickname row.
- PRD: AC-P33; AC-P39's internal-space sentence.
- Prerequisites: PT-008.
- Deliverables: The route and its API tests.
- Verification: A space-only nickname becomes null and the display name is the username. ` Sam ` is stored as `Sam`. `Sam Lee` keeps the internal space. A logged-out request returns `logged_out`.
- Done when: The stored nickname matches those three inputs. The public Event display is asserted again in PT-011.

### PT-011 — Read the owner's Calendar

- Epic: E3
- Scope: `GET /api/calendar?from=&to=` for the session account. `from` and `to` are civil dates. The response is limited to that range. Load the Calendar by `owner_account_id` and ignore any other account id. Another logged-in account and every logged-out request receive `logged_out` or, for a session that is valid but is not the owner, no Calendar and no Event. The route does not accept another account id. Each occurrence object has `state` (`scheduled`, `skipped`, or `choice_required`), `visibility`, `title`, `location`, `description`, the account display name, and absolute `start` and `end` when the state is `scheduled`. This task returns stored non-repeating Events. Series expansion is PT-015.
- Design: `05-application-design.md` Calendar row and occurrence object; `06-security-and-access-control.md` section 3.
- PRD: AC-P03; AC-P18; AC-P34; AC-P33's public Event display name.
- Prerequisites: PT-008, PT-010. Non-repeating rows used in the tests come from the database fixtures until PT-012 owns the write route.
- Deliverables: The read route and its API tests.
- Verification: User B, logged in, receives neither user A's Calendar nor A's public or private Event. Logged-out A receives neither the Calendar nor an Event. After A logs in, A receives that Calendar and can tell which Event is public and which is private. A's public Event shows `Sam` after the nickname change, with no second Event write. The body contains no email.
- Done when: AC-P03, AC-P18, and AC-P34 pass for stored Events.

### PT-012 — Non-repeating Event save and delete

- Epic: E3
- Scope: `PUT /api/events`, `PUT /api/events/:id`, and `DELETE /api/events/:id` for `repetition = none`. Trim the title. Reject an empty title, a missing clock time, a date-only value, and an end that is not after the start with `save_rejected` and no write. Default visibility is private. A public choice stores public. Location and description may be empty. Store absolute start and end. A successful edit replaces the stored title, times, location, description, and visibility. The last committed save is the stored Event. A committed delete removes the Event. A rolled-back delete leaves it. Past, in-progress, and future Events may be stored. Load the Event and require `creator_account_id` to equal the session account. A mismatch writes nothing and returns `not_found`, the same body as a missing Event. Lock the Event row and the account row. Recheck the session `ended_at` immediately before commit. A save that finds the account already deleted returns `account_gone` and writes nothing.
- Design: `03-domain-model.md` section 2; `05-application-design.md` section 2; `07-concurrency-and-consistency.md` sections 1 and 2.
- PRD: AC-P04; AC-P05; AC-P06; AC-P07; AC-P30; AC-P37 for a new public Event, an Event that crosses the current instant, and the non-repeating portion of a past start; AC-P35 for two successful saves and a rolled-back save.
- Prerequisites: PT-011.
- Deliverables: The three routes and their API tests.
- Verification: `  Focus  ` from 09:00 to 10:00 with no public choice stores `Focus`, private, with the end after the start. An empty title, an end that is not later, and a date-only value write nothing. An already-ended Event remains on the Calendar. A public choice stores public. An edit shows the new title and time only. A committed delete is absent from a later conflict comparison. A rolled-back delete leaves the row. Two successful saves leave the complete content of the save that commits last. Another account's Event id returns `not_found` and writes nothing.
- Done when: Those criteria pass on PostgreSQL.

### PT-013 — Conflict window for absolute intervals

- Epic: E3
- Scope: On a successful save, compare the creator's other owned absolute intervals inside 90 calendar dates in the creator's current timezone, starting on the save date and including it. Overlap means a shared positive length. Touching endpoints do not overlap. Include a past overlap, an in-progress overlap, and a partial overlap at the far boundary. Exclude an overlap that lies entirely after the window. Exclude the Event being saved. The warning lists `title`, `start`, and `end` only. It does not block the save. A series continuation sentence is PT-014. Comparison against an expanded series is PT-015. A detached occurrence is PT-017.
- Design: `03-domain-model.md` section 4; `08-error-handling-and-observability.md` `conflicts`.
- PRD: AC-P12 for a new Event, a title-only edit, and touching endpoints; AC-P32; AC-P40.
- Prerequisites: PT-012.
- Deliverables: The comparison used by the non-repeating save, and its API tests.
- Verification: An overlapping owned Event is listed by title, start, and end, and the save still commits. The list has no email. Changing only the title does not list the Event itself. An Event that ends when another starts is not listed. An overlap entirely after the 90 dates is not listed. An overlap yesterday, an in-progress overlap, and a partial overlap at the far boundary are listed when the shared time falls inside the window. A save with no overlap lists no Event and commits.
- Done when: AC-P32 and AC-P40 pass for non-repeating Events, together with the non-series sentences of AC-P12.

### PT-014 — Series template

- Epic: E4
- Scope: Extend `PUT /api/events` and `PUT /api/events/:id` for `daily`, `weekly`, and `monthly`. Store the clock-face template: local start, local end, anchor date, and either the start weekday or the month date. The repetition kind is fixed at insert. The update statement does not include `repetition`. A request that changes the kind returns `save_rejected` and leaves the stored kind. Weekly occurrences use only that weekday. A monthly date that exists in every month is stored. A monthly date that does not exist in every month writes nothing and returns `save_rejected` with `monthTypes` and `missingDates`. `missingDates` lists only civil dates inside the 90-date window. For a save on 2026-01-01 of the 31st, `monthTypes` names months with fewer than 31 days and `missingDates` includes February 2026. A successful series save includes `continuesAfterWindow: true` even when `conflicts` is empty. That flag is not a conflict entry. A series whose start is already past may be stored. There is no automatic series end.
- Design: `03-domain-model.md` sections 2 and 4; `04-data-design.md` `events`; `05-application-design.md` section 2; `08-error-handling-and-observability.md` preview.
- PRD: AC-P08 storage; AC-P09; AC-P19 storage; AC-P20; AC-P31; AC-P37's past series start; the empty-list continuation sentence of AC-P13 and AC-P32.
- Prerequisites: PT-012, PT-013.
- Deliverables: Series insert and the rejected kind change, plus the monthly preview.
- Verification: A weekly series stores Wednesday from a Wednesday start. A daily series stores the daily template. A monthly date that exists in every month, such as the 28th, is stored. The 31st on 2026-01-01 writes nothing and returns the preview above, without a later year's dates. Changing a stored daily Event to monthly writes nothing and leaves it daily. A series save with no overlap still returns `continuesAfterWindow: true` and an empty conflict list.
- Done when: AC-P09, AC-P20, and AC-P31 pass. Occurrence expansion is PT-015.

### PT-015 — Occurrence expansion

- Epic: E4
- Scope: A Calendar read over the requested civil dates computes unstarted attached occurrences from the template and the current timezone. It does not insert one row per future date. Include a template occurrence whose start has been reached even when no freeze row exists. After a freeze exists, emit the freeze and do not also emit the new clock time on that slot. Apply absences by the stored civil date, skip rules, and unchosen choices. A skipped date uses `state = skipped` and is not a cancelled Event. An unchosen doubled start uses `state = choice_required` and lists the two original instants. It has no scheduled interval. Use one snapshot of timezone, template, freezes, absences, skips, and choices. Conflict comparison of a series uses that same snapshot. Exclude the Event being saved and its own attached occurrences.
- Design: `03-domain-model.md` section 3; `04-data-design.md` section 3; `07-concurrency-and-consistency.md` section 6.
- PRD: AC-P08; AC-P19; AC-P13 once another owned Event overlaps inside the window.
- Prerequisites: PT-014.
- Deliverables: The read expansion and the series conflict snapshot.
- Verification: A weekly series shows later attached occurrences on Wednesday only. A daily series shows an attached occurrence on each later calendar day at the start clock time in the current timezone. A series save that overlaps another owned Event inside the 90 dates lists those overlaps and returns `continuesAfterWindow: true`. The continuation flag is separate from the conflict list.
- Done when: AC-P08, AC-P19, and AC-P13 pass.

### PT-016 — Series save

- Epic: E4
- Scope: A series save updates the template and applies title, location, description, and visibility from the series row to every occurrence still attached, including one that has started. It applies time only to attached occurrences that have not started. Before committing a series time change, insert `series_freezes` for attached occurrences whose start has been reached and that are not already frozen. Text and visibility stay on the series row, not on the freeze. A started occurrence is one whose start instant has been reached, including when its end has not. The save does not delete an absence row and does not delete a detached Event. Lock the series row.
- Design: `03-domain-model.md` section 3; `05-application-design.md` section 2; `07-concurrency-and-consistency.md` section 5.
- PRD: AC-P11; AC-P28 for the still-attached occurrences; AC-P29.
- Prerequisites: PT-015.
- Deliverables: The series update path and its API tests.
- Verification: After a weekday and time change, a past attached occurrence keeps its instant and a future attached occurrence uses the new weekday and time. An in-progress attached occurrence keeps its instant. One save that changes title, location, description, and visibility shows the new text and visibility on the started occurrence, keeps that occurrence's time, and shows the new time on the occurrence that has not started. A detached occurrence is unchanged. Making the series private and changing its time makes an already-started attached occurrence private at its old time and makes a not-yet-started attached occurrence private at the new time.
- Done when: AC-P11 and AC-P29 pass, and the attached half of AC-P28 passes.

### PT-017 — Detach one occurrence and delete the series

- Epic: E4
- Scope: `POST /api/events/:id/detach` with the occurrence's original start instant and the submitted content. Insert a detached Event with `repetition = none`, its own text, time, and visibility, and `original_start_instant`. The series no longer emits that occurrence. Changing one occurrence, including only its visibility, uses this route. `DELETE /api/events/:id` on a series deletes that series' freezes, absences, skip rules, and choices, then the series row, in one transaction. Detached Events remain, including `detached_from_event_id`. Lock the series row. If a series save commits first and the detachment commits later, the detached Event has the content submitted with the detachment.
- Design: `04-data-design.md` section 2; `05-application-design.md` detach and delete rows; `07-concurrency-and-consistency.md` section 5.
- PRD: AC-P10; AC-P22; AC-P28's detached occurrence; AC-P12's detached-overlap sentence.
- Prerequisites: PT-015, PT-016.
- Deliverables: The detach route, series deletion, and their tests.
- Verification: A modified occurrence remains as saved after a later series change and after series deletion. Attached occurrences and absences are gone after series deletion. The detached occurrence remains. A private occurrence made public stays public at its previous time after the series becomes private and changes time. When a series save to 10:00 commits before a detachment that submits Solo at 09:00, the detached Event is Solo at 09:00 and is no longer attached. Saving the series warns when that detached occurrence overlaps it, and the warning includes that occurrence.
- Done when: AC-P10, AC-P22, and the detached sentences of AC-P12 and AC-P28 pass.

### PT-018 — Delete one occurrence

- Epic: E4
- Scope: `DELETE /api/events/:id/occurrences` with the original start instant. Insert `series_absences` with that instant and the civil date in the timezone at deletion. Do not create a cancelled Event. A later series save does not delete that absence. A later clock change on the same daily date, weekday, or month date leaves that civil date empty. A weekday change does not apply the absence to the new weekday. A timezone re-expansion does not emit a replacement for that original instant. A rolled-back delete writes nothing. Lock the series row. The transaction that commits later wins against a series save.
- Design: `03-domain-model.md` section 3; `04-data-design.md` `series_absences`; `07-concurrency-and-consistency.md` section 5.
- PRD: AC-P21; AC-P38's deleted-occurrence sentence.
- Prerequisites: PT-015, PT-016.
- Deliverables: The occurrence-delete route and its API tests.
- Verification: Deleting one Wednesday and later moving the series to Thursday keeps that original start absent and shows Thursday. The same absence stays absent after a timezone re-expansion. A series save that commits after the deletion does not restore it. A deletion that commits after the series save stays absent. Wednesday 09:00 deleted, then Wednesday 15:00 before that date starts, leaves that date empty and uses 15:00 on other Wednesdays that have not started. The same empty-date result holds for a deleted daily 09:00 on 12 May and a deleted monthly 12th at 09:00 when the series later moves to 15:00. The absence is not shown as a cancelled Event.
- Done when: AC-P21 passes.

### PT-019 — Missing and doubled local times

- Epic: E4
- Scope: An entered local time that does not exist writes nothing. An entered local time that occurs twice writes nothing unless the save includes one chosen absolute instant, and that instant is the one stored. A generated missing start, a generated missing end, or an interval that crosses a missing local hour stores a `series_skip_rules` row for the current timezone and clock and keeps the series. Any civil date that a stored rule marks missing stays skipped after a later timezone or clock change. The read applies every stored rule inside the requested range. A generated doubled start inserts `series_choices` with `chosen_instant` null at the series save, timezone change, or series time change that discovers it. That row is not part of the conflict set. The read offers the two original absolute instants. `POST /api/events/:id/choices` sets `chosen_instant` when the session owns the series and the body contains that civil date plus one of those two stored instants. Any other instant writes nothing. After that write, the chosen occurrence is part of conflict comparison.
- Design: `03-domain-model.md` sections 3 and 4; `04-data-design.md` skip rules and choices; `05-application-design.md` section 1 choice route and section 2.
- PRD: AC-P15; AC-P23; AC-P27 for the skip, the unchosen row, the conflict exclusion, and the completion write; AC-P38 for a generated missing start.
- Prerequisites: PT-003, PT-014, PT-015.
- Deliverables: Entered-time rejection and choice on the Event save, skip-rule writes, unchosen `series_choices` rows, and the choice route.
- Verification: 02:30 on 2026-03-08 in `America/New_York` writes nothing. 01:30 on 2026-11-01 in `America/New_York` with no choice writes nothing. Choosing the earlier 01:30 stores that instant. A generated missing start is `skipped`, the series remains, and it is not a cancelled Event. A generated missing end or a gap across a missing hour is skipped, and the series remains. The unchosen doubled start is `choice_required`, lists the two original instants, and is absent from the conflict list. The choice route stores one of those two instants for the owning session, and that occurrence then appears in conflict comparison. Another instant, another account, and a logged-out request leave `chosen_instant` null.
- Done when: AC-P15, AC-P23, and AC-P38 pass, and the choice half of AC-P27 stores one of the two original instants.

### PT-020 — Change the calendar timezone

- Epic: E4
- Scope: `PATCH /api/account/timezone`. Store the name only when PT-003 resolves it. Otherwise write nothing. A valid change locks the account and each of its series rows, inserts freezes for attached occurrences whose start has been reached, stores skip rules for the current timezone and clock, and commits the new timezone together with those rows. Unstarted attached occurrences expand at the template clock in the new timezone. A non-repeating Event keeps its absolute start and end. A detached occurrence stays unchanged. A chosen future doubled start keeps its stored absolute instant once that choice exists. An unchosen doubled start stays unchosen. A skipped date stays skipped. The website is not asked to recompute instants.
- Design: `05-application-design.md` timezone row and section 2; `07-concurrency-and-consistency.md` sections 6 and 7.
- PRD: AC-P14; AC-P36; the timezone sentences of AC-P27.
- Prerequisites: PT-015, PT-016, PT-019.
- Deliverables: The timezone route and its API tests.
- Verification: After a timezone change with no series edit, an attached occurrence that has started keeps its absolute instant, and an attached occurrence that has not started uses the same clock time in the new timezone. A non-repeating Event keeps its absolute start and end. A detached occurrence is unchanged. A skipped date stays skipped. An unchosen start stays unchosen and still offers the two original instants. An unresolved timezone name writes nothing.
- Done when: AC-P14 and AC-P36 pass, and the timezone half of AC-P27 passes. An unresolved timezone name returns `save_rejected` and writes nothing.

### PT-021 — Delete the account

- Epic: E5
- Scope: `DELETE /api/account` in one transaction. Delete `series_freezes`, `series_absences`, `series_skip_rules`, and `series_choices` for that account's series, then every Event of that account, then the Calendar, then the account, and insert `retired_usernames`. Sessions and proofs go with the account. A detached Event is deleted because it is that account's Event, not because of a cascade from the series row. A failure before commit leaves the login, the Calendar, and the Events. The username can be registered again only when this transaction does not commit. After commit, the username cannot be registered. The email can be registered again, and the new account has none of the deleted Events. Lock the account row. A save that commits after this commit writes nothing. A save that commits first is removed by this transaction.
- Design: `04-data-design.md` section 2; `06-security-and-access-control.md` section 6; `07-concurrency-and-consistency.md` section 2.
- PRD: AC-P16; the deletion sentences of AC-P35.
- Prerequisites: PT-012. Repeat the deletion assertion after series child rows exist, before E5 is complete.
- Deliverables: The route and its API tests.
- Verification: A completed deletion removes the login, the Calendar, and the Events. The retired username cannot be registered. The email can register a new account, and that account's Calendar does not contain the deleted Events. A forced rollback leaves the login, the Calendar, and the Events, and does not retire the username. A save that commits after deletion returns `account_gone` and adds no Event. A save that commits first is absent after deletion commits.
- Done when: AC-P16 passes, including an account that owns a series and a detached Event.

### PT-022 — PostgreSQL race suite

- Epic: E5
- Scope: Add the race tests named in `09-test-strategy.md` and `07-concurrency-and-consistency.md`. Each test asserts the committed rows. The races are: two saves of one Event; a save against account deletion; recovery against an open Event transaction; verification against cancellation; a series save against a later detachment; a series save against a later occurrence deletion; registration against username retirement; two recovery starts; a timezone change against a series save.
- Design: `07-concurrency-and-consistency.md`; `09-test-strategy.md` section 3.
- PRD: AC-P10's finish order; AC-P21's finish order; AC-P24's finish order; AC-P26's unfinished save and the save that finished first; AC-P35.
- Prerequisites: PT-007, PT-009, PT-017, PT-018, PT-020, PT-021.
- Deliverables: The PostgreSQL race tests. No new product rule.
- Verification: The last committed Event save is stored in full, and a rolled-back save leaves the prior row. Recovery that commits while a save is open causes that save to write nothing. A save that committed before recovery remains. Two recovery starts leave one usable newest proof. Registration that loses to a committed deletion does not take the retired username. A timezone change and a series save commit the freezes with the timezone or template they locked. The finish orders already required by PT-007, PT-017, and PT-018 still hold in this suite.
- Done when: The suite passes on PostgreSQL and is not skipped on SQLite.

### PT-023 — Website forms

- Epic: E6
- Scope: In `apps/website`, add the registration, verification, cancellation, login, recovery, Calendar, and Event forms from `05-application-design.md` section 4. Each form sends JSON to the matching `/api` route and renders the API body, including `conflicts`, `continuesAfterWindow`, the monthly preview, `state`, visibility, and the display name. The timezone control sends an IANA name taken from the browser at registration and the name the user selects later. On a `choice_required` occurrence, the Calendar form sends the civil date and one instant taken from the returned list to `POST /api/events/:id/choices`, then renders the returned body. The website does not recompute occurrence instants, overlap, or the monthly preview, and it does not invent a third instant. The Calendar page shows the owner which Event is public and which is private. No page offers search, a sharing link, a team, or another person's Calendar. Presentation follows the personal-time UI package approved by the user on 2026-11-25: screens S-01 through S-09, the tokens in `docs/ui-ux/personal-time/tokens/design-tokens.json`, components PT-C01 through PT-C10, and interactions I-01 through I-17, as handed off in `docs/ui-ux/personal-time/15-handoff.md`. Map those tokens to plain CSS custom properties. Do not add a token compiler or a styling dependency, and do not reuse `docs/ui-ux/tokens/design-tokens.json`. Do not invent the two instants for an entered doubled time; show `save_rejected` and paint a choice only from instants present in the body until a Technical Design change returns them. Do not choose a product title, a mail layout, or the first calendar range while Q-02, Q-03, and Q-04 are open. This presentation amendment does not authorize application code.
- Design: `02-architecture.md` sections 1 and 2; `05-application-design.md` sections 1 and 4; `09-test-strategy.md` website sentence.
- PRD: The same AC-P criteria as the routes those forms call, seen through the page: AC-P01, AC-P18, AC-P25, AC-P26, AC-P27, AC-P33, AC-P34, and the save, warning, preview, and timezone results the API already returns.
- Prerequisites: The API task for each form. Calendar and Event forms need PT-020.
- Deliverables: The forms and website tests that stub the API body.
- Verification: A stubbed `save_rejected` preview is shown as returned. A stubbed conflict list and `continuesAfterWindow: true` are shown as returned, including when the list is empty. A stubbed `skipped` occurrence and a stubbed `choice_required` occurrence are shown from the body. Choosing one listed instant sends that civil date and that instant, and the page shows the returned body. The page does not derive a different instant from the timezone control or from the choice list. Logged-out and other-account bodies show no Calendar and no Event. The page source and routes include no search, sharing, team, or other-calendar action. The forms follow the approved personal-time screens and tokens and do not import the desktop token file.
- Done when: The website test proves it displays the API body and does not calculate a second result.

### PT-024 — Acceptance gate

- Epic: E6
- Scope: Map AC-P01 through AC-P40 onto the tests from PT-005 through PT-023. Remove `--passWithNoTests` from the `@app/api` and `@app/website` test scripts after those tests exist. Leave `@app/desktop`, `@app/admin`, `@app/shared`, and `@app/api-client` scripts unchanged. Add a PostgreSQL service to the existing CI quality job so `pnpm test` can run the race suite. Pass the test database URL only into that job. Do not select a production host, a mail provider, or a deployment.
- Design: `09-test-strategy.md` section 4. The existing root commands are `pnpm test`, `pnpm typecheck`, and `pnpm lint`. CI already runs those plus `pnpm build`.
- PRD: AC-P01 through AC-P40.
- Prerequisites: PT-001 through PT-023.
- Deliverables: The script change, the CI PostgreSQL service, and one recorded run of the root commands.
- Verification: `pnpm --filter @app/api test` and `pnpm --filter @app/website test` fail if their personal-time test files are absent. With the files present, `pnpm test`, `pnpm typecheck`, `pnpm lint`, and `pnpm build` complete. The race tests run on the CI PostgreSQL service. AC-L01 through AC-L13 have no test in this run.
- Done when: Those four root commands pass with the personal-time tests included, and section 6 is still unresolved.

## 5. Milestones

| Milestone | Tasks | Exit |
|---|---|---|
| M1 Store and ports | PT-001 – PT-004 | PostgreSQL has the first-delivery tables, and the mail double can accept or reject a proof without a provider. |
| M2 Identity | PT-005 – PT-010 | A person can register, verify, cancel, log in, log out, recover a password, and change a nickname. No session length is stored. |
| M3 Own Calendar | PT-011 – PT-013 | The owner can save, edit, and delete a non-repeating Event and see a conflict warning. Another person and a logged-out owner cannot. |
| M4 Repetition and timezone | PT-014 – PT-020 | Daily, weekly, and monthly series follow the approved occurrence rules, and a timezone change commits with its freezes. |
| M5 Account lifetime | PT-021 – PT-022 | Account deletion is all or nothing, and the PostgreSQL race suite passes. |
| M6 First-delivery gate | PT-023 – PT-024 | The website shows API results, and the root test, typecheck, lint, and build commands pass. |

## 6. Open items this plan does not decide

No task may choose these. They stay unresolved.

| Item | Why it stays open | What implementation does |
|---|---|---|
| DEC-023: username characters and length, password composition, verification-message lifetime, recovery-proof lifetime, changing the account email | The PRD leaves them open. The design stores the submitted username and email and adds no policy, no proof-lifetime column, and no email-change route. | Store the submitted username and email. Hash the password. Treat a proof as unusable when it is used, superseded, or its account row is gone. Add no clock expiry and no email-change task. |
| DEC-038 session length | The PRD sets no length. TD-PT-3 stores no duration and puts no expiry attribute on the cookie. | Create and end sessions as specified. Add no lifetime task. |
| DEC-079 performance, availability, and accessibility | The PRD and `08-error-handling-and-observability.md` set no target. | Add no response-time task, availability target, accessibility standard, dashboard, or retry quota. The mail wait stays an unnamed implementation bound. |
| HTTP `result` when a timezone name does not resolve | Closed from the approved design. An unresolved name writes nothing. | Registration and `PATCH /api/account/timezone` return `save_rejected`. They do not use `registration_rejected` or `operation_failed`. |
| The write that sets `series_choices.chosen_instant` after a generated doubled start | Closed from the approved rule that the creator chooses one of the two original instants. | PT-019 implements `POST /api/events/:id/choices` with the civil date and one of those two instants. The session must own the series. Any other instant writes nothing. PT-023 sends that choice. This is not a new product rule. |
| Mail provider and database hosting | The architecture leaves both unselected. The user approved PostgreSQL and the server session, not a host or a provider. | Use a mail double and a PostgreSQL URL supplied to the API and to CI. Add no provider package and no deployment task. |

Also unchanged, and not first-delivery tasks: DEC-013 as a product selection, DEC-014's later count of personal Calendars, and DEC-022 for an account that still belongs to a team. The unique `owner_account_id` constraint is the first-delivery schema. It is not a decision that one personal Calendar is permanent.

## 7. Risks

| Risk | Why it matters | Plan response |
|---|---|---|
| Two approved products share the repository | Personal-time rules in the desktop domain, or the desktop JSON file used as this store, would mix TD-001 and TD-PT-2. | Tasks stay in `apps/api` and `apps/website`. They do not import the desktop domain or touch `team-record.json`. |
| The existing API client uses a bearer token | Using it would replace the approved cookie and hide the shared failure JSON. | PT-023 calls the API with the session cookie and reads the JSON body. |
| CI has no PostgreSQL today | The race suite cannot pass in the current workflow. | PT-024 adds a PostgreSQL service to the existing test job and does not choose a production host. |
| `--passWithNoTests` | An empty suite still exits successfully. | PT-024 removes the flag from `@app/api` and `@app/website` after the tests exist. |
| Mail lock only inside one process | A second API process could miss DEC-082's waiting-start rule. | PT-004 holds the mail lock in PostgreSQL. |
| SQLite used as the shared store | The design allows SQLite only for a single-process test that does not assert lock order. | The API connection for this product is PostgreSQL. Race tests do not run on SQLite. |
| A task fills an open product item | A password rule, proof TTL, session TTL, or performance target would change the PRD. | Section 6 forbids those tasks. |
| Later-delivery tables in the first migration | Search, sharing, and teams would enter the first delivery. | PT-001 creates only the ten first-delivery tables. |

## 8. Deferred deliveries

These are confirmed in the PRD and mapped in `01-technical-requirements.md`. They are not tasks here.

| Later work | Criteria | When |
|---|---|---|
| Search and another person's public Calendar | AC-L01, AC-L02, AC-L03, AC-L12; BR-L1, BR-L2, BR-L3 | After the first delivery |
| Sharing links | AC-L04, AC-L11; BR-L4 | After the first delivery |
| Teams, invitations, and team Calendars | AC-L05 through AC-L11; BR-L5 through BR-L8 | After the first delivery |
| Desktop client of this API | AC-L13 | Last. The desktop shell stays unselected. It adds no separate business store. |

## 9. Acceptance traceability

| Criteria | Tasks |
|---|---|
| AC-P01 | PT-005, PT-006, PT-008, PT-023 |
| AC-P02 | PT-005 |
| AC-P03 | PT-011, PT-023 |
| AC-P04 | PT-012 |
| AC-P05 | PT-012 |
| AC-P06 | PT-012 |
| AC-P07 | PT-012 |
| AC-P08 | PT-014, PT-015 |
| AC-P09 | PT-014 |
| AC-P10 | PT-017, PT-022 |
| AC-P11 | PT-016 |
| AC-P12 | PT-013, PT-017 |
| AC-P13 | PT-014, PT-015 |
| AC-P14 | PT-020 |
| AC-P15 | PT-019 |
| AC-P16 | PT-021 |
| AC-P17 | PT-005 |
| AC-P18 | PT-011, PT-023 |
| AC-P19 | PT-014, PT-015 |
| AC-P20 | PT-014 |
| AC-P21 | PT-018, PT-022 |
| AC-P22 | PT-017 |
| AC-P23 | PT-019 |
| AC-P24 | PT-007, PT-022 |
| AC-P25 | PT-008, PT-023 |
| AC-P26 | PT-009, PT-022, PT-023 |
| AC-P27 | PT-019, PT-020, PT-023. The completion write is `POST /api/events/:id/choices` in PT-019. |
| AC-P28 | PT-016, PT-017 |
| AC-P29 | PT-016 |
| AC-P30 | PT-012 |
| AC-P31 | PT-014 |
| AC-P32 | PT-013, PT-014 |
| AC-P33 | PT-005, PT-010, PT-011 |
| AC-P34 | PT-008, PT-011, PT-023 |
| AC-P35 | PT-012, PT-021, PT-022 |
| AC-P36 | PT-020 |
| AC-P37 | PT-012, PT-014 |
| AC-P38 | PT-018, PT-019 |
| AC-P39 | PT-005, PT-009, PT-010 |
| AC-P40 | PT-013 |
| AC-L01 – AC-L13 | Deferred in section 8. No task. |

## 10. Definition of done

The first delivery is planned completely when all of the following hold:

- PT-001 through PT-024 are finished in the dependency order in section 3, including the parallel splits that section allows.
- AC-P01 through AC-P40 pass by the tests named on their tasks. AC-P27 passes for skips, unchosen generated starts, the completion write in PT-019, the website submission in PT-023, timezone changes, and later series time changes.
- Every race in `07-concurrency-and-consistency.md` passes on PostgreSQL.
- The website test shows the API body and does not calculate a second result.
- `pnpm test`, `pnpm typecheck`, `pnpm lint`, and `pnpm build` pass after PT-024.
- No task has added a password rule, a proof lifetime, a session length, a performance target, a mail provider, a production host, a search route, a sharing route, a team route, or a desktop client.
- `apps/desktop` and `apps/admin` are unchanged by this plan.
- The user approved this implementation plan on 2026-11-25, separately from the Technical Design. Writing application code still requires a separate authorization. Until that authorization, this document remains a plan only.

## 11. Authorization

The user confirmed this plan on 2026-11-25. Implementation is not authorized. That confirmation does not authorize application code, package installation, CI changes, or deployment. Coding starts only when the user says so separately.

## 12. PT-024 command record

Recorded on 2026-11-25 after PT-023. Section 6 stays unresolved. AC-P01 through AC-P40 stay mapped to the tasks in section 9. AC-L01 through AC-L13 have no test in this run.

`apps/api/vitest.config.ts` sets `fileParallelism: false` so the API files shut down their embedded PostgreSQL processes one at a time. The race suite uses `DATABASE_URL` when that variable is set, and the CI test step is the only step that sets it. A local run without that variable uses the embedded server on port 54348.

| Command | Result |
|---|---|
| `pnpm test` | Passed. `@app/api`: 22 files, 85 tests. `@app/website`: 1 file, 8 tests. `@app/desktop`: 8 files, 35 tests. `@app/admin`, `@app/api-client`, and `@app/shared` still use `--passWithNoTests` and had no test files. |
| `pnpm typecheck` | Passed for the six workspace projects that define the script. |
| `pnpm lint` | Passed. Prettier checked source after generated `.next` and `out` directories were absent. |
| `pnpm build` | Passed for `@app/api`, `@app/website`, `@app/desktop`, and `@app/admin`. |
