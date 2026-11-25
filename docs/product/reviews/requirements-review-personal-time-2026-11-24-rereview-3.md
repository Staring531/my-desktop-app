# Requirements re-review 3: personal time management

- Date: 2026-11-24
- Reviewer: independent requirements reviewer
- Scope: baseline after DEC-066 through DEC-073
- Prior review: `docs/product/reviews/requirements-review-personal-time-2026-11-24-rereview-2.md`
- Result: no CRITICAL findings. DEC-066 through DEC-073 close the weekly deletion, detachment, timezone-choice, revoked-link, and unfinished-save cases. Three gaps remain.

The reviewer returned findings only. The disposition at the end is the primary session's classification.

## Findings

### RR4-01

- **Severity:** MEDIUM
- **Related requirement/decision:** DEC-067, DEC-052, DEC-019
- **Problem:** A deleted date stays empty after a later clock-time change only when the weekday stays the same. A daily or monthly series can still change its clock time, and the new time is a different instant from the stored absence.
- **Concrete scenario:** A daily Event at 09:00 has 12 May deleted. The creator later saves the series as 15:00–16:00. A monthly series does the same for the 12th.
- **Impact:** 12 May at 15:00 can appear, or that date can stay empty.
- **Suggested resolution:** State the result for a deleted daily date and a deleted monthly date.
- **User decision required:** yes

### RR4-02

- **Severity:** MEDIUM
- **Related requirement/decision:** DEC-066, DEC-051
- **Problem:** Completion requires a one-time proof sent to the verified email. No rule states which action sends that proof. Starting recovery still shows one result for a verified account, an unknown email, and an unverified registration.
- **Concrete scenario:** A verified user starts recovery, sees the same result as an unknown email, and has no stated way to receive the proof.
- **Impact:** Recovery can have no stated source for the proof, or a separate send step can reveal that the account exists.
- **Suggested resolution:** State that starting recovery sends the proof only for a verified account and sends nothing for an unknown email or an unverified registration, without changing the shared start result.
- **User decision required:** yes

### RR4-03

- **Severity:** MEDIUM
- **Related requirement/decision:** DEC-066
- **Problem:** Reuse of the same proof fails. Nothing states whether a later proof makes an unused earlier proof invalid. The proof lifetime remains OPEN in DEC-023.
- **Concrete scenario:** A verified user receives proof A, starts recovery again, receives proof B, and completes with proof A.
- **Impact:** Proof A can still set the password, or it can fail and leave the password unchanged.
- **Suggested resolution:** State whether a new proof makes every unused earlier proof no longer valid.
- **User decision required:** yes

## Residual observations

These are not findings.

- DEC-066 through DEC-073 close RR3-01 through RR3-08, including the three parts of RR3-06.
- Editorial closures RR3-03, RR3-04, and RR3-09 match the current text.
- DEC-023, team-account deletion, the number of personal Calendars, technology selection, session length, and stopping future repeats while keeping history remain open on purpose.

## Primary-agent disposition

| ID | Classification | Action | Status |
|---|---|---|---|
| RR4-01 | Product decision | The user kept a deleted daily date and a deleted monthly date empty after a clock-time change. Recorded as DEC-074. | Decided, not re-reviewed |
| RR4-02 | Product decision | The user sent the one-time proof when recovery starts, and only to a verified account. Recorded as DEC-075. | Decided, not re-reviewed |
| RR4-03 | Product decision | The user made an unused earlier proof invalid when a later proof is sent. Recorded as DEC-076. | Decided, not re-reviewed |
