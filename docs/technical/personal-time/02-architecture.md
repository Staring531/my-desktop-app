# Architecture Baseline: Personal Time Management

- Stage: 2 — Architecture Baseline
- Date: 2026-11-24
- Status: APPROVED by the user on 2026-11-24. This approval does not authorize application code.
- Product authority: `docs/product/06-prd-personal-time.md`, version 0.1, APPROVED (DEC-080)
- Inputs: `docs/technical/personal-time/00-repository-analysis.md`, `docs/technical/personal-time/01-technical-requirements.md`
- This document does not change the PRD and does not replace `docs/technical/02-architecture.md`, which is the approved design for `docs/product/04-prd.md`.

## 1. Architecture style

**TD-PT-1, confirmed by the user on 2026-11-24: the first delivery is the existing Next.js website talking only to the existing NestJS API. The API owns the business rules and the durable record. The browser renders input and results. The desktop shell stays unselected. The admin app stays unused.**

This confirmation does not change DEC-013. The product interview still did not select a framework. The technical design now accepts these two existing applications for the first delivery.

Rationale:

- BR-P1 requires a browser and server-held business data.
- `apps/website` is already a Next.js browser application. `apps/api` is already a NestJS HTTP service. Reusing them avoids a second stack while DEC-013 is still open as a product selection.
- The approved desktop design keeps one local JSON file and must not become this product's store. TD-001 applies only to `docs/product/04-prd.md`.
- The admin app has no approved actor or flow for this PRD. It stays unused.

### Alternatives

| ID | Alternative | Why it is not the recommendation |
|---|---|---|
| ALT-PT-1 | Put the rules in the Electron main process and sync later | The first delivery is a browser, and the server must hold the data before the desktop client exists. |
| ALT-PT-2 | A new service beside NestJS | The repository already has an HTTP API process. A second service adds a boundary the PRD does not require. |
| ALT-PT-3 | Rules only in React components | Rejected writes, races, and logged-out reads would depend on the view. The server must enforce them. |

## 2. Runtime and module boundaries

```text
Browser (Next.js website)
  collects registration, login, Calendar, and Event input
  shows server results, including warnings and previews
        |
        | HTTP, untrusted
        v
API (NestJS)
  sessions, proofs, rules, conflict comparison, transactions
        |
        v
Server store
  accounts, Calendars, Events, absences, proofs, sessions
```

- The website does not import the desktop domain package. That package implements the other PRD.
- The desktop app is not on the first-delivery path. When it is built, it calls this API and does not write `team-record.json` for this product.
- Proof email leaves the API through a delivery port. The port's concrete mail provider stays open.

## 3. Technology recommendation

| Concern | Recommendation | Alternative not recommended for the first delivery |
|---|---|---|
| Browser | Existing Next.js website | A new frontend, or Electron as the first client |
| API | Existing NestJS service | A second HTTP stack |
| Language | TypeScript strict mode already in `tsconfig.base.json` | None |
| Store | One relational database used only by the API, with transactions | The desktop JSON file; a document file on the API host |
| Mail | An interface that can send one proof or report that it cannot send. Provider unset. DEC-082: while it cannot send, every registration and recovery start stores nothing and returns the distinct result. While it can send, ordinary results apply. | Treating a failed send as the ordinary registration or recovery result |
| Desktop | Later client of the same API | Reusing the local team record |

PostgreSQL is the recommended relational database because more than one person uses the server and the PRD requires uniqueness plus all-or-nothing writes. SQLite is acceptable only for a single-process test run, not as the shared store. This recommendation is not a user approval.

## 4. Domain model

The server stores these concepts. Names match the PRD.

- Account: an unverified registration is not a deleted account. Cancellation removes that registration and frees its username and email. A verified account can be deleted. Only completed account deletion retires the username. Email may be registered again and does not inherit deleted Events.
- Session: belongs to one verified account. Logout and completed recovery each end the open sessions they apply to. Recovery ends every open session for that account and does not open a new one.
- Proof: one-time, bound to one registration or one verified account. A later recovery proof invalidates unused earlier recovery proofs. Lifetimes stay open. DEC-081: if the send does not happen, that registration or that recovery start is not stored, no proof remains, and the result is distinct and reveals nothing.
- Calendar: the first delivery has one personal Calendar per verified account. The account stores the current calendar timezone, taken from the browser at registration and changeable later. Later deliveries add team Calendars. An Event is in exactly one Calendar.
- Event: title, location, description, visibility, and a repetition kind fixed at creation. A non-repeating Event stores absolute start and end. A series stores a clock-face template: start, end, and weekday or month date.
- Occurrence facts: a started attached occurrence stores its absolute instant and still receives series text and visibility. An unstarted attached occurrence is computed from the template and the current timezone. An absence stores the original start instant. A detached occurrence is its own Event. A skipped date and an unchosen doubled start stay explicit and are not refilled.
- Later: team, membership, invitation, sharing link, and the former member's retained-Event list.

## 5. Persistence direction

- Account uniqueness, username retirement, and email reuse are database constraints plus the deletion transaction.
- A Calendar read for the first delivery returns data only to the owning session.
- Series expansion, the 90-date conflict window, and the monthly preview use the current timezone and the series template for occurrences that have not started. Started, detached, non-repeating, and chosen instants stay on their stored absolute times. They are not a stored row for every future date.
- Account deletion, verification versus cancellation, a series save versus a later occurrence change, and recovery versus an unfinished save each commit entirely or leave the prior row state.
- The desktop `team-record.json` file is not read or written for this product.

## 6. Traceability

| PRD area | Where this baseline places it |
|---|---|
| BR-P1 through BR-P12 | API rules and server store. Website displays the API result. |
| BR-L1 through BR-L8 | Same API, after the first delivery. Not implemented in the first slice. |
| AC-L13 | A later desktop client of this API. |
| DEC-023, DEC-038 session length, DEC-079 | Remain open. No technical default may invent a password policy, proof lifetime, session length, or performance target. |

## 7. Risks and assumptions

- Assumption: the existing website and API scaffolds can gain this product's routes without taking ownership of the other PRD's local team record. They currently have no business routes.
- Risk: implementing this product inside `apps/desktop/src/domain` would mix two approved product rules. The boundary above forbids that.
- Closed by TD-PT-1: the first delivery uses the existing Next.js website and NestJS API. The desktop shell remains unselected.
- Open: database hosting and mail provider. The user approved PostgreSQL and the server session as part of the complete technical design on 2026-11-24. Hosting and the mail provider remain unselected.
- Closed by DEC-081: a verification or recovery proof that cannot be sent stores nothing for that attempt and shows a distinct result that reveals nothing.

## 8. What this baseline does not design

HTTP routes, tables, and tests are in the detailed design documents `03` through `09`. Implementation planning waits for explicit approval of the complete technical design.
