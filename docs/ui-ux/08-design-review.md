# UI/UX Design Review

- Stage: 7 — Independent Design Review Gate
- Date: 2026-11-20
- Status: The user accepted the UI/UX design package on 2026-11-20. A re-review on 2026-11-20 confirmed UX-REV-001, 003, 005, 006, 007, 010, 011, and 012. UX-REV-002, UX-REV-004, UX-REV-013, and UX-REV-014 were corrected afterward. I-15 was added after the user closed Q-04. Those later edits have not had a further independent re-review. This review did not itself approve the package. The user's acceptance does not authorize application code.
- Reviewer: independent read-only UI/UX design reviewer. Findings only. No runtime screenshot was checked.
- Stage 4 and Stage 5 were accepted by the user on 2026-11-20.

## Findings and disposition

| ID | Severity | Product decision | Disposition |
|---|---|---|---|
| UX-REV-001 | HIGH | No | Applied. Enter in the S-05 invite field activates Invite. |
| UX-REV-002 | HIGH | No | Applied. Any focused button activates on Enter and Space. After a command is sent, Escape and Cancel wait for the result. |
| UX-REV-003 | HIGH | No | Applied. Edit appears only when this actor may change the event. Title, location, and description stay on the S-05 row, so another member can read the full event without a write control. |
| UX-REV-004 | HIGH | No | Corrected. A pushed projection refreshes S-05. An open S-06 keeps its unsent edit while this session still has access, including when custody ends. Loss of access or dissolution replaces S-06, and a later rejection is shown without the event fields. An unchanged failed save stays on S-06. |
| UX-REV-005 | HIGH | No | Applied. The page does not compare instants. Empty title and end-not-after-start are returned codes. A blank or unmatched clock is not sent and shows `invalid-local-time`. Visibility still uses the local sentence in I-09. |
| UX-REV-006 | HIGH | No | Applied. Custody clocks use the same Change start and Change end presentation as creator edit. |
| UX-REV-007 | HIGH | No | Applied in the component spec. C-08 shows the result code and has no success sentence. The specimen is `unusable-email`. |
| UX-REV-008 | MEDIUM | Yes | Closed by the user on 2026-11-20. Dismissing the ambiguous choice returns to S-05 and discards the unsent edit. |
| UX-REV-009 | MEDIUM | Yes | Closed by the user on 2026-11-20. Remove, delete, and dissolve confirm in place before the command is sent. Specified as I-15. |
| UX-REV-010 | MEDIUM | No | Applied. Input border is `semantic.color.border-field` (`#6B7280`), about 4.8:1 on white. Region hairlines stay `#D0D5DB`. This is a token addition after the approved baseline. |
| UX-REV-011 | MEDIUM | No | Applied. `record-unreadable` shows S-07, including from bind, and does not open S-02. `second-instance` focuses the existing window. The Implementation Plan was not edited. |
| UX-REV-012 | LOW | No | Applied. C-06 cites `component.mark.size`. The member row's primary text is the roster email. |
| UX-REV-013 | MEDIUM | No | Applied after re-review. An event row shows title, location, and description in full and keeps description newlines. |
| UX-REV-014 | MEDIUM | No | Applied after re-review. Focus stays on the activated control. If that control is gone, focus moves to the next remaining control, or to the surface heading. |

The reviewer's evidence, scenarios, and recommendations are the source of these dispositions. Severity was not changed.

## Decisions recorded on 2026-11-20

1. UX-REV-008. Dismissing Earlier or Later leaves S-06 and discards the unsent edit.
2. UX-REV-009. Q-04 is closed. Remove, delete, and dissolve show an in-place confirmation. The confirming danger button sends the command. Cancel restores the original button and writes nothing.

## Stage 8 readiness

The accepted package maps AC-001 through AC-051 through `02-user-flows.md` and `06-interaction-specifications.md`. AC-027 has no reminder surface. UI commands follow the approved result codes and do not add a destination. The proposed plan delta is not part of this acceptance: IMP-020 names bind, another session, one event, an occurrence choice, and `busyAt`. S-03, maintainer actions, dissolve, custody edit, and I-15 are specified because the PRD and the user's confirmation decision require them. The Implementation Plan was not edited.

## Not changed

The approved PRD, Technical Design, and Implementation Plan were not edited. No application code was written.
