# UI/UX Design Requirements — Personal Time, Stage 0 Readiness

- Stage: 0 — Readiness Analysis
- Date: 2026-11-25
- Status: The user continued to Stage 1 on 2026-11-25 and accepted that structural baseline the same day. This inspection does not approve wireframes, visual direction, tokens, or interaction specifications. It does not authorize application code. The accepted baseline is `01-information-architecture.md`, `02-user-flows.md`, and `03-screen-inventory.md`. Q-02, Q-03, and Q-04 stay open.
- Product authority: `docs/product/06-prd-personal-time.md`, version 0.1, APPROVED (DEC-080, 2026-11-24)
- Design authority: `docs/technical/personal-time/01-technical-requirements.md` through `09-test-strategy.md` and `docs/technical/personal-time/technical-decisions/log.md`, APPROVED by the user on 2026-11-24, including TD-PT-1, TD-PT-2, and TD-PT-3
- Plan authority: `docs/technical/personal-time/10-implementation-plan.md`, APPROVED by the user on 2026-11-25. That approval does not authorize application code.
- This file does not replace `docs/ui-ux/00-design-requirements.md`, which belongs to `docs/product/04-prd.md`.

## 1. What this stage is

This is an inspection of the repository and the approved personal-time baseline. It records candidate surfaces and an initial trace. Those candidates are proposals. They are not a structural baseline.

`docs/process/UI_UX_DESIGN.md` section 2 still describes the earlier desktop product: one local team record, and no website, login, or email verification. This stage follows the later personal-time approval. TD-PT-1 makes the first delivery the existing Next.js website talking only to the existing NestJS API. Registration, verification, recovery, and the personal Calendar are in that approved scope. The desktop UI package stays the design for the other PRD.

No visual direction is chosen here. No token value is proposed. No application file is changed. The Implementation Plan is not edited.

## 2. Approval check

| Input | Status | What it allows this stage to use |
|---|---|---|
| Personal-time PRD | APPROVED, version 0.1, DEC-080 | First-delivery behavior in sections 2 through 8. AC-L01 through AC-L13 stay out of this UI. |
| Technical design | APPROVED, 2026-11-24 | The website sends JSON and renders the API body. It does not recompute instants, overlap, a monthly preview, or a proof result. |
| Implementation plan | APPROVED, 2026-11-25 | PT-023 is the only first-delivery website task. It waits until the matching API route exists. Calendar and Event forms wait for PT-020. PT-023 does not establish a visual system. |
| Desktop UI package | Accepted for the other product on 2026-11-20 | Not a source of personal-time screens, copy, or tokens. |

DEC-013 remains an open product selection. TD-PT-1 accepts the existing website and API for this delivery only.

## 3. Repository evidence

`apps/website` is a Next.js 15 App Router application. It depends on `next`, `react`, and `react-dom`. It has no CSS file, no font file, no icon set, no component module, and no test file.

| Evidence | What is present |
|---|---|
| `apps/website/app/layout.tsx` | Sets `lang="en"`. The document title is `My Desktop App`. The description is `Official website for My Desktop App.` The body renders `children` and nothing else. |
| `apps/website/app/page.tsx` | One route, `/`. A `main` contains an `h1` and one sentence: `The public website scaffold is ready for product content.` |
| `apps/website/package.json` | `dev` and `start` use port 3000. `test` is `vitest run --passWithNoTests`. `lint` is Prettier. There is no style, accessibility, or browser-test script. |
| Styles and assets | No stylesheet, font, image, or icon is stored under `apps/website`. |
| Navigation | No link, router call, or second page exists. |
| Reusable website components | None. |
| UI tests | None. A run of the current test script is not evidence that a personal-time page is correct. |

`apps/desktop/src/renderer/src/styles.css` defines semantic tokens for the other product. `apps/admin` has no personal-time page. `packages/api-client` sends a bearer token and drops the JSON body on a non-2xx status. The approved plan says the personal-time website uses the session cookie and reads the shared JSON `result`. It does not adopt that bearer client.

The browser window has no approved width, breakpoint, or desktop-shell constraint. This stage does not add a mobile layout, a theme switch, or a dark theme.

## 4. Constraints the later design must keep

- The first delivery is one verified person's Calendar in the browser. Search, another person's Calendar, sharing links, teams, and the desktop client are later deliveries. They get no page, link, or control in this UI.
- The API decides validity. The page shows `result` and the fields the API returned. It does not calculate a second overlap, preview, instant, or proof outcome.
- Shared failures stay shared. Registration, verification, cancellation, login, and recovery must not say which field was taken, whether an account exists, or whether it is verified.
- A failure body shows no email address, password, proof code, provider text, or stack trace.
- A new Event is private unless the person chooses public before the save. The owner can tell public from private on the Calendar.
- Repetition is chosen at creation and is not a later control that changes the stored kind.
- There is no date-only Event, no reminder, no all-day Event, and no control that stops future repeats while keeping series history.
- Nickname trim and display name follow the PRD. The page does not invent a second display rule.
- Timezone entry sends an IANA name from the browser at registration, and the name the person selects later. The page does not recompute occurrence instants.
- A `choice_required` occurrence offers the two instants in the API body. The page submits one of those instants and the civil date. It does not invent a third instant.
- A skipped date is not shown as a cancelled Event. An absent occurrence is not shown as a cancelled Event.
- Conflict entries show title, start, and end only. A series save can also show that repetition continues after the window. That sentence is not a conflict.
- Account deletion, occurrence deletion, and series deletion leave the prior state when the person cancels or the operation does not finish.
- No password rule, proof lifetime, session length, performance target, mail provider, or production host is designed into the page.
- DEC-079 sets no accessibility standard. Existing markup has a language and one `main`. That is not an approved accessibility target.

## 5. Candidate surfaces

These are proposals for Stage 1. They follow the forms named in `05-application-design.md` section 4 and the routes in section 1. URLs, page grouping, and navigation are not decided.

| Candidate | Approved inputs | What the page may show from the API | Not on this surface |
|---|---|---|---|
| C-01 Register | Username, email, password, optional nickname, browser IANA timezone | `ok`, `registration_rejected`, `send_failed`, `operation_failed` | A statement that a username or email is taken |
| C-02 Verify | The proof code the person submits | `ok`, `verification_rejected` | A session. Verification does not log the person in by itself in the route table; login is a separate route |
| C-03 Cancel registration | Email and password, without a session | `ok`, `cancellation_rejected` | A control that deletes a verified account |
| C-04 Log in | Email and password | `ok` opens that person's Calendar. `login_rejected` and `logged_out` show no Calendar and no Event | A different message for unknown, unverified, and wrong password |
| C-05 Start recovery | Email | The same visible result as a failed login while mail can send: `login_rejected`. `send_failed` when mail cannot send | A statement that a proof was sent |
| C-06 Complete recovery | Email, new password, proof | `ok` does not open the Calendar. `recovery_rejected` | A new session cookie |
| C-07 Own Calendar | Session cookie. `from` and `to` are civil dates | Display name, public and private, `scheduled`, `skipped`, `choice_required` and its two instants | Another person's Calendar, search, a sharing link, a team |
| C-08 Event save | Title, start, end, optional location and description, visibility, repetition at creation | `ok` with `conflicts` and, for a series, `continuesAfterWindow`. `save_rejected`, including `monthTypes` and `missingDates` when the month date is rejected | A kind change on a stored Event. A date-only save |
| C-09 One occurrence | Original start instant and the submitted content for a detachment. Original start instant for a deletion | The API body after detach or occurrence delete | A cancelled-Event row |
| C-10 Account | Nickname, IANA timezone, delete account, log out | Nickname and timezone results. Logout ends that session. Deletion removes the login only when the API says it committed | An email-change field. A session-length control |

C-02 records a route fact, not a decision that verification and login are separate screens. Stage 1 can place more than one candidate on one page if the approved behavior stays intact.

## 6. Initial trace

The page column names the candidate that can show the API result. Several criteria are also true only in stored rows. The website test does not recompute those rows.

| Criteria | Candidate | What the page is limited to |
|---|---|---|
| AC-P01 | C-01, C-02, C-04 | Submit registration and proof. Show the shared failure. After a later login, show that person's Calendar. |
| AC-P02, AC-P17 | C-01 | Show one shared `registration_rejected`. Do not explain which value was taken. |
| AC-P03, AC-P34 | C-04, C-07 | Another account and a logged-out request show no Calendar and no Event. |
| AC-P04, AC-P05, AC-P06, AC-P07, AC-P37 | C-08, C-07 | Show the stored title, private default, public choice, clock times, and a past Event when the API returns them. An invalid save shows `save_rejected` and the previous Event. |
| AC-P08, AC-P19, AC-P20 | C-08, C-07 | Show the occurrences the API returns. Do not expand the series in the browser. |
| AC-P09 | C-08 | Show `monthTypes` and `missingDates` from the rejection body. |
| AC-P10, AC-P11, AC-P21, AC-P22, AC-P28, AC-P29, AC-P31 | C-08, C-09, C-07 | Show the returned occurrence. A rejected kind change shows `save_rejected` and leaves the previous kind on screen only because the API left it unchanged. |
| AC-P12, AC-P13, AC-P32, AC-P40 | C-08 | Show `title`, `start`, and `end` from `conflicts`. Show the continuation sentence only when `continuesAfterWindow` is true. Show no email. |
| AC-P14, AC-P15, AC-P23, AC-P27, AC-P36, AC-P38 | C-07, C-08, C-10 | Show skipped, choice, and clock labels from the body. Submit one listed instant for a generated doubled start. An unresolved timezone shows `save_rejected`. |
| AC-P16 | C-10 | Show the deletion result. Do not offer a partial delete. |
| AC-P18 | C-07 | The owner can tell public from private. |
| AC-P24 | C-03 | Show one shared `cancellation_rejected` for the three non-cancelling cases. |
| AC-P25, AC-P39 | C-04, C-05 | Login and recovery start share the failure result the API returns. A shown nickname keeps its internal spaces because the API stored them. |
| AC-P26 | C-05, C-06, C-07 | Completion does not open the Calendar. A later login does. An ended session next shows `logged_out` with no Calendar and no Event. |
| AC-P30 | C-08, C-09, C-07 | Show the new non-repeating content after a successful edit. A cancelled delete leaves the Event on screen. |
| AC-P33 | C-10, C-07 | Show the display name the API returns after a nickname save. |
| AC-P35 | C-08 | Show the body of the save this page submitted. The last committed save is an API result, not a second page calculation. |
| AC-L01 – AC-L13 | None | No first-delivery surface. |

## 7. Reusable assets

| Asset | Disposition for this UI |
|---|---|
| Website scaffold page and title | Present, and not personal-time content. Later design replaces the visible scaffold only when a screen specification says so. |
| Website components, tokens, fonts, icons | None to reuse. |
| Desktop `styles.css` and the accepted desktop components | Belong to `docs/product/04-prd.md`. They are not the personal-time component system. |
| `packages/api-client` bearer behavior | Do not use it for this product. |
| Approved personal-time result strings | The visible failure and success vocabulary is the `result` value plus the fields documented in `08-error-handling-and-observability.md`. |

## 8. Plan dependency

PT-023 builds the forms and tests that stub the API body. It explicitly does not establish a visual system. Presentation stays with this UI/UX stage.

This readiness review does not add a task and does not change PT-023. If a later approved design needs implementation work beyond the forms PT-023 already names, that delta is presented at the UI/UX readiness gate. It is not applied here.

## 9. Risks

| Risk | Why it matters | What this stage does |
|---|---|---|
| Two approved UI packages in one `docs/ui-ux` tree | Editing the desktop files would change an accepted design. | Personal-time documents live under `docs/ui-ux/personal-time/`. |
| The generic UI workflow forbids a website and login | Following that sentence would omit the approved personal-time MVP. | This file follows the personal-time PRD and TD-PT-1, and says so. |
| A page explains a shared failure | The PRD requires those failures to look the same. | Section 4 forbids that explanation. |
| The page calculates time or overlap | The technical design assigns that calculation to the API. | Section 4 forbids a second calculation. |
| PT-023 and the visual system diverge | The plan says presentation is later UI/UX work. | No plan edit in this stage. A delta waits for an approved design. |
| Scaffold copy ships as the product | The only page still says `My Desktop App`. | Recorded. Not restyled in this stage. |

## 10. Open questions

These are not answered by this analysis.

| ID | Question | Why it is open |
|---|---|---|
| Q-01 | Which candidates share a page, and what the browser paths are | The approved design names forms and routes. It does not name pages or paths. Stage 1 proposes them. |
| Q-02 | Whether the mail message is a code the person types or an address the person opens | The API accepts a proof code. No mail template is approved. The page can still submit a code. The message itself is not designed here. |
| Q-03 | What product title replaces `My Desktop App` | The PRD does not set a product title. This stage does not invent one. |

## 11. Review stop

The user accepted S-01 through S-09 on 2026-11-25. Those screens replace C-01 through C-10 as the structural baseline. This record does not choose a visual direction.
