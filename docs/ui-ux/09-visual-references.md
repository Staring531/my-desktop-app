# Visual References and Direction Proposals

- Stage: 2 — Visual Direction, User Approval Gate 1
- Date: 2026-11-20
- Status: Direction L accepted by the user on 2026-11-20. Directions P and C are not selected. This acceptance does not approve token values. Proposed tokens are in `10-design-tokens.md` and are not approved.
- Structural baseline: accepted by the user on 2026-11-20 in `01-information-architecture.md`, `02-user-flows.md`, and `03-screen-inventory.md`.
- This session did not fetch or store screenshots. The reference URL is the public site already named by `docs/process/UI_UX_DESIGN.md`. No Linear asset is embedded or copied.
- No independent UI/UX review was run.

## 1. What this gate decides

The user chose Direction L on 2026-11-20. That choice authorizes a token and component proposal. It does not approve those values, and it does not authorize wireframes or high-fidelity pages.

All three directions below are light-surface only. None adds a theme preference, a dark theme, a command palette, or a new product surface.

Busy and free, and team-visible versus only-self, must stay understandable without color alone. That constraint is already required and is not a token.

## 2. Reference record

| Field | Record |
|---|---|
| Source | Linear, public product site `https://linear.app` |
| Capture | Not captured in this session. No screenshot file is stored in the repository. |
| Role | Reference family named by the workflow: restrained, precise, information-dense desktop tooling. |
| Observable intent used here | Compact lists, quiet surfaces, a clear split between a small set of actions and a dense record, subtle separation rather than heavy cards. |
| User decision | ACCEPTED on 2026-11-20 as the reference family for Direction L. The product does not adopt Linear's brand. |

Characteristics proposed for adoption if Direction L is chosen:

- One calm surface for the whole window, with regions separated by alignment and light rules rather than by boxed cards.
- Dense but readable rows for members and events, because S-05 is a board plus a list.
- One accent reserved for the current action or selection, not for busy versus free.
- Short, quiet result text on the surface that sent the command.

Characteristics to avoid in every direction:

- Linear's name, logo, wordmark, and proprietary brand color as if they were this product's identity.
- A left rail of projects, issues, cycles, or inbox. This product has no such objects.
- A command palette, keyboard-shortcut product, or integration gallery.
- Dark mode or a theme switch. The approved scope has no theme preference.
- Color as the only signal for busy, free, only-self, or failure.

## 3. Direction L — Quiet instrument

Recommendation: choose this one. It is Linear-inspired and is not a Linear clone.

| Topic | Direction |
|---|---|
| Posture | A desktop instrument for one team. The window is mostly the workspace, not a marketing frame. |
| Density | Compact rows. A member list and an event list can share S-05 without a second navigation product. |
| Hierarchy | The current region title, then the row content, then the result of the last command. Maintainer actions stay secondary to the board. |
| Surfaces | Light neutral field. Separation by space and hairline rules. Little or no shadow. |
| Color strategy | Neutral text and surfaces. One accent for the primary action and the selected row only. Busy, free, only-self, and errors also use words or marks. |
| Typography | One sans family. Titles, row text, and meta text are three roles. No display type. Exact faces and sizes wait for Stage 3. |
| Iconography | A small set of simple marks for busy, free, only-self, and team-visible, each with a text label. No illustrative icons. |
| Motion | Almost none. A result appears in place. No entrance choreography. |
| Fit | S-05 and S-06 are the surfaces that benefit. S-01 through S-04 stay the same system with less density. |

## 4. Direction P — Open paper

| Topic | Direction |
|---|---|
| Posture | A quiet document. More empty field, fewer rows on screen, larger headings. |
| Density | Loose. The board shows fewer members before the operator must move. |
| Hierarchy | Page title dominates. Actions sit away from the list. |
| Surfaces | Warm neutral paper. Regions are bands of the same field, not cards. |
| Color strategy | Almost no accent. Links and the primary action use the same dark text with an underline or a plain button. Status is textual. |
| Typography | A readable text face for rows and a distinct heading face. Exact faces wait for Stage 3. |
| Iconography | Prefer words. Marks only where a row would otherwise be ambiguous. |
| Motion | None. |
| Fit | Comfortable for S-01, S-02, and S-06. Weaker for a full busy/free board, which is the product's main view. |

## 5. Direction C — Marked ledger

| Topic | Direction |
|---|---|
| Posture | A ruled table. The board looks like a ledger first and a form second. |
| Density | High, but with heavier rules than Direction L so each row is boxed by lines. |
| Hierarchy | Column labels are as strong as the data. The event list uses the same table grammar. |
| Surfaces | White field, dark text, visible horizontal and vertical rules. No shadow. |
| Color strategy | No accent hue. Selection is a heavier rule or a marker character. Busy and free are words plus a filled or open mark. |
| Typography | Tabular figures for times. One plain sans. Exact faces wait for Stage 3. |
| Iconography | Marker characters and short words, not a pictorial icon set. |
| Motion | None. |
| Fit | Strong for comparing instants and members. Heavier than the event form needs, and less quiet than the invite and no-access surfaces. |

## 6. Shared constraints

- The accepted structure stays: S-01 through S-08, one window per session, one operating-system zone, no calendar and no zone picker.
- Q-04 is still open. None of these directions adds a confirmation style.
- Sample hues are intentionally absent so they cannot be mistaken for tokens.
- `docs/ui-ux/tokens/design-tokens.json` is not updated in this stage.

## 7. Decision requested

The user chose L on 2026-11-20. P and C are not the selected direction. Token values remain a separate proposal in `10-design-tokens.md`.
