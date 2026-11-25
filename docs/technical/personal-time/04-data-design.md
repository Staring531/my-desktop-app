# Data Design: Personal Time Management

- Stage: 3 — Detailed Technical Design
- Date: 2026-11-24
- Status: APPROVED by the user on 2026-11-24. PostgreSQL (TD-PT-2) and the session mechanism (TD-PT-3) are included in that approval. This approval does not authorize application code.
- Product authority: `docs/product/06-prd-personal-time.md` and DEC-081

The API is the only application that connects to this database. Tables below are the first delivery. Later-delivery tables are not created in that migration.

## 1. Tables

### `accounts`

| Column | Type | Constraint |
|---|---|---|
| id | uuid | primary key |
| username | text | not null |
| email | text | not null |
| password_hash | text | not null |
| nickname | text | null; stored without outer spaces; null means none |
| timezone | text | not null; IANA name supplied by the browser |
| verified_at | timestamptz | null while unverified |

There is no deleted-account row. Completed deletion removes the account inside the deletion transaction.

Indexes:

- Unique `username` among rows in this table.
- Unique `email` among rows in this table.
- Cancellation deletes the unverified row, so the username and email can be registered again.
- Deletion also deletes the row, after inserting `retired_usernames`. The email can be registered again. The username cannot.

### `retired_usernames`

| Column | Type | Constraint |
|---|---|---|
| username | text | primary key |
| retired_at | timestamptz | not null |

Registration inserts an account only when this table does not contain the username. The check and the insert are in one transaction.

### `sessions`

| Column | Type | Constraint |
|---|---|---|
| id | uuid | primary key |
| account_id | uuid | not null, references accounts, on delete cascade |
| secret_hash | text | not null |
| ended_at | timestamptz | null while open |

No expiry column. DEC-038 sets no lifetime.

### `proofs`

| Column | Type | Constraint |
|---|---|---|
| id | uuid | primary key |
| account_id | uuid | not null, references accounts, on delete cascade |
| purpose | text | `verification` or `recovery` |
| code_hash | text | not null |
| used_at | timestamptz | null until used |
| superseded_at | timestamptz | null until a later recovery proof replaces it |

No lifetime column. DEC-023 sets none. A proof is unusable when it was used, superseded, or its account row is gone. The design does not add a clock expiry.

### `calendars`

| Column | Type | Constraint |
|---|---|---|
| id | uuid | primary key |
| owner_account_id | uuid | not null, unique, references accounts, on delete cascade |
| kind | text | `personal` in the first delivery |

The personal Calendar row is inserted in the same transaction that verifies the account.

### `events`

| Column | Type | Constraint |
|---|---|---|
| id | uuid | primary key |
| calendar_id | uuid | not null, references calendars |
| creator_account_id | uuid | not null, references accounts |
| repetition | text | `none`, `daily`, `weekly`, or `monthly` |
| title | text | not null, non-empty after trim |
| location | text | not null, may be empty |
| description | text | not null, may be empty |
| visibility | text | `public` or `private` |
| start_instant | timestamptz | not null for `none` and for a detached occurrence |
| end_instant | timestamptz | not null when start_instant is set; must be later |
| local_start | time | not null for a series template |
| local_end | time | not null for a series template; represents a later clock time on the occurrence date, or a crossing of midnight only when the resulting interval is positive |
| anchor_date | date | not null for a series; the first civil date |
| weekday | smallint | not null for weekly; the start weekday |
| month_day | smallint | not null for monthly; a date that exists in every month |
| detached_from_event_id | uuid | null, references events; series deletion does not delete this detached row |
| original_start_instant | timestamptz | null, or the identity of a detached occurrence |

Repetition cannot change after insert. The update statement does not include `repetition`. A detached occurrence is inserted with `repetition = none`.

`owner_account_id` is unique because the first delivery has one personal Calendar per account. DEC-014 still leaves a later number of personal Calendars open. A later decision may relax this uniqueness. It is not a decision that the product allows only one forever.

### `series_freezes`

Captured when a timezone change or a series time change commits and an attached occurrence has already started.

| Column | Type | Constraint |
|---|---|---|
| series_event_id | uuid | not null, references events; series deletion deletes these rows and does not delete detached Events |
| original_start_instant | timestamptz | not null |
| start_instant | timestamptz | not null |
| end_instant | timestamptz | not null |
| primary key | | (series_event_id, original_start_instant) |

Text and visibility are not stored here. Reads take them from the series row.

### `series_absences`

| Column | Type | Constraint |
|---|---|---|
| series_event_id | uuid | not null, references events, on delete cascade |
| original_start_instant | timestamptz | not null |
| civil_date | date | not null; the date in the timezone at deletion |
| primary key | | (series_event_id, original_start_instant) |

### `series_skip_rules`

| Column | Type | Constraint |
|---|---|---|
| series_event_id | uuid | not null, references events; series deletion deletes these rows |
| timezone | text | not null |
| local_start | time | not null |
| local_end | time | not null |
| primary key | | (series_event_id, timezone, local_start, local_end) |

A date that any stored rule marks missing stays skipped. Later rules do not remove earlier dates. The read applies the rules inside the requested range.

### `series_choices`

| Column | Type | Constraint |
|---|---|---|
| series_event_id | uuid | not null, references events, on delete cascade |
| civil_date | date | not null |
| earlier_instant | timestamptz | not null |
| later_instant | timestamptz | not null |
| chosen_instant | timestamptz | null until the creator chooses |
| primary key | | (series_event_id, civil_date) |

## 2. Migration and deletion order

- One first migration creates the tables above.
- It does not create team, invitation, link, or search tables.
- It does not read or write `team-record.json`.
- A later migration may add team tables. It must not change the meaning of the columns that already exist. It may relax the one-Calendar uniqueness if a later product decision under DEC-014 says so.
- Account deletion, in one transaction, deletes `series_freezes`, `series_absences`, `series_skip_rules`, and `series_choices` for that account's series, then every Event of that account, then the Calendar, then the account, and inserts `retired_usernames`. Foreign keys do not cascade from a series row onto a detached Event.
- Series deletion, in one transaction, deletes that series' freezes, absences, skip rules, and choices, then the series row. Detached Events remain, including their `detached_from_event_id`.

## 3. What is computed

Unstarted attached occurrences, the 90-date conflict window, and the monthly missing-date preview are computed at request time from the template, the current timezone, freezes, absences, skips, and choices. They are not stored as one row per future date.
