# Information Architecture

- Status: Proposed; subject to user review.
- Scope: Version 1 desktop application only.

## Navigation principles
Keep navigation shallow and task-oriented. Make the single-team context clear. Expose actions according to approved actor permissions. Do not add Website, Admin, API, login, or sync destinations.

## Candidate structure
This is a proposal, not a final screen decision.

~~~text
Desktop application
├── Session / team entry
│   ├── Bind permitted email context
│   ├── Create team (absent or dissolved record)
│   └── Pending invitation (invitee)
└── Active team
    ├── Busy / Free board
    ├── Members
    │   ├── Member details / visible events
    │   └── Invitation management (maintainer)
    └── My schedule
        ├── Event list / calendar-like view
        └── Create / edit event
~~~

## Role-aware navigation
- Current member: busy/free board, own schedule, team-visible events, own event operations.
- Maintainer: member/invitation management, succession, removal, and only the retained-event actions allowed by the PRD.
- Invitee: only the pending invitation and accept/decline.
- Removed member: no active-team access; re-entry only through a later invitation.

## Open design choices
Decide whether the board is the landing view, how member events are surfaced, and whether event editing uses a modal, side panel, or dedicated screen. Present alternatives where the choice materially affects usability.
