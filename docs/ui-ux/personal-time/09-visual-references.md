# Visual References and Direction Proposals: Personal Time

- Stage: 2 — Visual Direction, User Approval Gate 1
- Date: 2026-11-25
- Status: Direction L was accepted on 2026-11-25, and Directions P and C were not selected. Later the same day the user approved Agenda and Editorial, then named Agenda as the website token source. The user approved that extraction on 2026-11-25. `tokens/design-tokens.json` is the Agenda baseline. The website stylesheet still implements the previous baseline.
- Structural baseline: accepted by the user on 2026-11-25 in `01-information-architecture.md`, `02-user-flows.md`, and `03-screen-inventory.md`.
- This file does not replace `docs/ui-ux/09-visual-references.md`. Direction L accepted there on 2026-11-20 belongs to `docs/product/04-prd.md`. It does not select a direction for this product, and its tokens are not reused.
- This session did not fetch or store screenshots. No Linear asset is embedded or copied.
- No independent UI/UX review was run.

## 1. What this gate decides

The accepted website direction is Agenda. The user approved that openable page on 2026-11-25 and named it the token source. Editorial remains an approved page and is not the token source. Direction L was accepted earlier the same day under workflow 2.0.0 and is no longer the visual authority. Directions P and C were not selected. Agenda uses words for visibility and state. It does not adopt Direction L's geometric marks.

All three directions are light-surface only. None adds a theme preference, a dark theme, a command palette, or a destination outside S-01 through S-09.

Public and private, `scheduled`, `skipped`, and `choice_required` must stay understandable without color alone. A shared failure such as `login_rejected` must look the same on every screen that shows it. Those constraints come from the approved PRD and are not tokens.

## 2. Reference record

| Field | Record |
|---|---|
| Source | Linear, public product site `https://linear.app` |
| Capture | Not captured in this session. No screenshot file is stored in the repository. |
| Role | Reference family named by `docs/process/UI_UX_DESIGN.md`: restrained, precise, information-dense tooling. |
| Observable intent used here | Compact rows, quiet surfaces, a small set of actions separated from a dense record, subtle separation rather than heavy cards. |
| Attribution | The reference is the public site above. This product does not adopt Linear's name, logo, wordmark, or brand color. |

Characteristics proposed for adoption if Direction L is chosen:

- One calm field for the page. Regions separate by alignment and light rules rather than by boxed cards.
- Compact rows for occurrences on S-07, because that page shows a range of returned objects.
- One accent reserved for the current action or the selected row, not for visibility or occurrence state.
- The `result` of a command appears as short text on the page that sent it.

Characteristics avoided in every direction:

- Linear's name, logo, wordmark, and brand color used as this product's identity.
- A rail of projects, issues, cycles, or inbox. This product has none of those objects.
- A command palette, a marketing homepage, or an integration gallery.
- Dark mode or a theme switch. The approved scope has no theme preference.
- Color as the only signal for public, private, skipped, choice required, conflict, or failure.
- A month grid, a week grid, or any other choice of the initial `from` and `to`. Q-04 stays open. Wireframes come after this gate.

## 3. Direction L — Quiet instrument

Historical proposal. It is not the accepted direction. Its geometric marks are not adopted.

Historical recommendation, superseded by the Agenda page. It was Linear-inspired and was not a Linear clone.

| Topic | Direction |
|---|---|
| Posture | A browser instrument for one person's Calendar. The page is mostly the current task, not a promotional frame. |
| Density | Compact occurrence rows on S-07. S-01 through S-06 and S-09 stay short forms in the same system. |
| Hierarchy | The task title, then the fields or rows, then the `result` of the last command. Account and event actions stay secondary to the Calendar. |
| Surfaces | Light neutral field. Separation by space and hairline rules. Little or no shadow. |
| Color strategy | Neutral text and surfaces. One accent for the primary action and the selected row only. Visibility, occurrence state, conflicts, and failures also use words. |
| Typography | One sans family. Titles, row or field text, and meta text are three roles. No display type. Exact faces and sizes wait for Stage 3. |
| Iconography | Historical proposal: a small set of simple marks for public, private, skipped, and choice required, each with the word from the API state. The accepted Agenda page does not adopt those marks. |
| Motion | Almost none. A result appears in place. No entrance choreography. |
| Fit | S-07 and the conflict list on S-08 benefit. The unsigned forms stay quiet and do not become a separate marketing system. |

## 4. Direction P — Open paper

| Topic | Direction |
|---|---|
| Posture | A quiet document. More empty field, fewer rows visible at once, larger headings. |
| Density | Loose. S-07 shows fewer occurrences before the person moves the range. |
| Hierarchy | The page title dominates. Actions sit away from the rows. |
| Surfaces | Warm neutral paper. Regions are bands of the same field, not cards. |
| Color strategy | Almost no accent. The primary action uses the same dark text, with an underline or a plain button. Status is textual. |
| Typography | A readable text face for fields and rows, and a distinct heading face. Exact faces wait for Stage 3. |
| Iconography | Prefer words. A mark only where a row would otherwise be ambiguous. |
| Motion | None. |
| Fit | Comfortable for S-01 through S-06 and S-08. Weaker for S-07, which is the page the person returns to after login. |

## 5. Direction C — Marked ledger

| Topic | Direction |
|---|---|
| Posture | A ruled table. S-07 looks like a ledger first and a form second. |
| Density | High, with heavier rules than Direction L so each occurrence is boxed by lines. |
| Hierarchy | Column labels are as strong as the row. S-08 uses the same ruled grammar for its fields. |
| Surfaces | White field, dark text, visible horizontal and vertical rules. No shadow. |
| Color strategy | No accent hue. Selection is a heavier rule or a marker character. Visibility and occurrence state are words plus a mark. |
| Typography | Tabular figures for clock times. One plain sans. Exact faces wait for Stage 3. |
| Iconography | Marker characters and short words, not a pictorial icon set. |
| Motion | None. |
| Fit | Strong for comparing occurrences and conflict times. Heavier than S-01 through S-06 need. |

## 6. Shared constraints

- The accepted structure stays: S-01 through S-09 and the paths accepted on 2026-11-25.
- Q-02, Q-03, and Q-04 stay open. No direction names a product title, designs the mail message, or chooses the first calendar range.
- Sample hues are absent so they cannot be mistaken for tokens.
- `docs/ui-ux/tokens/design-tokens.json` belongs to the other product. This stage does not add a personal-time token file.
- The website still has no stylesheet. This stage does not add one.

## 7. Decision requested

The accepted direction is Agenda. The user approved that page on 2026-11-25 under workflow 2.1.0, named it the token source, and approved the extraction the same day. The token record is `10-design-tokens-agenda.md` and `tokens/design-tokens.json`. Editorial remains an approved page. Direction L, Direction P, and Direction C are not the current direction. Direction L's geometric marks are not adopted. The website stylesheet still implements the previous baseline.

Earlier on 2026-11-25 the user chose Direction L, and Directions P and C were not selected. That choice is the history above. The token values then recorded in `10-design-tokens.md` are the previous baseline.
