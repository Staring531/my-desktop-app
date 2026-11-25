-- Shared mail-lock counter. A rejected proof message increments it so every API
-- process waiting on the PostgreSQL advisory lock returns send_failed. The next
-- attempt reads the new count and asks the port again.

CREATE TABLE mail_gate (
  id integer PRIMARY KEY,
  rejection_count bigint NOT NULL
);

INSERT INTO mail_gate (id, rejection_count) VALUES (1, 0);
