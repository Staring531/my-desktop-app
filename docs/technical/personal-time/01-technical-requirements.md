# Technical Requirements: Personal Time Management

- Stage: 1 — Technical Requirements Baseline
- Date: 2026-11-24
- Status: APPROVED by the user on 2026-11-24. This approval does not authorize application code.
- Product authority: `docs/product/06-prd-personal-time.md`, version 0.1, APPROVED (DEC-080)
- Input: `docs/technical/personal-time/00-repository-analysis.md`
- This document does not change the PRD and does not replace `docs/technical/01-technical-requirements.md`, which belongs to `docs/product/04-prd.md`.

No framework, database, session store, or mail transport is selected here. Names below are responsibility boundaries, not package choices.

## 1. Boundaries

| Boundary | Responsibility | Delivery |
|---|---|---|
| Browser client | Collects input, shows the owner's Calendar, and displays results the server returns. It does not decide permissions or conflict results. | First |
| Server | Holds the business data. Applies every confirmed rule. Accepts a write only when it finishes entirely. | First |
| Proof delivery | Sends a one-time verification proof to the registration email and a one-time recovery proof to a verified account's email. Sends nothing for an unknown or unverified recovery start. | First. Transport is open. |
| Later read surfaces | Search, another person's public Calendar, and sharing links. | After the first delivery |
| Team boundary | Teams, invitations, membership, and team Calendars. | After the first delivery |
| Desktop client | Uses the same server, identity, rules, and data. Adds no separate rules. | Last |

The existing Electron local JSON store, NestJS health check, and Next.js scaffold are repository facts. They are not a selection for this product. DEC-013 leaves the web framework, server framework, and desktop shell unselected.

## 2. Traceability

| Requirement | Criteria | Technical capability | Data and interface | Verification |
|---|---|---|---|---|
| BR-P1 | AC-L13 is later | A browser reaches one server that holds the business data. The first delivery does not depend on the desktop client. | Account, Calendar, and Event records live on the server. | A first-delivery test runs without the desktop app. |
| BR-P2 | AC-P03, AC-P34 | The server refuses another logged-in user and every logged-out person, including the owner after logout, from opening a personal Calendar or reading its Events. Login restores the owner's view. | Every personal Calendar read checks the current session. | Two accounts and one logged-out request. |
| BR-P3 | AC-P01, AC-P17, AC-P33, AC-P39 | Username is unique and never changes. Nickname is optional. Outer whitespace is removed before storage. An all-space nickname is stored as none. Internal spaces remain. Display name updates immediately and a public Event shows it without another Event save. | Username uniqueness is enforced by the stored record. Nickname is stored already trimmed. | The AC-P33 and AC-P39 nickname cases. |
| BR-P4, DEC-077, DEC-081 | AC-P01, AC-P02, AC-P24, AC-P25, AC-P26, AC-P39 | Registration stores an unverified account and sends one proof only to that email while mail can be sent. DEC-081 and DEC-082: while mail cannot be sent, every registration returns the distinct send-failure result, stores nothing, and leaves no proof, including a taken username. The person may try again. The result does not reveal whether a registration exists. A matching proof verifies it. A mismatched, expired, or reused proof fails without revealing whether a registration exists. Taken username, unverified email, and verified email share one registration failure. Cancellation uses email and password, reveals nothing on failure, and races with verification by which one finishes last. Login with a verified email and correct password opens the Calendar. Unknown email, unverified registration, and wrong password share one failure. Recovery start shows that same failure for every email and sends a proof only for a verified account while mail can be sent. DEC-082: while mail cannot be sent, every recovery start returns the same distinct send-failure result and stores nothing. Completion needs the new password and a matching one-time proof. A later proof invalidates unused earlier proofs. Completion ends open sessions, does not open the Calendar, and discards a save that has not finished. A save that finished before recovery is kept. | Proofs are single-use server records bound to one registration or account. Sessions are server-side and can all be ended. Password replacement invalidates the previous password. Lifetime of either proof stays open in DEC-023. | The registration, login, cancellation, and recovery criteria, including the same failure result for an unknown recovery start and a failed login. |
| BR-P5, BR-P6, BR-P7, DEC-034 | AC-P04, AC-P05, AC-P06, AC-P07, AC-P18, AC-P30, AC-P37 | A save requires a trimmed non-empty title, a start, and a later end. No date-only Event is stored. A new Event is private unless the creator chooses public. Changing one occurrence's visibility detaches it. Invalid and cancelled saves write nothing. A successful non-repeating edit replaces the stored content. A successful deletion removes it from later conflict comparison. Past, in-progress, and future Events may be stored. The owner can distinguish public from private. | Event stores title, start, end, optional location and description, visibility, and repetition kind. | AC-P04 through AC-P07, AC-P18, AC-P30, and AC-P37. |
| BR-P8, DEC-035, DEC-065 | AC-P08, AC-P09, AC-P19, AC-P20, AC-P31 | Daily, weekly, and monthly series do not end automatically. Weekly uses only the start weekday. Monthly requires a date that exists in every month. Repetition kind is fixed at creation. A monthly date that does not exist in every month writes nothing. The preview names month types and lists concrete missing dates only inside 90 calendar dates from the save date. | The stored series keeps its original kind. The preview is computed and is not a stored list of every future month. | AC-P08, AC-P09, AC-P19, AC-P20, and AC-P31. |
| BR-P9, DEC-050, DEC-052, DEC-067, DEC-068, DEC-074 | AC-P10, AC-P11, AC-P21, AC-P22, AC-P28, AC-P29 | One modified occurrence detaches and keeps the content submitted with that detachment. Series edits do not change it. One series save applies time only to attached occurrences that have not started. The same save applies title, location, description, and visibility to every occurrence still attached, including one that has started. A deleted occurrence stays absent by its original start instant. A later clock-time change does not refill that daily, weekly, or monthly date. A weekday change does not move the absence. Timezone re-expansion moves only attached occurrences that have not started. An occurrence has started when its start is reached. The last finished operation wins between a series save and a later deletion or detachment. Deleting the series removes attached occurrences and absences and keeps detached occurrences. | Absence records store the original start instant. Detached occurrences are separate owned Events with their own text, time, and visibility. Started attached occurrences keep their instants while receiving series text and visibility. | AC-P10, AC-P11, AC-P21, AC-P22, AC-P28, and AC-P29. |
| BR-P10, DEC-053, DEC-058, DEC-078 | AC-P12, AC-P13, AC-P32, AC-P40 | Compare the creator's other owned Events across 90 calendar dates in the creator's timezone, starting on the save date and including it. Include past and in-progress overlaps inside that window and a partial overlap at the far edge. Exclude the Event's own attached occurrences. Include a detached occurrence. Overlap means a shared positive length. The warning lists title, start, and end, omits email, and does not block the save. A series save says the repetition continues after 90 days even when nothing overlaps. That sentence is not a conflict warning. | Comparison uses stored absolute intervals expanded in the creator's current timezone. | AC-P12, AC-P13, AC-P32, and AC-P40. |
| BR-P11, DEC-018, DEC-027, DEC-028, DEC-057, DEC-069, DEC-070, DEC-071 | AC-P14, AC-P15, AC-P23, AC-P27, AC-P36, AC-P38 | Store a series template as clock-face start, end, and weekday or month date. Store absolute instants for a non-repeating Event, a started attached occurrence, a chosen doubled start, and a detached occurrence. Those instants stay fixed when the timezone changes. A not-yet-started attached occurrence is expanded again at the template's clock time in the new timezone. An entered missing local time cannot be saved. An entered doubled local time must be chosen. A generated missing start, missing end, or gap across a missing hour skips that occurrence and keeps the series. A skipped date stays skipped after a timezone change and after a series time change. An unchosen doubled start stays unchosen and out of conflict comparison, and still offers the two original absolute instants. | The account stores the current calendar timezone, taken from the browser at registration and changeable later. The series template stores the clock face used to re-expand unstarted occurrences. Fixed occurrences store absolute start and end. Skips and unchosen starts are explicit records. | AC-P14, AC-P15, AC-P23, AC-P27, AC-P36, and AC-P38, including the named America/New_York examples. |
| BR-P12, DEC-039, DEC-050 | AC-P16, AC-P35 | Account deletion removes login, personal Calendar, and its Events together, or leaves all three. The username is retired only when deletion completes. The email may be registered again and does not receive the deleted Events. Two successful saves leave the content of the save that finishes last. A save that finishes after completed deletion writes nothing. | Deletion is one server transaction. Username retirement survives the new account. | AC-P16 and AC-P35. |
| BR-L1, BR-L2, BR-L3 | AC-L01, AC-L02, AC-L03, AC-L12 | Logged-in whole-value username and nickname search. No email. Empty and no-match return nobody and do not distinguish a retired username. A deleted username and old link open nothing for logged-in and logged-out visitors. A public Event shows title, time, location, description, username, and current nickname in the viewer's timezone. A private Event is hidden. | Search reads current stored nickname and username. Public reads do not include email. | Later-delivery tests only. |
| BR-L4 | AC-L04, AC-L11 | A sharing link is an address for one Calendar. Revoking one link leaves the Calendar and the other links. The five ended-link cases open no Calendar and show no Event. | Link records are separate from Calendar records. | Later-delivery tests only. |
| BR-L5, BR-L6, BR-L7, BR-L8, DEC-020 | AC-L05, AC-L06, AC-L07, AC-L08, AC-L09, AC-L10, AC-L11 | One team has one Calendar. The creator is the only administrator while a member. Invitations are accepted only by the invited logged-in verified account. Leaving, removal, and dissolution follow the PRD, including the retained-Event list and all-or-nothing transitions. Conflict comparison includes team Events the creator still owns and is shown only to that creator. | An Event stays in exactly one Calendar. A halfway transition leaves the prior state. | Later-delivery tests only. |
| DEC-013 desktop | AC-L13 | The desktop client signs in to the same server and shows the same Calendar and Event. It does not keep a second business copy. | No separate desktop business store for this product. | One Event created in the browser is visible in the desktop client. |

## 3. Server invariants

These follow the PRD. They are not new product rules.

- The browser cannot be the authority for uniqueness, visibility, verification, conflict results, or deletion.
- A write that does not finish leaves the prior state. This covers registration versus cancellation, a series save versus a later deletion or detachment, recovery versus an unfinished save, account deletion, and every team transition named in BR-L8.
- Email is not returned by search, public Event reads, conflict warnings, or team member and invitation lists.
- The first delivery does not expose search, another person's Calendar, sharing links, teams, or the desktop client.

## 4. Open technical questions

These are not product decisions. The PRD already leaves the product items open.

| Item | Why it is open |
|---|---|
| Web framework, server framework, and desktop shell | DEC-013. The repository has Next.js, NestJS, and Electron, and none is selected for this product. |
| Database or other server store | No database is present. The PRD requires durable server-held data. |
| How a session is stored and how long it lasts | DEC-038 requires login and does not set a length. Recovery must still end every open session. |
| How a proof email is transported | DEC-081 decides the failed-send result. The mail provider is still unselected. |
| Performance, availability, and accessibility | DEC-079. No target is a requirement. |

## 5. Coverage

First delivery: AC-P01 through AC-P40, including AC-P24 through AC-P40, are mapped above. Later delivery: AC-L01 through AC-L13 are mapped above and are not first-delivery work.

Product items that stay open and are not technical requirements: DEC-023, session length in DEC-038, deleting an account that still belongs to a team, and how many personal Calendars one user may own beyond the personal calendar page.
