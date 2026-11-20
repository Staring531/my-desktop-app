# UI/UX Handoff

- Stage: 9 — Handoff
- Date: 2026-11-20
- Status: Prepared after the user accepted the UI/UX design package on 2026-11-20. This handoff does not authorize application code, dependency installation, or an edit to the Implementation Plan.
- The user accepted the plan delta and authorized implementation on 2026-11-20. The delta is IMP-022 in `docs/technical/10-implementation-plan.md`. Deployment remains unauthorized.

## 1. What is accepted

The user accepted these presentation and interaction documents on 2026-11-20:

| Document | Role |
|---|---|
| `01-information-architecture.md` | Accepted structure. One window is one session. |
| `02-user-flows.md` | F-01 through F-09. |
| `03-screen-inventory.md` | S-01 through S-08. |
| `04-wireframes.md` | Low-fidelity structure. |
| `05-visual-design.md` | Direction L applied with the token baseline. |
| `06-interaction-specifications.md` | I-01 through I-15. |
| `12-page-specifications.md` | Page composition. |
| `10-design-tokens.md` and `tokens/design-tokens.json` | Approved token baseline, plus the later field-border addition. |
| `11-component-specifications.md` | C-01 through C-09. |

English files are canonical. Matching `-zh.md` files are translations. Where a translation lags, follow the English file.

## 2. Decisions that bind the renderer

- One light theme. No theme control, navigation rail, calendar, zone picker, recurring control, or all-day control.
- Pages use semantic or component tokens. The only named exception is EX-01, the 1 px region rule. Input borders use `semantic.color.border-field`.
- A failed command shows its result code. C-08 does not add a success sentence. Success redraws from the projection.
- Clock entry is one line, `YYYY-MM-DD HH:mm`. A blank or unmatched line is not sent and shows `invalid-local-time`.
- Dismissing Earlier or Later returns to S-05 and discards the unsent edit.
- Remove, delete, and dissolve use I-15. The first press does not send. The confirming danger button sends. Cancel restores the original button and writes nothing. There is no dialog.
- Edit appears only when that actor may change the event. Title, location, and description of every visible event stay on the S-05 row.
- `record-unreadable` shows S-07 and does not open create-team. `second-instance` focuses the existing window and shows C-09.

## 3. Proposed plan delta

Not applied. `docs/technical/10-implementation-plan.md` still says IMP-020 stops at bind, another session, one event, an occurrence choice, and `busyAt`, and that a visual design beyond those operations is out of scope.

The domain tasks already cover create-team, invite, maintainer, removal, dissolution, and event commands. The gap is the renderer.

Proposed addition, after IMP-020 and before IMP-021:

- Implement S-01 through S-08 and I-01 through I-15 from the accepted UI documents.
- Map the token JSON to plain CSS custom properties in the desktop renderer. Install no token compiler and no component library.
- Keep the renderer import limited to `busyAt`.
- Extend IMP-021's prerequisite list to include that renderer task.
- Remove the sentence that puts a visual design beyond IMP-020's original operations out of scope, replacing it with the accepted UI package.

Until this delta is explicitly accepted, implementation of those extra surfaces is not authorized by the plan.

## 4. Still not authorized

Application code, dependency installation, and edits to the PRD, Technical Design, or Implementation Plan. A further independent re-review of the post-review corrections and I-15 has not been run.
