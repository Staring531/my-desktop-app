# Requirements re-review 2: personal time management

- Date: 2026-11-24
- Reviewer: independent requirements reviewer
- Scope: baseline after DEC-049 through DEC-065
- Prior review: `docs/product/reviews/requirements-review-personal-time-2026-11-24-rereview.md`
- Result: no CRITICAL findings. Several closures are incomplete or left an earlier sentence in conflict.

The reviewer returned findings only. The disposition at the end is the primary session's classification.

## Findings

### RR3-01

- **Severity:** HIGH
- **Related requirement/decision:** DEC-051, DEC-026, DEC-023
- **Problem:** Starting recovery is non-revealing. Nothing states what the person submits to complete it, or what an unknown email or an unverified registration receives if completion is attempted. DEC-023 does not list recovery delivery.
- **Concrete scenario:** A person sees the same start result as an unknown email, then submits a new password. Separately, a person who does not control a verified inbox tries to complete recovery.
- **Impact:** Recovery may have no completable path, or a new password may be set without a stated proof.
- **Suggested resolution:** Record the completion proof and the non-revealing failure. Name any lifetime that remains open.
- **User decision required:** yes

### RR3-02

- **Severity:** HIGH
- **Related requirement/decision:** DEC-031, DEC-052
- **Problem:** An absence stores the original start instant. A later clock-time change on the same weekday is not specified.
- **Concrete scenario:** Wednesday 09:00 on 12 May is deleted. The creator later saves the series as Wednesday 15:00–16:00.
- **Impact:** 12 May 15:00 can appear, or that date can stay empty.
- **Suggested resolution:** State whether the new clock time is created on the deleted occurrence's date.
- **User decision required:** yes

### RR3-03

- **Severity:** MEDIUM
- **Related requirement/decision:** DEC-032, DEC-054, BR-P5
- **Problem:** A combined series save both updates a started occurrence's text and was still said to leave other content unchanged.
- **Concrete scenario:** A started occurrence is saved as public with a new title.
- **Impact:** Two current results for one save.
- **Suggested resolution:** Limit the unchanged-content sentence to a visibility-only save.
- **User decision required:** no

### RR3-04

- **Severity:** MEDIUM
- **Related requirement/decision:** DEC-026, DEC-019, DEC-020, DEC-030
- **Problem:** Earlier final rules still contradicted DEC-061, DEC-065, DEC-053, and DEC-058.
- **Concrete scenario:** A reader treats recovery completion as opening the Calendar.
- **Impact:** The decision log had two current statements.
- **Suggested resolution:** Narrow the earlier final rules. No new product choice.
- **User decision required:** no

### RR3-05

- **Severity:** MEDIUM
- **Related requirement/decision:** DEC-050
- **Problem:** A detachment that finishes after a series save wins, but the field values are not stated.
- **Concrete scenario:** One session detaches an occurrence as "Solo" at 09:00. A series save at 10:00 finishes first. The detachment then finishes.
- **Impact:** The detached occurrence can keep 09:00 or take 10:00.
- **Suggested resolution:** State which content the later detachment writes.
- **User decision required:** yes

### RR3-06

- **Severity:** MEDIUM
- **Related requirement/decision:** DEC-057, DEC-027, DEC-028
- **Problem:** An unchosen doubled start stays unchosen after a timezone change, but the offered instants are not stated when the time is no longer doubled. A completed choice and a skipped date are not stated across a later change.
- **Concrete scenario:** A doubled 01:30 start is waiting. The creator switches to a timezone where that clock time exists once.
- **Impact:** The choice can have no defined options, or a skipped date can return.
- **Suggested resolution:** Define the offered instants, whether a chosen instant survives a later timezone change, and whether a skipped date stays skipped after a series time change.
- **User decision required:** yes

### RR3-07

- **Severity:** MEDIUM
- **Related requirement/decision:** DEC-040, DEC-059
- **Problem:** A team link revoked while the creator remains a member is not one of DEC-059's four ended links.
- **Concrete scenario:** The team creator revokes one team link and stays the administrator. A visitor opens that address.
- **Impact:** The address can show nothing, an empty Calendar, or public Events.
- **Suggested resolution:** Give that revoked team link a visitor result.
- **User decision required:** yes

### RR3-08

- **Severity:** MEDIUM
- **Related requirement/decision:** DEC-061, DEC-050
- **Problem:** Recovery ends open sessions. A save already submitted but not finished has no result.
- **Concrete scenario:** A save is submitted, recovery completes, and the save then finishes.
- **Impact:** The save can be stored or discarded.
- **Suggested resolution:** State whether that save is kept if it finishes.
- **User decision required:** yes

### RR3-09

- **Severity:** LOW
- **Related requirement/decision:** DEC-062, AC-P33
- **Problem:** A first-delivery acceptance criterion required a nickname search.
- **Concrete scenario:** The first delivery is tested before search exists.
- **Impact:** The first-delivery boundary could include nickname search.
- **Suggested resolution:** Keep trimming in the first delivery. State the search match only in the later search rule.
- **User decision required:** no

## Residual observations

These are not findings.

- DEC-049 through DEC-065 close the other parts of RR2-01 through RR2-17.
- DEC-023, team-account deletion, the number of personal Calendars, technology selection, session length, and stopping future repeats while keeping history remain open on purpose.

## Primary-agent disposition

| ID | Classification | Action | Status |
|---|---|---|---|
| RR3-03 | Editorial | Visibility-only wording now leaves other content unchanged only when the save does not change text. | Addressed in the draft |
| RR3-04 | Editorial | DEC-026, DEC-019, DEC-020, and DEC-030 now follow the later decisions. | Addressed in the draft |
| RR3-09 | Editorial | Nickname search was removed from the first-delivery criterion. | Addressed in the draft |
| RR3-01 | Product decision | The user required a one-time proof sent to the verified email. Recorded as DEC-066. The proof lifetime stays OPEN in DEC-023. | Decided, not re-reviewed |
| RR3-02 | Product decision | The user kept a deleted date empty after a same-weekday clock-time change. Recorded as DEC-067. | Decided, not re-reviewed |
| RR3-05 | Product decision | The user kept the detachment's submitted content when it finished after a series save. Recorded as DEC-068. | Decided, not re-reviewed |
| RR3-06 | Product decision | The offered instants are DEC-069. A completed choice surviving a later timezone change is DEC-070. A skipped date staying skipped after a series time change is DEC-071. | Decided, not re-reviewed |
| RR3-07 | Product decision | The user gave a team link revoked while its creator remains the same empty result as a revoked personal link. Recorded as DEC-072. | Decided, not re-reviewed |
| RR3-08 | Product decision | The user discarded a save that was still unfinished when recovery completed. Recorded as DEC-073. | Decided, not re-reviewed |
