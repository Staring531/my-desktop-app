# Visual Validation

- Stage: 6 — Design-System and Visual Validation
- Date: 2026-11-20
- Status: Design-artifact checks recorded by the primary designer. This is not an independent review and not a runtime screenshot check.
- Package checked: `tokens/design-tokens.json`, `05-visual-design.md`, `06-interaction-specifications.md`, `04-wireframes.md`, `12-page-specifications.md`, `11-component-specifications.md`, `02-user-flows.md`.
- The user accepted Stage 4 and Stage 5 on 2026-11-20. These checks did not themselves approve the package.

## Evidence

| Check | Expected | Observed | Status |
|---|---|---|---|
| Token file | Approved light theme. Semantic and component aliases resolve. | `meta.status` is APPROVED and `tokenBaselineApproved` is true. Semantic colors, type, space, elevation, motion, and layer point at primitives. Component tokens point at semantic tokens or an approved primitive size. | PASS |
| Raw values on pages | Pages use semantic or component tokens, with exceptions named. | `05-visual-design.md` names EX-01 only: `primitive.size.rule` with `semantic.color.border-hairline`, because no semantic border-width exists. No other raw color, type size, or radius is introduced. | PASS |
| Component reuse | S-01 through S-08 use C-01 through C-09. No new component. | Each surface in `05-visual-design.md` names those components. Q-04 adds no dialog. | PASS |
| One primary action | One primary button on a surface. | Bind, Create team, Accept, and New event or Save are the primaries named for their surfaces. Invite, Decline, and maintainer actions stay quiet or danger. | PASS |
| States | Pending, rejection, success, empty, disabled, cancel, ambiguous time, unreadable record, second writer. | Section 4 of `05-visual-design.md` and I-01 through I-14. Pending changes the button verb and adds no spinner. Success redraws the projection and adds no toast. | PASS |
| AC coverage | AC-001 through AC-051 each have an interaction or a justified absence. | The coverage table names each id. The first review rejected a read path and a projection rule. Those sentences were revised after UX-REV-001 and UX-REV-003. | REVISED, re-review pending |
| Non-color status | Busy, free, team, and only-you are a mark plus a word. | C-06 words remain on the rows. The accent is limited to the primary button, focus ring, and selected-row mark. | PASS |
| Motion | Reduced motion is the same as the specified motion. | `semantic.motion.feedback` is 0 ms. No entrance motion is specified. | PASS |
| Window | Existing 1200 by 800 frame. Narrower windows keep one column. | `primitive.size.window-width` and `window-height` are cited. No new minimum or maximum is added. | PASS |
| Destructive confirmation | The user required an in-place confirmation before remove, delete, and dissolve. | I-15 specifies that step. The first press does not send. No dialog was added. | PASS |
| Scope | No theme, calendar, reminder, recurring, or all-day control. | Section 6 of `05-visual-design.md` and I-10. | PASS |
| Contrast certification | Design-time ratios are not a certified audit. | Ratios remain the notes in `10-design-tokens.md`. No rendered measurement was taken. | NOT CHECKED |
| Runtime screenshots | Deferred until coding is authorized. | No application code was run. | NOT CHECKED |
| Independent review | A separate read-only reviewer at the Design Review Gate. | First review returned UX-REV-001 through UX-REV-010. Design revisions are recorded in `08-design-review.md`. Re-review is pending. | REVISED |

## Recorded exceptions

- EX-01, the 1 px region rule, is the only token-layer exception.
- I-09 shows the local sentence "Choose Team or Only you." when Save is pressed with no visibility. The domain is not called. That sentence is not a result code. Empty bind and empty invite show the existing code `unusable-email` without sending.
- Clock entry `YYYY-MM-DD HH:mm` is the presentation of the approved civil-time object. It is not a new domain field.

## Plan alignment

The Implementation Plan was not edited. IMP-020 names bind, another session, one event, an occurrence choice, and `busyAt`. S-03, the maintainer actions on S-05, and dissolve are specified here because the PRD requires them. They remain outside that task's named renderer list. A plan delta can be presented at the readiness review. It is not applied in this file.

## Open item

Q-04 was closed by the user on 2026-11-20. The confirmation step is I-15. Dismissing an ambiguous-time choice still returns to S-05 and discards the unsent edit.
