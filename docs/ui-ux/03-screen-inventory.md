# Screen Inventory

Candidate inventory only; inclusion does not constitute approval.

| ID | Candidate surface | Actor | Purpose | States | Traceability |
|---|---|---|---|---|---|
| UI-01 | Session / team entry | Operator | Bind allowed email context | Initial, invalid, success, no access | TD-002 |
| UI-02 | Create team | Eligible operator | Create the one team | Empty, validation, saving, success, error | BR-1; AC-001–003, AC-050 |
| UI-03 | Pending invitation | Invitee | Review own invitation | Pending, submitting, accepted, declined, unavailable | BR-2; AC-004–008 |
| UI-04 | Busy/free board | Current member | View members' busy/free state | Loading, populated, empty, error | BR-6; AC-016–018, AC-040, AC-042, AC-045 |
| UI-05 | Member/event detail | Member/maintainer | Inspect permitted team-visible events | Populated, empty, no access | BR-4/5 |
| UI-06 | Own schedule | Current member | View own events | Loading, populated, empty, error | BR-4 |
| UI-07 | Create/edit event | Member; maintainer only for permitted retained events | Enter/save one event | Pristine, dirty, validation, ambiguous/nonexistent time, saving, success, error | BR-4/5; AC-012–015, AC-028, AC-036–037, AC-043–046 |
| UI-08 | Member management | Maintainer | Invite, cancel, transfer, remove | Populated, pending, confirm, success, failure | BR-2/3/5 |
| UI-09 | Dissolve confirmation | Sole member | Confirm dissolution | Confirm, submitting, success, failure | BR-3/5; AC-022–023, AC-039, AC-049 |
| UI-10 | Operation feedback | Applicable actor | Communicate command outcome | Success, validation, denied, operation error | BR-7; AC-024–027, AC-031, AC-035 |

## Rules
Merge/split only after evaluating task continuity and accessibility. Record excluded candidates and reasons. Every approved screen maps to a PRD requirement or is justified as a necessary shell/state. Do not add dashboard, settings, profile, authentication, or notification-center surfaces without approved requirements.
