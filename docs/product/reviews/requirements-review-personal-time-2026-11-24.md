# Requirements Review Report

- Review date: 2026-11-24
- Scope / source document versions: `docs/product/05-requirements-baseline.md`, DRAFT, sourced from DEC-012 through DEC-023. This review does not cover `docs/product/04-prd.md` or DEC-001 through DEC-011, and it does not replace `docs/product/reviews/requirements-review.md`.
- Reviewer: Requirements Reviewer
- Overall result: Material gaps. No CRITICAL finding. The draft is not a stable baseline.
- Delegation: independent requirements-reviewer. Findings are not product decisions.

The canonical filename `docs/product/reviews/requirements-review.md` already holds the 2026-11-19 review of the earlier desktop baseline. This report is stored separately so that review remains intact.

## Findings

| ID | Severity | Related | User decision |
|---|---|---|---|
| RR-01 | HIGH | DEC-015, DEC-022, §3.1 | yes |
| RR-02 | HIGH | DEC-015, §3.1 | yes |
| RR-03 | HIGH | DEC-015, §3.1 | yes |
| RR-04 | HIGH | DEC-013, DEC-018, DEC-022, §1 | no |
| RR-05 | HIGH | DEC-018, DEC-019 | yes |
| RR-06 | HIGH | DEC-018, DEC-019 | yes |
| RR-07 | HIGH | DEC-019, AC-P11 | yes |
| RR-08 | HIGH | DEC-020 | yes |
| RR-09 | HIGH | DEC-019, §3.4 | yes |
| RR-10 | HIGH | DEC-017, DEC-019 | yes |
| RR-11 | HIGH | DEC-017, DEC-019 | yes |
| RR-12 | HIGH | DEC-014, DEC-015, DEC-016 | yes |
| RR-13 | HIGH | DEC-021, §6 | yes |
| RR-14 | HIGH | DEC-021, §2 | yes |
| RR-15 | HIGH | DEC-016, DEC-021 | yes |
| RR-16 | MEDIUM | DEC-015, DEC-017 | yes |
| RR-17 | MEDIUM | DEC-016, DEC-017 | yes |
| RR-18 | MEDIUM | DEC-019 | yes |
| RR-19 | MEDIUM | DEC-020 | yes |
| RR-20 | MEDIUM | DEC-021 | yes |
| RR-21 | MEDIUM | DEC-021 | yes |
| RR-22 | MEDIUM | DEC-016 | yes |
| RR-23 | MEDIUM | DEC-013, DEC-022 | yes |
| RR-24 | MEDIUM | DEC-019, DEC-021 | yes |
| RR-25 | MEDIUM | §5 | no |
| RR-26 | MEDIUM | DEC-015, DEC-022 | yes |
| RR-27 | MEDIUM | DEC-015 | yes |

### RR-01 — Unverified registration has no exit

- **Severity:** HIGH
- **Related requirement/decision:** §3.1, BR-P3, BR-P4, AC-P01, AC-P02, DEC-015, DEC-022
- **Problem:** An account exists before email verification and cannot log in. Deletion is the only stated way to release an email, and deletion also retires the username. "Active" is not defined, so an unverified registration may reserve the username and email forever, or may allow a second account for the same email.
- **Concrete scenario:** A person registers `sam` with a mistyped email and never verifies it. That person cannot log in to delete the account. The username and email may stay reserved, or a second registration may attach the same email to another account.
- **Impact:** A person can lose a username before ever logging in, or one email can end up on two accounts.
- **Suggested resolution:** Define the unverified state and a way to release the username and email without a login. Keep verification-message lifetime in DEC-023.
- **User decision required:** yes

### RR-02 — Login outcomes are missing

- **Severity:** HIGH
- **Related requirement/decision:** §3.1, BR-P4, AC-P01, DEC-015
- **Problem:** Login is named and not specified. Unknown email, unverified account, and wrong password have no outcomes, including whether those outcomes may differ and reveal that an account exists.
- **Concrete scenario:** A person tries an unknown email, then an unverified email, then the right email with the wrong password.
- **Impact:** The return path is not testable, and the error text can reveal that an email is registered.
- **Suggested resolution:** Specify success and those three failures, including what each result may reveal.
- **User decision required:** yes

### RR-03 — Recovery has no end state

- **Severity:** HIGH
- **Related requirement/decision:** §3.1, BR-P4, DEC-015
- **Problem:** Recovery uses the email, but the draft does not say what changes, whether the old password stops working, or what happens for an unknown or unverified email.
- **Concrete scenario:** A verified user no longer knows the password.
- **Impact:** The confirmed recovery rule has no completable flow.
- **Suggested resolution:** Record the end state and the unknown-email and unverified outcomes. Leave password composition in DEC-023.
- **User decision required:** yes

### RR-04 — The first-delivery list omitted confirmed behavior

- **Severity:** HIGH
- **Related requirement/decision:** §1, BR-P1, DEC-013, DEC-018, DEC-022
- **Problem:** The delivery table omitted calendar-timezone changes and account deletion, while later sections included them. Both are already confirmed.
- **Concrete scenario:** One reading of §1 drops account deletion. Another reading of §3.8 includes it.
- **Impact:** The MVP boundary was internally inconsistent.
- **Suggested resolution:** Name both behaviors in the first-delivery boundary. This is not a new product choice.
- **User decision required:** no

### RR-05 — Timezone change and future repeats disagree

- **Severity:** HIGH
- **Related requirement/decision:** DEC-018, DEC-019
- **Problem:** Saved occurrences keep their absolute instants, while recurrence expands in the current timezone at the original clock time. Future occurrences are not classified as already saved.
- **Concrete scenario:** A daily 09:00 Event is saved in `America/New_York`. The user changes the timezone to `Asia/Shanghai` and does not edit the series.
- **Impact:** Future occurrences either stay at the old instant or move to 09:00 in Shanghai.
- **Suggested resolution:** Choose whether a timezone change keeps future attached instants or re-expands them at the same local clock time.
- **User decision required:** yes

### RR-06 — Later occurrences have no daylight-saving rule

- **Severity:** HIGH
- **Related requirement/decision:** DEC-018, DEC-019
- **Problem:** A missing or doubled local time is defined for the value being entered, not for an occurrence generated later. Duration may mean clock length or absolute elapsed time.
- **Concrete scenario:** A weekly 02:30 Event in `America/New_York` later falls on the spring-forward Sunday, when 02:30 does not exist. A 09:00–17:00 Event later crosses a daylight-saving change.
- **Impact:** Infinite repetition and the local-time rule have no joint outcome.
- **Suggested resolution:** Decide the generated occurrence's missing-time, repeated-time, and duration behavior.
- **User decision required:** yes

### RR-07 — "Already occurred" does not include an Event in progress

- **Severity:** HIGH
- **Related requirement/decision:** DEC-019, AC-P11
- **Problem:** Series edits preserve occurrences that have already occurred. The draft does not say whether an occurrence that has started and not ended is in that group.
- **Concrete scenario:** At 09:30, the creator changes a weekly 09:00–10:00 series to Thursday at 11:00.
- **Impact:** The current occurrence either stays or moves.
- **Suggested resolution:** Define the cutoff among not started, in progress, and ended.
- **User decision required:** yes

### RR-08 — Conflict comparison can miss a series or warn about itself

- **Severity:** HIGH
- **Related requirement/decision:** DEC-020
- **Problem:** The saved series is expanded for 90 days. Other owned series are not given that expansion. The Event being edited is not excluded. Overlap inside one series, and an exact shared endpoint, are undefined.
- **Concrete scenario:** A single Event overlaps a later occurrence of an owned weekly series, but the series is compared only through its first interval. A title-only edit overlaps the Event being saved.
- **Impact:** A real overlap can be silent, and an ordinary edit can warn about itself.
- **Suggested resolution:** Define expansion of owned series, exclusion of the Event being saved, overlap inside one series, and whether equal endpoints overlap.
- **User decision required:** yes

### RR-09 — A deleted occurrence may return

- **Severity:** HIGH
- **Related requirement/decision:** DEC-019
- **Problem:** Deleting one occurrence removes it. The deletion is not described as durable when the series is later edited.
- **Concrete scenario:** The creator deletes 12 May, then changes the series time. 12 May may stay absent or reappear.
- **Impact:** A confirmed deletion can be undone by another confirmed edit.
- **Suggested resolution:** Decide whether a deleted occurrence stays absent through later series edits until the series itself is deleted.
- **User decision required:** yes

### RR-10 — Visibility change may not detach an occurrence

- **Severity:** HIGH
- **Related requirement/decision:** DEC-017, DEC-019
- **Problem:** Modifying one occurrence detaches it. Changing only its visibility is stated separately and does not say that it detaches.
- **Concrete scenario:** One private occurrence is made public. The creator later changes the series time.
- **Impact:** The occurrence may keep its old time and public visibility, or move with the series.
- **Suggested resolution:** Decide whether a one-occurrence visibility change detaches it, and whether a series visibility change affects past attached occurrences.
- **User decision required:** yes

### RR-11 — Series edits do not say which past fields change

- **Severity:** HIGH
- **Related requirement/decision:** DEC-017, DEC-019
- **Problem:** Past attached occurrences keep their instants. Title, location, description, and visibility are not given the same protection.
- **Concrete scenario:** A daily series has 20 past occurrences. The creator renames the series.
- **Impact:** Past titles either change or stay, with no confirmed rule.
- **Suggested resolution:** For each field, decide whether a series edit updates past attached occurrences.
- **User decision required:** yes

### RR-12 — A sharing link is called a Calendar

- **Severity:** HIGH
- **Related requirement/decision:** DEC-014, DEC-016
- **Problem:** The personal page, a team Calendar, and a sharing link are all called Calendars. The draft does not say whether the link is an address for an existing Calendar or a second container, or whether an Event is in exactly one Calendar.
- **Concrete scenario:** A user creates a sharing link. It may show the personal Calendar's public Events, or it may be an empty container.
- **Impact:** The object model does not determine what the link contains.
- **Suggested resolution:** Decide what a sharing link addresses, who creates and revokes it, and whether an Event belongs to one Calendar.
- **User decision required:** yes

### RR-13 — A former member can edit a team Event with no surface

- **Severity:** HIGH
- **Related requirement/decision:** DEC-021
- **Problem:** After leaving, the creator can still modify or delete retained team Events. The draft does not say where that person does so, or what else that person can see. This is outside the first delivery.
- **Concrete scenario:** A member creates a team Event and leaves.
- **Impact:** The confirmed permission has no flow.
- **Suggested resolution:** Name the surface and the remaining visibility. The confirmed delete right is already part of DEC-021.
- **User decision required:** yes

### RR-14 — The team creator's membership is missing

- **Severity:** HIGH
- **Related requirement/decision:** DEC-021
- **Problem:** Creating a team is not stated to make that person a member. Only a member may create a team Event. The draft also does not say who operates the team if that person leaves. This is outside the first delivery.
- **Concrete scenario:** A person creates a team and tries to add an Event.
- **Impact:** The first team Event and later administration may have no allowed actor.
- **Suggested resolution:** Separate the team creator from the Event creator. Decide membership, leaving, and who administers the team afterward.
- **User decision required:** yes

### RR-15 — The team Calendar audience is missing

- **Severity:** HIGH
- **Related requirement/decision:** DEC-016, DEC-021
- **Problem:** Public Events are visible to logged-in users who can open the Calendar. The draft does not say who can open a team Calendar. This is outside the first delivery.
- **Concrete scenario:** A non-member, a logged-out person, and a member each try to open the team Calendar.
- **Impact:** Team privacy cannot be applied.
- **Suggested resolution:** Define the audience for current members, former creators, other logged-in users, and logged-out users.
- **User decision required:** yes

### RR-16 — Nickname change has no outcome

- **Severity:** MEDIUM
- **Related requirement/decision:** DEC-015, DEC-017
- **Problem:** The nickname is optional and changeable. A blank or space-only nickname, and the nickname shown on an existing public Event after a change, are not defined.
- **Concrete scenario:** A user saves three spaces, later changes "Sam" to "S. Lee" after a public Event exists.
- **Impact:** Display name and later public identity are not testable.
- **Suggested resolution:** Define an empty nickname and whether an existing public Event shows the new nickname without another Event save.
- **User decision required:** yes

### RR-17 — A non-repeating edit and delete are implied

- **Severity:** MEDIUM
- **Related requirement/decision:** DEC-017
- **Problem:** The creator can modify and delete Events. Only an invalid save and series deletion have explicit outcomes. A successful single-Event edit and a non-repeating delete do not say whether the result is immediate or restorable.
- **Concrete scenario:** A user changes one Event's title and time, then deletes it.
- **Impact:** Basic edit and delete behavior is only implied.
- **Suggested resolution:** Specify the successful edit and the delete outcome, including restorability and later conflict comparison.
- **User decision required:** yes

### RR-18 — The repetition kind may be fixed

- **Severity:** MEDIUM
- **Related requirement/decision:** DEC-019
- **Problem:** The draft does not say whether an edit may change a single Event into a series, or change daily, weekly, and monthly into one another.
- **Concrete scenario:** A user edits a daily Event and selects monthly on the 31st.
- **Impact:** An ordinary edit can be valid, rejected, or a new Event.
- **Suggested resolution:** Decide which repetition changes are allowed after the first save.
- **User decision required:** yes

### RR-19 — The warning text has more than one meaning

- **Severity:** MEDIUM
- **Related requirement/decision:** DEC-020
- **Problem:** The sentence that repetition continues is specified when overlaps exist both inside and outside 90 days. No overlap, and an overlap only after 90 days, have no outcome.
- **Concrete scenario:** A daily series overlaps an owned Event only on day 100. Another series overlaps nothing.
- **Impact:** The same sentence can mean "the series continues" or "an unlisted conflict exists."
- **Suggested resolution:** Define the warning for no overlap, in-window overlap, and overlap only after 90 days.
- **User decision required:** yes

### RR-20 — Invitation boundaries are missing

- **Severity:** MEDIUM
- **Related requirement/decision:** DEC-021
- **Problem:** Join, decline, and cancellation are confirmed. Unknown username, an existing member, a duplicate invitation, the wrong logged-in user, and acceptance after the invitation ended are not. This is outside the first delivery.
- **Concrete scenario:** The creator invites a username that does not exist, then invites a current member twice.
- **Impact:** The join rule cannot be applied at its boundaries.
- **Suggested resolution:** Specify those invitation outcomes.
- **User decision required:** yes

### RR-21 — A one-member team may be unable to end

- **Severity:** MEDIUM
- **Related requirement/decision:** DEC-021
- **Problem:** Dissolution is confirmed while other members remain. Sole-member dissolution is neither allowed nor rejected. This is outside the first delivery.
- **Concrete scenario:** The only person associated with a team dissolves it.
- **Impact:** The smallest team may have no way to end.
- **Suggested resolution:** Decide whether sole-member dissolution uses the same Event movement.
- **User decision required:** yes

### RR-22 — A logged-out person is not an actor

- **Severity:** MEDIUM
- **Related requirement/decision:** DEC-016
- **Problem:** Other logged-in users cannot open a personal Calendar in the first delivery. A logged-out person, including the owner after logout, has no stated result.
- **Concrete scenario:** A user logs out and opens the Calendar address directly.
- **Impact:** First-delivery privacy is unconfirmed for a logged-out person.
- **Suggested resolution:** Add the logged-out person and state what that person can see.
- **User decision required:** yes

### RR-23 — Concurrent saves and partial deletion are undefined

- **Severity:** MEDIUM
- **Related requirement/decision:** DEC-013, DEC-022
- **Problem:** The server holds one account's data for more than one session. An invalid Event save writes nothing. Concurrent success and a deletion that stops halfway have no rule. DEC-009 belongs to the earlier product and is not imported.
- **Concrete scenario:** Two sessions save the same Event. Account deletion removes the login and then fails before the Events are removed.
- **Impact:** The stored result can be a state no confirmed rule describes.
- **Suggested resolution:** Decide save precedence and the required result when deletion or save stops early.
- **User decision required:** yes

### RR-24 — An ended team Event has two homes

- **Severity:** MEDIUM
- **Related requirement/decision:** DEC-019, DEC-021
- **Problem:** DEC-019 says ended occurrences stay on the personal Calendar. DEC-021 says team Events stay on the team Calendar until dissolution. This does not affect the first delivery.
- **Concrete scenario:** A team Event ends before the team is dissolved.
- **Impact:** Later team history and personal conflict comparison can diverge.
- **Suggested resolution:** Decide whether an ended team occurrence stays on the team Calendar until dissolution.
- **User decision required:** yes

### RR-25 — Confirmed behavior lacked criteria

- **Severity:** MEDIUM
- **Related requirement/decision:** §5
- **Problem:** Username uniqueness, the creator distinguishing public from private, a valid daily or monthly series, one-occurrence deletion, series deletion, and a chosen doubled local time had no acceptance criteria.
- **Concrete scenario:** A second registration uses an existing username.
- **Impact:** Confirmed behavior could remain untested.
- **Suggested resolution:** Add criteria only for behavior already fixed. Do not use them to close RR-01 through RR-11.
- **User decision required:** no

### RR-26 — A retired username has no later result

- **Severity:** MEDIUM
- **Related requirement/decision:** DEC-015, DEC-022
- **Problem:** Search and the personal-calendar link use the username. A deleted username is not reassigned. The later result of searching or opening it is not stated. This is outside the first delivery.
- **Concrete scenario:** After deletion, a logged-in user searches for the retired username and opens its old link.
- **Impact:** Email reuse could be confused with the old Calendar.
- **Suggested resolution:** Specify that the old username and link do not reach the new account.
- **User decision required:** yes

### RR-27 — Search results have no fields

- **Severity:** MEDIUM
- **Related requirement/decision:** DEC-015
- **Problem:** Nickname search may return several users. The fields that distinguish them are not stated. Email is excluded. This is outside the first delivery.
- **Concrete scenario:** Two users have the nickname "Sam."
- **Impact:** The searcher may be unable to tell the results apart.
- **Suggested resolution:** Specify the result fields and the username match.
- **User decision required:** yes

## Residual observations

These are not findings.

- DEC-023 remains open on purpose.
- Deleting an account that still belongs to a team remains unresolved for the later team delivery.
- The number of personal Calendars beyond the personal calendar page remains undecided.
- No web, server, or desktop technology is selected.
- The earlier approved PRD and DEC-001 through DEC-011 are a separate baseline.
- There is no separate action that stops future repeats while keeping the series history. That matches the written series-deletion rule.

## Primary-agent disposition

| ID | Classification | Action | Status |
|---|---|---|---|
| RR-04 | Editorial | First-delivery boundary now names timezone change and account deletion. | Addressed in the draft |
| RR-25 | Editorial | AC-P17 through AC-P23 restate already confirmed behavior. | Addressed in the draft |
| RR-13 wording | Editorial | The later team sentence now states modify and delete. | Addressed in the draft |
| RR-01 | Product decision | The user selected cancellation without login. Recorded as DEC-024. | Decided, not re-reviewed |
| RR-02 | Product decision | The user selected one identical failure result. Recorded as DEC-025. | Decided, not re-reviewed |
| RR-03 | Product decision | The user selected verified-account recovery. Recorded as DEC-026. | Decided, not re-reviewed |
| RR-05 | Product decision | The user selected re-expansion of future attached occurrences. Recorded as DEC-027. | Decided, not re-reviewed |
| RR-06 | Product decision | The user selected skip or wait for a generated local time. Recorded as DEC-028. | Decided, not re-reviewed |
| RR-07 | Product decision | The user selected the start instant as the cutoff. Recorded as DEC-029. | Decided, not re-reviewed |
| RR-08 | Product decision | The user selected expansion without self-overlap. Recorded as DEC-030. | Decided, not re-reviewed |
| RR-09 | Product decision | The user selected a durable absence. Recorded as DEC-031. | Decided, not re-reviewed |
| RR-10 | Product decision | The user selected detachment and series visibility for every attached occurrence. Recorded as DEC-032. | Decided, not re-reviewed |
| RR-11 | Product decision | The user selected text updates for every attached occurrence. Recorded as DEC-033. | Decided, not re-reviewed |
| RR-17 | Product decision | The user selected immediate, unrestorable deletion. Recorded as DEC-034. | Decided, not re-reviewed |
| RR-18 | Product decision | The user fixed the repetition kind at creation. Recorded as DEC-035. | Decided, not re-reviewed |
| RR-19 | Product decision | The user defined the warning for no overlap, in-window overlap, and overlap only after 90 days. Recorded as DEC-036. | Decided, not re-reviewed |
| RR-16 | Product decision | The user selected the current nickname, with a blank nickname shown as the username. Recorded as DEC-037. | Decided, not re-reviewed |
| RR-22 | Product decision | The user required login before a personal Calendar can be seen. Recorded as DEC-038. | Decided, not re-reviewed |
| RR-23 | Product decision | The user selected the last finished save and all-or-nothing account deletion. Recorded as DEC-039. | Decided, not re-reviewed |
| RR-12 | Product decision | The user selected a sharing link as an address for one existing Calendar. Recorded as DEC-040. | Decided, not re-reviewed |
| RR-13 | Product decision | The user selected a personal list of retained team Events. Recorded as DEC-041. | Decided, not re-reviewed |
| RR-14 | Product decision | The user made the team creator a member and the only administrator, with no successor. Recorded as DEC-042. | Decided, not re-reviewed |
| RR-15 | Product decision | The user let current members and other logged-in users open a team Calendar, with private Events limited to their creator. Recorded as DEC-043. | Decided, not re-reviewed |
| RR-20 | Product decision | The user rejected unknown, duplicate, and wrong-user invitations. Recorded as DEC-044. | Decided, not re-reviewed |
| RR-21 | Product decision | The user allowed sole-member dissolution with the same Event move. Recorded as DEC-045. | Decided, not re-reviewed |
| RR-24 | Product decision | The user kept an ended team Event on the team Calendar until dissolution. Recorded as DEC-046. | Decided, not re-reviewed |
| RR-26 | Product decision | The user made a deleted username and its old link reach no account. Recorded as DEC-047. | Decided, not re-reviewed |
| RR-27 | Product decision | The user showed nickname and username on each search result and required a whole-value match. Recorded as DEC-048. | Decided, not re-reviewed |
