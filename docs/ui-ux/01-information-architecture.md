# Information Architecture

- Stage: 1 — Information Architecture, User Flows, and Screen Inventory
- Date: 2026-11-20
- Status: Accepted by the user on 2026-11-20 as the structural baseline. This acceptance does not approve visual design, tokens, or wireframes.
- Authority: approved PRD (DEC-011); approved Technical Design, including TD-001 through TD-004 and C-01 option A recorded on 2026-11-20; `docs/ui-ux/00-design-requirements.md`.
- Sequencing reference only: `docs/technical/10-implementation-plan.md`. It is not a confirmed baseline and does not add or remove a destination.
- No independent UI/UX review was run for this stage.

## 1. Navigation principles

- One desktop window is one session. Another session is another window, not a second team and not another computer.
- What a window can show is the projection for its bound email. The window does not receive the stored document and then hide fields.
- Navigation stays inside that projection. An invitee does not get member destinations. An active-team `no-access` projection does not get a create-team destination.
- The product purpose is to see when current members are busy or free, using their schedule events. The member destination therefore keeps the busy/free board and the visible events in one workspace.
- Maintainer actions appear only when the projection says that actor is the maintainer. They are not a separate application.
- Version 1 has no Website, Admin, API, login, settings, theme, calendar, dashboard, profile, or notification-center destination.
- There is no zone destination. C-01 option A: the window shows the one operating-system zone supplied with the projection. The operator cannot choose another zone.

## 2. Proposed structure

This structure is proposed for acceptance. Accepting it would replace the earlier candidate tree that included a calendar-like view.

```text
Desktop window (one session)
├── Unbound
│   └── S-01 Bind this session
├── Bound, record absent or dissolved
│   └── S-02 Create the team
├── Bound, record active, invite projection
│   └── S-03 This invite only
├── Bound, record active, no-access projection
│   └── S-04 No team access
├── Bound, record active, member projection
│   └── S-05 Team workspace
│       ├── Busy/free at one instant
│       ├── Visible events
│       └── Maintainer actions, only if this actor is the maintainer
├── Event task, reached from S-05
│   └── S-06 Create or edit one event
│       └── Occurrence choice is a state of S-06, not another destination
└── Shell notices, not team destinations
    ├── S-07 Record unreadable
    └── S-08 Writer already exists (shown by the process that owns the window)
```

`Open another session` is available from the shell of a running window. It opens a new unbound window. It does not carry the current email or the unsent edit.

## 3. Role-aware destinations

| Projection | Destinations the window may show | Destinations it does not show |
|---|---|---|
| Unbound | S-01 | Team data, create, invite, events, busy/free |
| Absent or dissolved, and bound | S-02 | Roster, events, invites, busy/free |
| Active invite | S-03, that invite only | Roster, events, busy/free, other people's invites |
| Active no-access | S-04 | Create, roster, events, invites, busy/free |
| Active member | S-05 and, while editing, S-06 | Another member's only-self events; pending invites unless this actor is the maintainer |
| Active member who is the maintainer | S-05 maintainer actions, plus custody edit in S-06 for a retained team-visible event whose owner is not a current member | A visibility change for that retained event; removing or designating self |
| Sole member | Dissolve action inside S-05 | Dissolve while another member remains |

A removed email stays on its open session. The next projection is S-04, or S-03 if a pending invite already exists for that same email. The window is not retargeted to another email.

## 4. What is in the member workspace

S-05 is one workspace with three regions:

1. Busy/free. One row for each current member. The instant under view starts at the current time and can be moved to an event start or end. The viewer's row counts that viewer's team-visible and only-self events. Every other row counts only that member's team-visible events. Coverage is half-open. Ended events do not make the current instant busy.
2. Visible events. Every team-visible event in full, including events that ended and events created before this member joined, plus this member's own only-self events. Each row carries the event id used to edit or delete. Pending invites appear in this workspace only for the maintainer, and each entry is the invited email.
3. Actions the projection allows. A current member can start S-06 for a new event or for an event that member may edit. The maintainer can invite, cancel one pending invite, designate another current member, and remove another current member. The sole member can dissolve. Ordinary members can attempt none of those roster actions; a rejected attempt stays on S-05 and leaves the record unchanged.

S-06 collects visibility, title, location, description, start, and end for one event. Create requires visibility and title. Modify omits a clock field unless that field was edited or an occurrence is being supplied for it. The successful path has no recurring control and no all-day control. The read-only zone name is the projection zone.

## 5. Structural choices proposed for acceptance

| Choice | Proposal | Not chosen in this draft |
|---|---|---|
| Member landing | S-05 opens on the busy/free region, with visible events in the same workspace. | A separate calendar product, or a schedule-only landing. |
| Event editing | S-06 is a task destination reached from S-05. Closing it without a successful command returns to S-05 and keeps the stored event. | A second stored copy of the event on the board. |
| Maintainer tools | They are a region of S-05, shown only for the maintainer. | A separate administration application. |
| Destructive confirmation | Not a destination. On 2026-11-20 the user required an in-place confirmation before delete, remove, and dissolve. | A separate confirmation screen. The PRD does not require one. |

## 6. Excluded destinations

| Excluded | Reason |
|---|---|
| Calendar | Not required by the PRD. Events are a list of permitted events, not a date grid. |
| Zone picker | C-01 option A and the approved technical contract. |
| Login, mailbox proof, settings, theme | Outside Version 1. |
| Website, Admin, API screens | Not Version 1 UI surfaces. |
| Reminder or notification center | AC-027. |
| Second-process workspace | The process that does not hold the lock exits. It has no destinations. |

## 7. Open point that is not decided here

Q-04 was closed by the user on 2026-11-20. Delete, remove, and dissolve confirm on the same surface before the command is sent. That step adds no destination and no product rule.
