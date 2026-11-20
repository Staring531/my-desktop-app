# Screen Inventory

- Stage: 1 — Information Architecture, User Flows, and Screen Inventory
- Date: 2026-11-20
- Status: Accepted by the user on 2026-11-20 with the structural baseline. This inventory replaces the earlier UI-01 through UI-10 candidate list, including its calendar implication and its required dissolve-confirmation surface. Acceptance is not a wireframe or a visual design.
- No layout, color, type, or component size is specified. Wireframes are Stage 4, after the structural baseline and the visual-system gates.

## 1. Surfaces

| ID | Surface | Actor | Entry | Exit | Purpose | States | Trace |
|---|---|---|---|---|---|---|---|
| S-01 | Bind session | Operator of this window | New window, or unbound session | Bound session, or still unbound | Enter the email for this session | Empty, unusable email, rejected bind, bound | TD-002 |
| S-02 | Create team | Bound email while the record is absent or dissolved | Projection `record` is absent or dissolved | S-05 after a new team, or S-02 unchanged | Create the one team from the bound email | Ready, rejected email, team already active, created | BR-1; AC-001, AC-002, AC-003, AC-050 |
| S-03 | This invite | Email with a pending invite, not a current member | Active projection is `invite` | S-05 after accept; S-04 after decline when no access remains; S-03 if the command fails | See and accept or decline only that invite | Pending, submitting, accepted, declined, no matching invite | BR-2; AC-004, AC-005, AC-030, AC-032, AC-034, AC-036 |
| S-04 | No team access | Bound email that is not a member and has no pending invite, while a team is active | Active `no-access` projection | S-03 if a later invite for this email is projected | Show that this email cannot see the team | No access | BR-5; AC-015, AC-019 |
| S-05 | Team workspace | Current member | Active `member` projection | S-06 while an event task is open; S-04 or S-03 after this email loses membership; S-02 after this sole member dissolves | Busy/free, permitted events, and allowed roster actions | Populated, member with no events, rejected roster action, membership lost | BR-2, BR-3, BR-4, BR-5, BR-6; AC-006 through AC-011, AC-016 through AC-019, AC-023, AC-033, AC-038 through AC-042, AC-045, AC-047 |
| S-06 | One event | Current member; maintainer only for a retained team-visible event whose owner is gone | S-05 opens create or an event id the actor may edit | S-05 after success, cancel, or rejection | Enter one event and submit a save or delete | Pristine, edited, validation failure, nonexistent time, ambiguous time, custody rejection, saved, canceled | BR-4, BR-5; AC-012 through AC-015, AC-020, AC-021, AC-028, AC-029, AC-037, AC-043, AC-044, AC-046, AC-048, AC-049, AC-051 |
| S-07 | Record unreadable | Operator of the owning process | The file exists and is not valid version 1 | Stay until a later approved repair exists; Version 1 has no repair | Stop the team UI without creating a replacement team | Unavailable | BR-7 |
| S-08 | Writer already exists | Operator looking at the existing window | The owning process receives `second-instance` | The notice can be dismissed; the record is unchanged | Say that a writer already exists, on the window that was focused | Notice | BR-7 |

S-06's ambiguous-time question is a state of S-06. It is not a separate surface. The first ambiguous field is start when both start and end are ambiguous.

S-08 is not shown by the process that failed to take the lock. That process exits.

## 2. Commands each surface may send

| Surface | May send | Must not send |
|---|---|---|
| S-01 | `bind` with the requested email; shell request to open another session | Actor, zone, generation, team commands before a successful bind |
| S-02 | `createTeam` | An email, a zone, or a generation |
| S-03 | `acceptInvite`, `declineInvite` | Roster or event commands |
| S-04 | None that write | `createTeam`, event commands |
| S-05 | Invite, cancel, designate, remove, dissolve, and open S-06, only where the projection allows the actor | Another session's projection; a pending address when the actor is not the maintainer |
| S-06 | `createEvent`, `modifyEvent`, `deleteEvent` for the open event | A renderer-created event id; a zone; a clock field the operator did not edit, except the field whose occurrence was just requested |
| S-07, S-08 | None that write | A replacement team or a second writer |

## 3. Surfaces not in this inventory

| Earlier candidate or idea | Disposition |
|---|---|
| UI-06 calendar-like own schedule | Not carried forward. Permitted events are the event region of S-05. |
| UI-09 dissolve confirmation | Not a separate surface. On 2026-11-20 the user required a confirmation step on S-05 for remove and dissolve, and on S-06 for delete. |
| UI-10 operation feedback as its own screen | Not a destination. The issuing session shows the result on the surface that sent the command. |
| Zone settings | Excluded by C-01 option A. |
| Dashboard, settings, profile, login, notification center | Excluded. No approved requirement. |

## 4. Sequencing note

IMP-020 names bind, another session, one event, an occurrence choice, and `busyAt`. S-03, the maintainer actions on S-05, and dissolve are required by the PRD and are included here. They are outside that task's named renderer list. The Implementation Plan was not changed. If this inventory is accepted, the later readiness review can propose a plan delta for those surfaces. That delta is not written in this stage.

## 5. Acceptance map

Every AC-001 through AC-051 is either in the trace column above or in the flow coverage table in `02-user-flows.md`. AC-027 has no surface. AC-024 and AC-025 are updates to whichever surface is already open, not new surfaces. AC-042's label uses the one zone shown on S-05 and S-06.
