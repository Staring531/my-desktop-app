-- First personal-time migration. Ten product tables. No team, invitation, link, or search table.
-- detached_from_event_id is checked when written. Deleting the series row does not
-- cascade to the detached Event and does not clear that column. A restrictive foreign
-- key would block the approved series-deletion order, which removes the series row
-- and keeps the detached Event's detached_from_event_id.

CREATE TABLE accounts (
  id uuid PRIMARY KEY,
  username text NOT NULL,
  email text NOT NULL,
  password_hash text NOT NULL,
  nickname text,
  timezone text NOT NULL,
  verified_at timestamptz,
  CONSTRAINT accounts_username_unique UNIQUE (username),
  CONSTRAINT accounts_email_unique UNIQUE (email)
);

CREATE TABLE retired_usernames (
  username text PRIMARY KEY,
  retired_at timestamptz NOT NULL
);

CREATE TABLE sessions (
  id uuid PRIMARY KEY,
  account_id uuid NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  secret_hash text NOT NULL,
  ended_at timestamptz
);

CREATE TABLE proofs (
  id uuid PRIMARY KEY,
  account_id uuid NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  purpose text NOT NULL,
  code_hash text NOT NULL,
  used_at timestamptz,
  superseded_at timestamptz,
  CONSTRAINT proofs_purpose_check CHECK (purpose IN ('verification', 'recovery'))
);

CREATE TABLE calendars (
  id uuid PRIMARY KEY,
  owner_account_id uuid NOT NULL UNIQUE REFERENCES accounts (id) ON DELETE CASCADE,
  kind text NOT NULL,
  CONSTRAINT calendars_kind_check CHECK (kind IN ('personal'))
);

CREATE TABLE events (
  id uuid PRIMARY KEY,
  calendar_id uuid NOT NULL REFERENCES calendars (id),
  creator_account_id uuid NOT NULL REFERENCES accounts (id),
  repetition text NOT NULL,
  title text NOT NULL,
  location text NOT NULL,
  description text NOT NULL,
  visibility text NOT NULL,
  start_instant timestamptz,
  end_instant timestamptz,
  local_start time,
  local_end time,
  anchor_date date,
  weekday smallint,
  month_day smallint,
  detached_from_event_id uuid,
  original_start_instant timestamptz,
  CONSTRAINT events_title_not_blank CHECK (char_length(btrim(title)) > 0),
  CONSTRAINT events_visibility_check CHECK (visibility IN ('public', 'private')),
  CONSTRAINT events_repetition_check CHECK (repetition IN ('none', 'daily', 'weekly', 'monthly')),
  CONSTRAINT events_shape_check CHECK (
    (
      repetition = 'none'
      AND start_instant IS NOT NULL
      AND end_instant IS NOT NULL
      AND end_instant > start_instant
      AND local_start IS NULL
      AND local_end IS NULL
      AND anchor_date IS NULL
      AND weekday IS NULL
      AND month_day IS NULL
    )
    OR (
      repetition = 'daily'
      AND start_instant IS NULL
      AND end_instant IS NULL
      AND local_start IS NOT NULL
      AND local_end IS NOT NULL
      AND local_start <> local_end
      AND anchor_date IS NOT NULL
      AND weekday IS NULL
      AND month_day IS NULL
      AND detached_from_event_id IS NULL
      AND original_start_instant IS NULL
    )
    OR (
      repetition = 'weekly'
      AND start_instant IS NULL
      AND end_instant IS NULL
      AND local_start IS NOT NULL
      AND local_end IS NOT NULL
      AND local_start <> local_end
      AND anchor_date IS NOT NULL
      AND weekday IS NOT NULL
      AND month_day IS NULL
      AND detached_from_event_id IS NULL
      AND original_start_instant IS NULL
    )
    OR (
      repetition = 'monthly'
      AND start_instant IS NULL
      AND end_instant IS NULL
      AND local_start IS NOT NULL
      AND local_end IS NOT NULL
      AND local_start <> local_end
      AND anchor_date IS NOT NULL
      AND weekday IS NULL
      AND month_day BETWEEN 1 AND 28
      AND detached_from_event_id IS NULL
      AND original_start_instant IS NULL
    )
  )
);

CREATE FUNCTION events_require_detached_series() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.detached_from_event_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM events WHERE id = NEW.detached_from_event_id) THEN
    RAISE EXCEPTION 'detached_from_event_id does not reference an event'
      USING ERRCODE = 'foreign_key_violation';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER events_detached_from_event
  BEFORE INSERT OR UPDATE OF detached_from_event_id ON events
  FOR EACH ROW
  EXECUTE FUNCTION events_require_detached_series();

CREATE TABLE series_freezes (
  series_event_id uuid NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  original_start_instant timestamptz NOT NULL,
  start_instant timestamptz NOT NULL,
  end_instant timestamptz NOT NULL,
  PRIMARY KEY (series_event_id, original_start_instant)
);

CREATE TABLE series_absences (
  series_event_id uuid NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  original_start_instant timestamptz NOT NULL,
  civil_date date NOT NULL,
  PRIMARY KEY (series_event_id, original_start_instant)
);

CREATE TABLE series_skip_rules (
  series_event_id uuid NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  timezone text NOT NULL,
  local_start time NOT NULL,
  local_end time NOT NULL,
  PRIMARY KEY (series_event_id, timezone, local_start, local_end)
);

CREATE TABLE series_choices (
  series_event_id uuid NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  civil_date date NOT NULL,
  earlier_instant timestamptz NOT NULL,
  later_instant timestamptz NOT NULL,
  chosen_instant timestamptz,
  PRIMARY KEY (series_event_id, civil_date)
);
