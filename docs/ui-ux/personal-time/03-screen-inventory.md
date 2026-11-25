# Screen Inventory: Personal Time

- Stage: 1 — Information Architecture, User Flows, and Screen Inventory
- Date: 2026-11-25
- Status: Accepted by the user on 2026-11-25 with the structural baseline. S-01 through S-09 replace the Stage 0 candidates C-01 through C-10. This acceptance is not a wireframe, a visual design, or authorization to write application code.
- No layout, color, type size, or component measurement is specified.
- This file does not replace `docs/ui-ux/03-screen-inventory.md`.

## 1. Surfaces

| ID | Surface | Actor | Entry | Exit | Purpose | States the page can show | Trace |
|---|---|---|---|---|---|---|---|
| S-01 | Register | Person with no session | `/register` | Unverified registration and a way to S-02, or S-01 unchanged | Submit username, email, password, optional nickname, and the browser IANA name | Ready, `ok`, `registration_rejected`, `send_failed`, `operation_failed`, `save_rejected` | F-01. AC-P01, AC-P02, AC-P17, AC-P33, AC-P39 |
| S-02 | Verify | Person with the verification proof | `/verify` | Verified account on the server, then S-04. No session | Submit the proof code | Ready, `ok`, `verification_rejected` | F-02. AC-P01 |
| S-03 | Cancel registration | Person with no session | `/register/cancel` | Registration gone, or unchanged | Submit that registration's email and password | Ready, `ok`, `cancellation_rejected` | F-03. AC-P24 |
| S-04 | Log in | Person with no usable session | `/login` | S-07, or S-04 unchanged | Submit email and password | Ready, `ok`, `login_rejected`, `logged_out` | F-04. AC-P01, AC-P25, AC-P34 |
| S-05 | Start recovery | Person | `/recovery` | The shared start result. No statement that a proof was sent | Submit an email | Ready, `login_rejected`, `send_failed`, `operation_failed` | F-05. AC-P26, AC-P39 |
| S-06 | Complete recovery | Person with a recovery proof | `/recovery/complete` | On `ok`, S-04 opens and S-07 does not. On `recovery_rejected`, nothing changes | Submit email, new password, and proof | Ready, `ok`, `recovery_rejected` | F-05. AC-P26 |
| S-07 | Own Calendar | Verified owner in this session | `/calendar` after login, or a return from S-08 or S-09 | S-08, S-09, or `logged_out` | Show one `from`/`to` body, visibility, skipped dates, and a required choice | Owner body, empty range, `choice_required`, `skipped`, `logged_out`, no Calendar and no Event | F-06, F-09. AC-P03, AC-P07, AC-P14, AC-P18, AC-P27, AC-P34, AC-P36, AC-P38 |
| S-08 | Event | Owner | `/events/new` or `/events/:id` from S-07 | S-07 after the person follows Calendar from a visible `ok`, or after cancel. `ok` stays on S-08 until that return. Prior Event if the save or delete does not commit | Create or edit, detach one occurrence, delete one occurrence, or delete the Event | Pristine, editing, confirming delete, `ok` with `conflicts` and optional `continuesAfterWindow`, `save_rejected` with optional preview, `not_found`, `account_gone`, `logged_out` | F-07, F-08. AC-P04 through AC-P13, AC-P15, AC-P19 through AC-P23, AC-P28 through AC-P32, AC-P35, AC-P37, AC-P40 |
| S-09 | Account | Owner | `/account` from S-07 or S-08 | S-07 after a nickname or timezone result. Unsigned pages after logout or a committed deletion | Change nickname, change timezone, log out, delete the account | Ready, nickname stored or cleared, `save_rejected`, confirming delete, deleted, `logged_out` | F-04, F-09, F-10, F-11. AC-P14, AC-P16, AC-P33, AC-P36, AC-P39 |

S-07's generated choice and S-08's one-occurrence actions are states of those surfaces. They are not extra screens.

S-04 also shows `logged_out` when a guarded destination was opened without a usable session. That destination does not show Calendar or Event fields from a previous body.

The confirming step for deletion is a state of S-08 or S-09. Cancel sends no request.

## 2. Commands each surface may send

| Surface | May send | Must not send |
|---|---|---|
| S-01 | `POST /api/registrations` | A chosen timezone, a proof, a session |
| S-02 | `POST /api/registrations/verify` with the proof code | Email, password, or a session |
| S-03 | `POST /api/registrations/cancel` | A session, or a verified-account deletion |
| S-04 | `POST /api/sessions` | A proof |
| S-05 | `POST /api/recoveries` | A new password or a proof |
| S-06 | `POST /api/recoveries/complete` | A session cookie. The response does not create one |
| S-07 | `GET /api/calendar?from=&to=` and `POST /api/events/:id/choices` with one returned instant | A computed instant, overlap, or preview. A search, share, team, or other-calendar request |
| S-08 | Event save, detach, occurrence delete, Event delete | A repetition change. A third instant for an entered doubled time. A delete before the confirming step |
| S-09 | `PATCH /api/account`, `PATCH /api/account/timezone`, `DELETE /api/sessions/current`, `DELETE /api/account` | An email change, a session length, a delete before the confirming step |

## 3. Acceptance criteria with no surface of their own

| Criteria | Where the behavior is visible | Why there is no extra screen |
|---|---|---|
| AC-P35 | S-08 shows the body of the save it sent | The last committed save is decided by the API |
| AC-P26 unfinished save | S-08 shows the prior Event if that save wrote nothing | Recovery completion is F-05. The race is not a page |
| AC-L01 – AC-L13 | Nowhere in the first delivery | Later deliveries. No destination |

## 4. Not in this inventory

| Item | Disposition |
|---|---|
| C-01 through C-10 from Stage 0 | Replaced by S-01 through S-09. The same approved forms remain. Unsigned forms stay separate. Calendar, Event, and account are grouped as above. |
| Search, public Calendar of another person, sharing link, team, desktop client | No surface. |
| Mail message | Not a screen. Q-02 stays open. |
| Product title | Not chosen. Q-03 stays open. |
| Initial calendar range | Not chosen. Q-04 stays open. S-07 still requires an explicit range. |
| Visual system, tokens, wireframes | Later stages. PT-023 remains unchanged. |

## 5. Trace from the PRD flows

| PRD flow | Flows here | Screens |
|---|---|---|
| Register and log in | F-01, F-02, F-03, F-04, F-05, F-10 | S-01 through S-06, S-09 |
| See own visibility | F-06, F-08 | S-07, S-08 |
| Personal Calendar privacy | F-04, F-06 | S-04, S-07 |
| Save an Event | F-07 | S-08, then S-07 |
| Repeat and series edits | F-07, F-08 | S-08, S-07 |
| Conflict warning | F-07 | S-08 |
| Timezone | F-07, F-09 | S-07, S-08, S-09 |
| Delete the account | F-11 | S-09 |
