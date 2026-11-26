# Gate 1 proposal: Personal Time website

- Status: The user approved both openable pages on 2026-11-25, named Agenda as the website token source, and approved the Agenda token baseline the same day. Editorial remains an approved page and is not the token source. `tokens/design-tokens.json` holds the approved Agenda values. The website stylesheet still implements the previous baseline.
- Stage: 2 — Visual Direction, User Approval Gate 1, under `docs/process/UI_UX_DESIGN.md` version 2.1.0.
- Primary screen: S-07 Own Calendar. Both pages use a sample body after a range has returned. They do not choose the initial `from` and `to`. Q-04 stays open.
- Returned fields stay as returned: `visibility`, `state`, `title`, `displayName`, `date`, `location`, `description`, `start`, `end`, and the two `instants` on `choice_required`. The pages do not recompute an instant or invent a weekday.
- Colors on these pages are provisional. They are not tokens.
- No application code is part of this proposal.

## 1. Agenda

| Field | Record |
|---|---|
| File | `docs/ui-ux/personal-time/previews/gate1-agenda.html` |
| Family | Personal agenda list |
| Source | Fantastical public product site, `https://flexibits.com/fantastical` |
| Adopted | One row per occurrence. The title and the quiet action share a line. Returned start and end sit on a meta line. A day label uses the returned `date`. One accent marks the selected row and the ready primary button. |
| Excluded | Flexibits name, logo, icon, natural-language entry, month grid, and brand color. |
| Posture | A working list. The range form is a tool row above the list. |
| Type | One system sans. Title, body, and meta are three sizes. |
| Color | Warm paper, dark text, one terracotta accent. Visibility and state keep their words. |
| Motion | None. |

## 2. Editorial

| Field | Record |
|---|---|
| File | `docs/ui-ux/personal-time/previews/gate1-editorial.html` |
| Family | Cultural events listing |
| Source | Serpentine Galleries public events index, `https://www.serpentinegalleries.org/whats-on/` |
| Adopted | The occurrence title is the largest text in the row. Facts share one meta line. Regions separate by space and a hairline. The primary action is text with an underline. |
| Excluded | Serpentine name, logo, photography, tickets, and exhibition marketing. |
| Posture | A set contents page. The task title dominates. Actions sit with the text they affect. |
| Type | A serif for the task title and occurrence titles. A sans for fields, meta, and actions. |
| Color | Warm paper and ink. No filled accent. Selection is a heavy rule. |
| Motion | None. |

## 3. Decision

The user approved both pages on 2026-11-25. Later the same day the user named Agenda as the website token source. Editorial remains an approved page and is not the token source. The user approved the Agenda extraction on 2026-11-25. `tokens/design-tokens.json` is that baseline. The website stylesheet still implements the previous baseline.
