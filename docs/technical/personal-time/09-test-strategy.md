# Test Strategy: Personal Time Management

- Stage: 3 — Detailed Technical Design
- Date: 2026-11-24
- Status: APPROVED by the user on 2026-11-24. This approval does not authorize application code.

Tests assert the API result and the database rows. The website test checks that it shows the API body and does not calculate a second result. The desktop suite for `docs/product/04-prd.md` stays as it is and is not a test of this product.

## 1. First delivery

| Criteria | What the test proves |
|---|---|
| AC-P01, AC-P17, AC-P33, AC-P39 | Registration, verification, unique username, nickname trim and internal spaces. |
| AC-P02, AC-P24, AC-P25, AC-P26 | Shared failure bodies, cancellation versus verification, recovery, session end, unfinished save, later proof, DEC-081, and DEC-082. While mail cannot be sent, a taken username, a retired username, a duplicate email, an unknown email, and an unverified registration all return `send_failed` and write nothing. While mail can be sent, those cases keep the ordinary results, and a proof is sent only for a new registration or a verified recovery. |
| AC-P03, AC-P34 | Another account and a logged-out owner receive no Calendar and no Event. |
| AC-P04, AC-P05, AC-P06, AC-P07, AC-P18, AC-P30, AC-P37 | Valid and invalid Event saves, past Events, public choice, edit, and delete. |
| AC-P08, AC-P09, AC-P19, AC-P20, AC-P31 | Daily, weekly, monthly, rejected monthly preview, and a rejected kind change. |
| AC-P10, AC-P11, AC-P21, AC-P22, AC-P28, AC-P29 | Detach, started instants, absences, series deletion, and text on a started occurrence. |
| AC-P12, AC-P13, AC-P32, AC-P40 | Conflict window, continuation sentence, and the warning fields. |
| AC-P14, AC-P15, AC-P23, AC-P27, AC-P36, AC-P38 | Timezone split, the named America/New_York inputs, skips, and doubled starts. |
| AC-P16, AC-P35 | Deletion transaction and last committed save. |

AC-P09 uses a save date of 2026-01-01 and a month day of 31. AC-P15 uses 2026-03-08 02:30 and 2026-11-01 01:30 in America/New_York. AC-P23 chooses the earlier 01:30 on 2026-11-01.

## 2. Later delivery

AC-L01 through AC-L13 are not first-delivery tests. They are listed in `01-technical-requirements.md` so a later design can add them without treating them as covered now.

## 3. Concurrency

The suite includes the races in `07-concurrency-and-consistency.md`: two saves, save against deletion, recovery against an open transaction, verification against cancellation, series save against a later detachment, registration against username retirement, two recovery starts, and a timezone change against a series save. Each test asserts the committed rows, not a particular interleaving of statements. These race tests run against PostgreSQL. SQLite remains available for single-process cases that do not assert lock order.

## 4. Commands

The existing root scripts `pnpm test`, `pnpm typecheck`, and `pnpm lint` are the commands that will run these tests once implementation is authorized. This design does not add a test run now.
