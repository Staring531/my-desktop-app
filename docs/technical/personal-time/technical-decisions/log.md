# Technical Decision Log: Personal Time Management

- Date: 2026-11-24
- Status: APPROVED. The user approved the complete personal-time technical design on 2026-11-24, including TD-PT-1 through TD-PT-3. TD-PT-1 was confirmed earlier the same day. TD-PT-2 and TD-PT-3 were recommendations included in that approval. This approval does not authorize application code.
- This log does not replace `docs/technical/technical-decisions/log.md`, which belongs to `docs/product/04-prd.md`.

## TD-PT-1 — Next.js website and NestJS API

- **Status:** Confirmed by the user on 2026-11-24 (architecture finding TDR-PT-005, option A)
- **Decision:** The first delivery uses `apps/website` (Next.js) as the browser and `apps/api` (NestJS) as the only writer of this product's business data. The admin app is unused. The desktop shell stays unselected until the desktop delivery.
- **Alternative rejected:** A new web or server stack, or a framework-neutral detailed design that delays the module boundary.
- **Consequence:** DEC-013 is unchanged. The product interview did not select the framework. This technical design accepts the two existing applications. The desktop app must not use `team-record.json` for this product.

## TD-PT-2 — PostgreSQL owned by the API

- **Status:** Approved with the complete technical design on 2026-11-24. Not a separate earlier approval.
- **Decision:** The API stores this product in one PostgreSQL database. A user operation commits in one transaction or leaves the prior rows. SQLite may be used only for a single-process test run.
- **Alternative not selected:** The desktop JSON file, or a document file on the API host.
- **Consequence:** Uniqueness, username retirement, and the all-or-nothing operations in the PRD are database constraints and transactions. Hosting remains open.

## TD-PT-3 — Server session without a chosen lifetime

- **Status:** Approved with the complete technical design on 2026-11-24. Not a separate earlier approval.
- **Decision:** A login creates a server session row. The browser receives an HttpOnly session cookie with no expiry attribute. The server does not assign a duration. Logout, completed recovery, and completed account deletion end the applicable sessions. A request with an ended or unknown session is logged out.
- **Alternative not selected:** A fixed lifetime. DEC-038 does not set one, and this design does not invent one.
- **Consequence:** A browser may keep the cookie until it discards session cookies. That is not a product lifetime. Recovery still ends every open server session.
