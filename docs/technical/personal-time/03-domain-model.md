# Domain Model: Personal Time Management

- Stage: 3 — Detailed Technical Design
- Date: 2026-11-24
- Status: APPROVED by the user on 2026-11-24. This approval does not authorize application code.
- Product authority: `docs/product/06-prd-personal-time.md` version 0.1 (DEC-080), plus DEC-081
- Stack: TD-PT-1

Names below are domain concepts. Later-delivery concepts are named so the first-delivery model does not block them. The first delivery does not expose them.

## 1. Identity

| Concept | Lifecycle | Rule |
|---|---|---|
| Registration | Created unverified. Removed by cancellation or replaced by a verified account. | Cancellation and verification are different operations. Cancellation frees the username and email. It does not retire the username. |
| Account | Verified. Removed by completed deletion. | Only completed deletion retires the username. The email may be registered again and receives none of the deleted Events. |
| Retired username | Written only when account deletion commits. | A later registration cannot take it. Search and the old link find no account. |
| Nickname | Optional field on the registration and account. | Outer trim. All spaces become none. Internal spaces remain. Display is the nickname, or the username when there is none. |
| Session | Created by login. Ended by logout, completed recovery, or completed deletion. | Recovery ends every session of that account and does not create one. No duration is stored. |
| Verification proof | One per current registration attempt. | Sent only to that registration email. Match verifies. Mismatch, reuse, or a proof whose registration was not stored fails without revealing whether a registration exists. |
| Recovery proof | One current unused proof. | A later proof marks every unused earlier proof invalid. Sent only to a verified account while mail can be sent. Unknown and unverified addresses send nothing and store nothing in that case. While mail cannot be sent, no recovery proof is stored. |
| Failed send | No registration row and no proof row. | DEC-081 and DEC-082. While mail cannot be sent, every registration and every recovery start receives the same send-failure result, including a taken username and an unknown email. While mail can be sent, the ordinary results stay unchanged. |

Password composition, username characters, username and email case, proof lifetime, changing the account email, and session length stay open. This model stores the submitted username, email, and password hash exactly as accepted and does not add a policy.

## 2. Calendar and Event

- A verified account has one personal Calendar in the first delivery.
- The account has one current IANA calendar timezone, supplied by the browser at registration and changeable later.
- An Event belongs to exactly one Calendar and one creator.
- A new Event is private unless the creator chooses public.
- A non-repeating Event stores absolute start and end.
- A series stores a clock-face template: local start, local end, the first civil date, and either a weekday or a month date. The repetition kind is fixed at creation. A save that changes it writes nothing.
- Title is stored without outer whitespace and must be non-empty. Location and description may be empty. There is no date-only Event.
- The owner can tell public from private.

## 3. Occurrence facts

Attached occurrences are not stored as one row per future date.

| Fact | What is stored | What a later series save does |
|---|---|---|
| Unstarted attached occurrence | Nothing. Computed from the template and the current timezone. | Time, title, location, description, and visibility follow the template. |
| Started attached occurrence | Absolute start and end, captured when a timezone change or a series time change finds that its start has been reached. Before either change, the instant is the one computed from the template. | Title, location, description, and visibility follow the template. Time stays at the stored instant. |
| Absence | Original start instant and the civil date of that instant in the timezone at deletion. | Does not restore it. A later clock change on the same daily date, weekday, or month date leaves that civil date empty. A weekday change does not suppress the new weekday. Timezone re-expansion does not emit a replacement for that original instant. |
| Skipped date | The civil date whose generated start or end is missing, or whose interval crosses a missing local hour. | Stays skipped after a timezone change and after a series time change. Shown as skipped, not as a cancelled Event. |
| Unchosen doubled start | The two original absolute instants. | Stays unchosen and out of conflict comparison. The choice still offers those two instants, labeled in the timezone at the choice. |
| Chosen doubled start | The chosen absolute instant, including a future one. | Kept through a later timezone change. Included in conflict comparison. |
| Detached occurrence | A separate Event with its own text, time, visibility, and the original start instant it came from. | Series edits and series deletion do not change it. Deleting the series removes attached occurrences and absences and keeps this Event. |

An occurrence has started when its start instant has been reached, even if its end has not.

One occurrence edit, including a visibility change for that occurrence only, detaches it and stores the complete content submitted with that detachment. The new row has no repetition. If a series save commits first and the detachment commits later, the detachment wins.

### Read rule

A Calendar read over a finite civil-date range includes:

- a template occurrence whose start has been reached, even when no freeze row exists yet;
- a freeze instead of a new clock time on that same slot after a time or timezone change, and not both;
- an absence by the civil date stored at deletion, so a later same-day clock change does not refill it;
- a new weekday from a weekday change, because the absence is not applied to that weekday;
- a skipped civil date, persisted when the series is saved or when the timezone or clock changes, including a future date where that clock is already missing, and kept across later timezone and time changes;
- an unchosen doubled start as a required choice, not as a scheduled interval;
- a detached Event as its own Event.

Conflict comparison uses the other owned intervals that remain after the save. It does not compare the slot this save removes with itself. It does compare a detached occurrence that remains another owned Event.

## 4. Conflict and preview

- The window is 90 calendar dates in the creator's current timezone, starting on the save date and including that date.
- Compare absolute intervals inside the window with the creator's other owned Events. Include a detached occurrence. Exclude the Event being saved and its own attached occurrences.
- Overlap means a shared positive length. Touching endpoints do not overlap. A partial overlap at the far boundary counts. An overlap entirely after the window does not.
- The warning lists title, start, and end, omits email, and does not block the save.
- A series save always includes the sentence that repetition continues after those 90 dates. That sentence is not a conflict warning.
- A rejected monthly date writes nothing. The preview names month types that lack the date and lists concrete missing dates only inside the same 90 calendar dates.

## 5. Later delivery, not in the first model behavior

Team, invitation, sharing link, search, and the former member's retained-Event list are confirmed and are not first-delivery operations. An Event still has exactly one Calendar, so a later move can change `calendar_id` in one transaction rather than copy the Event.

## 6. Invariants

- The browser is not the authority for uniqueness, visibility, verification, conflict results, or deletion.
- A commit writes the whole operation or leaves the prior rows.
- Email is not present on search, public Event reads, conflict warnings, or team lists. Those reads are later, and the first delivery already omits email from conflict warnings.
- The first delivery does not provide search, another person's Calendar, sharing, teams, or the desktop client.
