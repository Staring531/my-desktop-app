# Agenda Token Proposal: Personal Time

- Stage: 3 — Design Tokens and Core Component System, User Approval Gate 2
- Date: 2026-11-25
- Status: Approved by the user on 2026-11-25. `tokens/design-tokens.json` is the canonical copy. `apps/website/app/globals.css` still implements the previous baseline until a separate implementation authorization.
- Source page: `previews/gate1-agenda.html`
- Machine-readable proposal: `tokens/design-tokens.agenda.json`
- Editorial stays an approved page. It is not a source for these values.
- This file does not replace `10-design-tokens.md`.

## 1. What was read

Values come from rules on the Agenda page. The banner background is proposal chrome and is not a token. Body weight is 400 because the page does not set another weight on body text. No failure color, shadow, or motion duration appears on the page, so none is added. The page stacks the tool row and the occurrence row below 640 px.

| Page rule | Proposal token |
|---|---|
| Page paper `#f3f1ec` | `semantic.color.canvas` |
| Ink `#1c1917` | `semantic.color.text-primary` |
| Muted `#57534e` | `semantic.color.text-meta` |
| Hairline `#e4e0d8` | `semantic.color.border-hairline` |
| Field `#fffcf7`, edge `#c8c2b6` | `semantic.color.surface`, `semantic.color.border-field` |
| Accent `#9a3412` | `semantic.color.action-primary`, focus, and the selected-row mark |
| Selected wash `#f3e6dc` | `semantic.color.selection-wash` |
| White on the primary button | `semantic.color.text-on-action` |
| Task title 22/28, weight 650, tracking `-0.02em` | `component.page.title-*` |
| Occurrence title 16/22, weight 650 | `component.row.title-*` |
| Body 15/22 | `semantic.font.body-*` |
| Quiet action 14 | `component.button.quiet-size` |
| Day label 12/16, weight 650, tracking `0.04em` | `component.day.*` |
| Meta 12/18, facts 12/16, display name 13 | `semantic.font.meta-*`, `semantic.font.facts-line`, `semantic.font.name-size` |
| Control height 36, radius 6 | `component.field.height`, `component.button.height` |
| Column 760, facts column 132, selected bar 3 | `component.page.content-max`, `component.row.facts-size`, `component.row.selected-mark-width` |

Field padding-inline is `10px` on the page. It is `primitive.space.10`, used only by `component.field.padding-inline`.

## 2. Components visible on the page

| Component | What the page shows |
|---|---|
| Page | One column, task title, quiet links on the same header line |
| Field | Label above, 36 px box, 6 px radius, tabular figures |
| Primary button | Filled accent, white text, weight 600. Used when the range can be shown |
| Quiet action | Ink text at 14 px. Underline on hover. Focus ring of 2 px outside the control |
| Day | Returned `date`, tabular figures, hairline under the label |
| Row | Facts column, title and quiet action on one line, meta under the title. Selected row uses the wash and a 3 px accent bar |
| Choice | Returned instants as radio labels. Submit choice stays quiet on this page because none is selected |

Hover underline, focus-visible, and the selected row are the states present. Disabled, pending, error, and danger are not on this page, so this proposal does not invent colors for them.

## 3. Approval

The user approved these values on 2026-11-25. `tokens/design-tokens.json` now holds them. `apps/website/app/globals.css` still implements the previous baseline. Applying Agenda to the website waits for a separate implementation authorization.
