# UI/UX Handoff: Personal Time

- Stage: 9 — Handoff
- Date: 2026-11-25
- Status: Prepared after the user approved the personal-time UI package and its presentation delta on 2026-11-25. This handoff does not authorize application code, dependency installation, or a change to the PRD or the Technical Design.
- Package: `docs/ui-ux/personal-time/`. This file does not replace `docs/ui-ux/14-handoff.md`.
- Plan: The approved delta is applied to PT-023 in `docs/technical/personal-time/10-implementation-plan.md`.
- English files are canonical. Where a translation lags, follow the English file.

## 1. What is approved

| Document | Role |
|---|---|
| `01-information-architecture.md` | Accepted structure and paths. |
| `02-user-flows.md` | Accepted flows. |
| `03-screen-inventory.md` | S-01 through S-09. |
| `04-wireframes.md` | Accepted low-fidelity structure. |
| `05-visual-design.md` | Direction L painted with the approved tokens. |
| `06-interaction-specifications.md` | I-01 through I-17. |
| `09-visual-references.md` | Direction L. |
| `10-design-tokens.md` and `tokens/design-tokens.json` | Approved token baseline. |
| `11-component-specifications.md` | PT-C01 through PT-C10. |
| `12-page-specifications.md` | Page composition. |
| `13-visual-validation.md` | Design-artifact checks. Contrast is not a certified audit. Runtime screenshots were not taken. |
| `08-design-review.md` | Findings and dispositions. UX-PT-REV-001 remains GAP-PT-01. |
| `14-implementation-readiness.md` | The readiness check the user approved. |

## 2. Decisions that bind the website

These bind presentation after separate implementation authorization. They do not authorize that work now.

- One light column. Content width is `component.page.content-max` inside `component.page.inset`. No theme switch, navigation rail, month grid, search, sharing, team, or another person's Calendar.
- Use the personal-time token file. Map it to plain CSS custom properties. Do not add a token compiler or a styling dependency. Do not reuse `docs/ui-ux/tokens/design-tokens.json` or the desktop components.
- Pages use semantic or component tokens. EX-PT-01 is the only named raw exception: the 1 px region rule.
- One primary button per command region. Logout is quiet. Create Save stays quiet until one repetition option is selected. The non-repeating option sends `none`.
- A command in flight shows the word `waiting` in secondary text, keeps the button label, and does not send again. `waiting` is not an API result.
- A page that stays shows the string `ok` and no second success sentence. S-02 and S-06 open S-04 on `ok`. S-04 opens S-07 on `ok`. A guarded path without a session paints S-04 and `logged_out`.
- Start and End are the typed civil date and clock, sent as entered. From and To start empty. Show range sends only after both are typed. Q-04 remains open, so no first calendar range is chosen.
- Delete sends nothing until the danger button in PT-C10. Cancel sends nothing.
- Shared failures show the `result` string and do not say which value was taken.
- The task title is the surface name. Q-03 remains open, so the scaffold document title stays. Q-02 remains open: the mail message is not designed, and S-02 and S-06 submit a proof code.
- Keep the approved API routes, the session cookie, and the JSON `result`. Do not switch the website to the bearer API client.

## 3. Tracked limitation

GAP-PT-01 stays open. An entered doubled local time is `save_rejected`. The page paints a choice only when the returned body already includes the two instants. The user decided that completing AC-P23 needs the Technical Design rejection body to return those instants. That Technical Design change was not made and is not part of this handoff.

## 4. Still not authorized

Application code, dependency installation, deployment, and edits to the PRD or the Technical Design. Implementation of PT-023 waits for a separate explicit authorization. Q-02, Q-03, Q-04, contrast certification, and runtime screenshots remain open.
