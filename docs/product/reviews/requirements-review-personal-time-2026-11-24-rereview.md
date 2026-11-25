# Requirements re-review: personal time management

- Date: 2026-11-24
- Reviewer: independent requirements reviewer
- Scope: `docs/product/05-requirements-baseline.md` and DEC-012 through DEC-048
- Prior review: `docs/product/reviews/requirements-review-personal-time-2026-11-24.md`
- Result: no CRITICAL findings. DEC-024 through DEC-048 close the decisions requested by RR-01 through RR-27. The findings below are incomplete closures or new gaps.

The reviewer returned findings only and did not edit documents. The disposition at the end is the primary session's classification.

## Findings

### RR2-01

- **Severity:** HIGH
- **Related requirement/decision:** DEC-024, §3.1, BR-P4, AC-P24; original RR-01
- **Problem:** Cancellation without login is confirmed, but the baseline does not say what proves the person is the registrant, what they submit, or what happens if that action races verification. It also does not say what the same action does for an unknown email or a verified account.
- **Concrete scenario:** A person registers and never opens a mail client. Another person submits that email to the no-login cancel action. Separately, the registrant cancels at the same moment the email becomes verified. Separately, someone runs the same action against an email that is already verified.
- **Impact:** The action can release a stranger's username, reveal that an email is registered, or free a verified account's email.
- **Suggested resolution:** Define the unauthenticated proof, the success and failure results for unknown, unverified, and verified email, and which result wins if cancellation and verification finish together. State that a verified account is not cancelled by this path.
- **User decision required:** yes

### RR2-02

- **Severity:** HIGH
- **Related requirement/decision:** DEC-031, DEC-034, DEC-039, §3.3, §3.4, AC-P21, AC-P35; original RR-09 and RR-23
- **Problem:** Last successful save replaces the stored Event with that save's complete content. A deleted occurrence stays absent through later series changes. The rules do not say whether deleting or detaching one occurrence survives a later complete series save, or what happens when a save overlaps account deletion.
- **Concrete scenario:** Session A deletes the 12 May occurrence. Session B, which opened the series earlier, saves a new time and finishes after A. Separately, one session finishes a save after another session has started account deletion.
- **Impact:** A completed occurrence deletion or detachment can disappear, or a save can remain on an account that was supposed to be deleted as one unit.
- **Suggested resolution:** Define which write wins among a series save, an absence, and a detached occurrence. Define the result when a save and account deletion overlap.
- **User decision required:** yes

### RR2-03

- **Severity:** HIGH
- **Related requirement/decision:** DEC-015, DEC-024, DEC-025, DEC-026, §3.1, AC-P02, AC-P17, AC-P25, AC-P26; original RR-02 and RR-03
- **Problem:** Login and recovery failure for an unknown or unverified email share one non-revealing result. Registration rejection and the start of recovery for a verified email do not.
- **Concrete scenario:** A person learns nothing from logging in as an email, then registers that email, registers a taken username, and requests recovery. Different refusals identify which identifier is held and whether the account is verified.
- **Impact:** The confirmed login privacy rule is bypassed by registration and by starting recovery.
- **Suggested resolution:** Decide the registration results for a taken username, a taken unverified email, and a taken verified email, and whether beginning recovery for a verified account is indistinguishable from the login failure until recovery completes.
- **User decision required:** yes

### RR2-04

- **Severity:** HIGH
- **Related requirement/decision:** DEC-027, DEC-031, DEC-045, §3.4, AC-P21; original RR-09
- **Problem:** A deleted occurrence stays absent, but nothing identifies that absence. Dissolution also does not say whether the absence moves with the series.
- **Concrete scenario:** A weekly Wednesday series has 12 May deleted. The creator changes the series to Thursday, or changes the timezone. The team is later dissolved.
- **Impact:** The absent occurrence can stay gone, shift to a different date, or be generated again.
- **Suggested resolution:** Define the identity of an absence and what a weekday change, a timezone re-expansion, and a move to another Calendar suppress.
- **User decision required:** yes

### RR2-05

- **Severity:** HIGH
- **Related requirement/decision:** DEC-019, DEC-020, DEC-030, DEC-036, DEC-046, §3.6, AC-P12, AC-P32; original RR-08 and RR-24
- **Problem:** Ended Events participate in conflict comparison, while a save with no overlap inside the forward 90 days shows no warning. A past overlap and an occurrence already in progress are unclassified. The 90-day bound is not defined as calendar dates or elapsed time.
- **Concrete scenario:** The creator saves an Event dated yesterday that overlaps another owned Event yesterday. At 09:30 they save a new Event that overlaps a 09:00–10:00 Event already in progress.
- **Impact:** The same past overlap can be required to warn and required not to warn.
- **Suggested resolution:** State whether comparison includes overlaps before the save instant and overlaps with an occurrence already in progress. Define the 90-day bound, including a partial overlap at the far edge.
- **User decision required:** yes

### RR2-06

- **Severity:** HIGH
- **Related requirement/decision:** DEC-019, DEC-032, DEC-033, §3.4, AC-P28, AC-P29; original RR-10 and RR-11
- **Problem:** A series time change skips started occurrences. A series visibility change and a series text change update started occurrences. One save that changes both visibility and text has no precedence.
- **Concrete scenario:** A daily occurrence started at 09:00. At 09:30 the creator saves the series as public and changes the title.
- **Impact:** The started occurrence either keeps the old title and becomes public, or becomes public with the new title.
- **Suggested resolution:** For one series save, state the precedence among time, visibility, title, location, and description for a started attached occurrence and for one that has not started.
- **User decision required:** yes

### RR2-07

- **Severity:** HIGH
- **Related requirement/decision:** DEC-021, DEC-041, DEC-043, §6; original RR-13
- **Problem:** The Event creator keeps modify and delete rights after leaving or being removed. The personal list is stated for leaving, not for removal. Rejoining can leave the same Event on the team Calendar and on the former-member list.
- **Concrete scenario:** The administrator removes Sam. Sam is later invited and accepts.
- **Impact:** Removal can preserve an edit right with no place to use it. Rejoin can show one Event in two places.
- **Suggested resolution:** State whether removal uses the retained-Event list, and what happens to that list entry when the former member becomes a current member again.
- **User decision required:** yes

### RR2-08

- **Severity:** HIGH
- **Related requirement/decision:** DEC-016, DEC-017, DEC-018, DEC-027, DEC-043, §6
- **Problem:** Public Event content includes start and end, but the rules never say which timezone another logged-in viewer sees. This does not affect the first delivery.
- **Concrete scenario:** A creator in America/New_York has a public Event at 09:00–10:00. A logged-in viewer in Asia/Shanghai opens that Calendar.
- **Impact:** The same start and end have two different clock displays.
- **Suggested resolution:** Choose the timezone used when someone other than the creator views a start and end, and whether the timezone is shown.
- **User decision required:** yes

### RR2-09

- **Severity:** MEDIUM
- **Related requirement/decision:** DEC-018, DEC-027, DEC-028, §3.7, AC-P15, AC-P27; original RR-06
- **Problem:** A generated interval whose start exists and whose end does not, or whose interior contains a daylight-saving gap, is undecided. A skipped date or a doubled start waiting for a choice has no rule after a later timezone change makes that clock time valid. The doubled start has no trigger for the choice.
- **Concrete scenario:** A weekly 01:30–02:30 Event later falls on a spring-forward Sunday, when 02:30 does not exist. The creator then switches the calendar timezone to UTC.
- **Impact:** The occurrence can be skipped, shortened, or stored with clock times that do not exist.
- **Suggested resolution:** Define a generated end that does not exist and a clock interval that crosses a missing local hour. Define whether a skip or an unchosen doubled start persists after re-expansion, and how the creator is told that a choice is required.
- **User decision required:** yes

### RR2-10

- **Severity:** MEDIUM
- **Related requirement/decision:** DEC-019, DEC-030, §3.6, AC-P12; original RR-08
- **Problem:** The series being saved is not compared with its own occurrences. A detached occurrence is not explicitly one of the other Events that must produce a warning.
- **Concrete scenario:** A daily 09:00–10:00 series has one occurrence detached and moved to 09:30–10:30. The creator later saves the series at 09:00–10:00.
- **Impact:** The detached occurrence can warn as another owned Event, or stay inside the self-exclusion.
- **Suggested resolution:** State whether a detached occurrence is a separate owned Event for conflict comparison.
- **User decision required:** yes

### RR2-11

- **Severity:** MEDIUM
- **Related requirement/decision:** DEC-038, DEC-040, DEC-042, DEC-047, §6; original RR-12 and RR-26
- **Problem:** A revoked link, a team link that stops because its creator left, a team link after dissolution, and a sharing link after account deletion have no visitor result. DEC-047 gives that result only for the old username link.
- **Concrete scenario:** The owner revokes a personal sharing link. A team creator leaves and a member opens the old team link. The owner deletes the account and someone opens a sharing link created before deletion.
- **Impact:** The visitor can see an empty Calendar, a login barrier, or the Events.
- **Suggested resolution:** For each address, state whether any Calendar opens and whether any Event is shown, for a logged-out person and a logged-in person.
- **User decision required:** yes

### RR2-12

- **Severity:** MEDIUM
- **Related requirement/decision:** DEC-015, DEC-021, DEC-042, DEC-044, §6; original RR-14 and RR-20
- **Problem:** The invited account has no stated place to see, accept, or decline an invitation. Decline is not limited to the invited account. An invitation to an unverified username or a retired username is not distinguished from an unknown username. Member and pending-invitation lists have no fields.
- **Concrete scenario:** The administrator invites an unverified username and a retired username. Another logged-in user declines the invitation. A current member looks for who else belongs to the team.
- **Impact:** The confirmed join path has no completable flow. A decline can end someone else's invitation.
- **Suggested resolution:** Name where the invited account acts and where the administrator sees members and pending invitations. Limit decline to the invited account. Choose the fields shown. Classify unverified and retired usernames.
- **User decision required:** yes

### RR2-13

- **Severity:** MEDIUM
- **Related requirement/decision:** DEC-026, DEC-038, DEC-039, §3.1, AC-P26; original RR-03
- **Problem:** Recovery sets a new password and the old password fails immediately. Neither decision says whether sessions already open survive recovery, or whether completing recovery itself opens the personal Calendar.
- **Concrete scenario:** The user is logged in and editing an Event. Recovery completes in another browser with a new password.
- **Impact:** The first browser can keep editing, or it can be signed out.
- **Suggested resolution:** State the fate of existing sessions when recovery completes, and whether completion itself opens the Calendar.
- **User decision required:** yes

### RR2-14

- **Severity:** MEDIUM
- **Related requirement/decision:** DEC-037, DEC-048, §3.1, AC-P33; original RR-16
- **Problem:** A nickname that is empty after outer whitespace is removed counts as no nickname. A non-empty nickname is not given that trim. Search compares the entire current nickname with the entire searched text.
- **Concrete scenario:** The user saves the nickname ` Sam `. Another user later searches for `Sam`.
- **Impact:** The display name and the nickname-search match can include the spaces or ignore them.
- **Suggested resolution:** State whether outer whitespace is removed before a non-empty nickname is stored, displayed, and searched.
- **User decision required:** yes

### RR2-15

- **Severity:** MEDIUM
- **Related requirement/decision:** DEC-021, DEC-040, DEC-045, §6; original RR-21 and RR-23
- **Problem:** Creating a team and its Calendar, accepting an invitation, leaving, removal, and dissolution that moves every Event are not given the all-or-nothing result already used for account deletion.
- **Concrete scenario:** Dissolution moves some Events and then stops. The team Calendar and the unmoved Events are still present.
- **Impact:** An Event can be in two Calendars, in neither, or left on a Calendar whose membership has ended.
- **Suggested resolution:** Give those team transitions the same result class as account deletion: the whole transition completes, or the prior state remains.
- **User decision required:** yes

### RR2-16

- **Severity:** MEDIUM
- **Related requirement/decision:** DEC-015, DEC-047, DEC-048, §6; original RR-27
- **Problem:** The baseline does not say whether a logged-out person may search, what a search with no match shows, or what an empty search returns.
- **Concrete scenario:** A logged-out person searches for a username. A logged-in person searches for a username that belongs to nobody, then searches with an empty value.
- **Impact:** Search can disclose nicknames and usernames without the login required before a Calendar opens.
- **Suggested resolution:** Require or reject logged-out search. Define no-match and empty-input results without exposing email.
- **User decision required:** yes

### RR2-17

- **Severity:** MEDIUM
- **Related requirement/decision:** DEC-019, §3.5, AC-P09
- **Problem:** A monthly preview names the months that lack the selected date, while the series has no end. The set of named months is not bounded.
- **Concrete scenario:** The creator saves a monthly series on the 31st.
- **Impact:** The preview can name four month types, the months inside 90 days, or every such month for the life of the series.
- **Suggested resolution:** Bound the named months, or state that the preview names month types and lists concrete dates only inside the same 90-day window.
- **User decision required:** yes

### RR2-18

- **Severity:** MEDIUM
- **Related requirement/decision:** DEC-015, DEC-018, DEC-019, DEC-027, DEC-032, DEC-033, §3.4, BR-P4
- **Problem:** Later decisions settled behavior that earlier final rules still contradicted. The baseline header cited only DEC-012 through DEC-023.
- **Concrete scenario:** A reader applies the earlier absolute-instant sentence and refuses to rename a started occurrence.
- **Impact:** The same confirmed behavior had two current statements.
- **Suggested resolution:** Narrow the earlier final rules to the later decisions. Do not treat that edit as a new product decision.
- **User decision required:** no

### RR2-19

- **Severity:** LOW
- **Related requirement/decision:** DEC-014, §1, baseline header
- **Problem:** DEC-014's final rule still said a sharing link is a Calendar, while its change history and DEC-040 say the link is an address.
- **Concrete scenario:** A reader of the final rule treats a new sharing link as an empty Calendar.
- **Impact:** The object model can be read twice.
- **Suggested resolution:** Change DEC-014's final rule so the link is an address.
- **User decision required:** no

## Residual observations

These are not findings.

- DEC-023 remains open for username characters and length, password rules, verification-message lifetime, and changing the account email. Username and email case, and trimming a username, stay adjacent to that open item.
- Deleting an account that still belongs to a team remains unresolved for the later team delivery.
- How many personal Calendars one user may own beyond the personal calendar page remains undecided.
- No web, server, or desktop technology is selected.
- DEC-001 through DEC-011 and `docs/product/04-prd.md` remain a separate earlier baseline.
- There is still no action that stops future repeats while keeping attached history.

## Primary-agent disposition

| ID | Classification | Action | Status |
|---|---|---|---|
| RR2-18 | Editorial | Earlier final rules and the baseline header now follow the later decisions. No new product rule. | Addressed in the draft |
| RR2-19 | Editorial | DEC-014's final rule now calls a sharing link an address. | Addressed in the draft |
| RR2-01 | Product decision | The user required the registration email and password, one non-revealing failure, and last-finished precedence with verification. Recorded as DEC-049. | Decided, not re-reviewed |
| RR2-02 | Product decision | The user kept an earlier absence or detachment through a later series save, and kept completed account deletion ahead of a save. Recorded as DEC-050. | Decided, not re-reviewed |
| RR2-03 | Product decision | The user gave registration and the start of recovery one non-revealing result. Recorded as DEC-051. | Decided, not re-reviewed |
| RR2-04 | Product decision | The user identified an absence by the original start instant and kept new weekday occurrences. Recorded as DEC-052. | Decided, not re-reviewed |
| RR2-05 | Product decision | The user counted 90 calendar dates and included past, in-progress, and partial far-boundary overlaps. Recorded as DEC-053. | Decided, not re-reviewed |
| RR2-06 | Product decision | The user applied visibility and text together in one series save and kept the started occurrence's time. Recorded as DEC-054. | Decided, not re-reviewed |
| RR2-07 | Product decision | The user used the retained-Event list for removal and ended that list entry on rejoin. Recorded as DEC-055. | Decided, not re-reviewed |
| RR2-08 | Product decision | The user showed another viewer the viewer's timezone and labeled it. Recorded as DEC-056. | Decided, not re-reviewed |
| RR2-09 | Product decision | The user skipped a generated gap and kept skipped or unchosen occurrences after a timezone change. Recorded as DEC-057. | Decided, not re-reviewed |
| RR2-10 | Product decision | The user compared a detached occurrence when the series is saved. Recorded as DEC-058. | Decided, not re-reviewed |
| RR2-11 | Product decision | The user made four ended sharing links open no Calendar and show no Event. Recorded as DEC-059. | Decided, not re-reviewed |
| RR2-12 | Product decision | The user placed acceptance and decline in the invited account and hid email from the member lists. Recorded as DEC-060. | Decided, not re-reviewed |
| RR2-13 | Product decision | The user ended open sessions when recovery completed and required a later login. Recorded as DEC-061. | Decided, not re-reviewed |
| RR2-14 | Product decision | The user removed outer whitespace before storing a non-empty nickname. Recorded as DEC-062. | Decided, not re-reviewed |
| RR2-15 | Product decision | The user required team transitions to finish entirely or leave the prior state. Recorded as DEC-063. | Decided, not re-reviewed |
| RR2-16 | Product decision | The user required login before search and returned nobody for no-match and empty search. Recorded as DEC-064. | Decided, not re-reviewed |
| RR2-17 | Product decision | The user bounded the monthly preview to month types and dates inside 90 calendar dates. Recorded as DEC-065. | Decided, not re-reviewed |
