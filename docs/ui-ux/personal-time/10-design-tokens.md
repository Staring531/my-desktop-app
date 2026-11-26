# Design Tokens: Personal Time

- Stage: 3 — Design Tokens and Core Component System, User Approval Gate 2
- Date: 2026-11-25
- Status: Approved by the user on 2026-11-25 together with `11-component-specifications.md` for Direction L. Later the same day the user approved the Agenda baseline in `10-design-tokens-agenda.md`. That file and `tokens/design-tokens.json` are the website token baseline. This file remains the Direction L record.
- Machine-readable source: `tokens/design-tokens.json`
- Visual direction: `09-visual-references.md`
- Stack: `apps/website` is Next.js 15 and React 19. On 2026-11-25 it had no stylesheet, font file, icon set, or token compiler. The proposed later mapping is plain CSS custom properties. This stage installs nothing and writes no application file.
- This file does not replace `docs/ui-ux/10-design-tokens.md`. That baseline belongs to `docs/product/04-prd.md` and was approved on 2026-11-20. Its color, type size, and accent are not reused.
- No independent UI/UX review was run. The Design Review Gate is later, after the package is coherent.

## 1. How to read the layers

Primitive tokens hold raw values. Semantic tokens name a purpose and point at a primitive. Component tokens point at semantic tokens, except where a shared size is already a primitive dimension. Later page specifications use semantic or component tokens.

There is one light theme. No dark values and no theme-preference token exist.

## 2. Color

The field is `#F6F7F8`. Primary text is `#1A1D21`. The single accent is `#1E4E8C`, used for the primary button, the keyboard focus ring, and the selected-row mark. It is not used for public, private, `scheduled`, `skipped`, `choice_required`, conflict, or failure.

| Pair | Values | Design-time contrast |
|---|---|---|
| Primary text on canvas | `#1A1D21` on `#F6F7F8` | About 15.8:1 |
| Secondary text on canvas | `#3C4450` on `#F6F7F8` | About 9.2:1 |
| Meta text on canvas | `#4E5663` on `#F6F7F8` | About 6.9:1 |
| White text on accent | `#FFFFFF` on `#1E4E8C` | About 8.3:1 |
| Danger text on canvas | `#8B2A22` on `#F6F7F8` | About 8.0:1 |
| Primary text on selected wash | `#1A1D21` on `#E7EEF6` | About 14.5:1 |
| Field edge on white | `#5E6772` on `#FFFFFF` | About 5.7:1 |
| Field edge on canvas | `#5E6772` on `#F6F7F8` | About 5.4:1 |

These ratios use the sRGB relative-luminance formula. They are design-time arithmetic, not a certified audit. Hairline `#D3D7DE` separates regions and rows and is not a text color. The field edge meets 3:1 on both the white field and the canvas. It is not a status hue.

Failure text is a second channel. The visible word is still the API `result`. A shared failure such as `login_rejected` uses this same danger text on every screen that shows it.

## 3. Type, space, and shape

One operating-system sans family. Three roles: title 18/24 at weight 600, body 14/20 at weight 400, meta 12/16 at weight 400. No webfont and no display size. Clock times and civil dates use tabular figures in the same family.

Space steps are 4, 8, 12, 16, 24, and 32 px. Controls are 32 px tall. Occurrence rows are at least 32 px and grow with their text. Radius is 4 px on controls and 0 on the page. Elevation is none. Feedback duration is 0 ms, which is also the reduced-motion behavior.

`size.content` is 640 px. It is the one task column inside the page inset. A narrower viewport uses the viewport minus that inset. This is not a breakpoint set and not a mobile layout.

## 4. Usage rules

- A status the PRD distinguishes is also written in the API word: `public`, `private`, `scheduled`, `skipped`, or `choice_required`.
- The accent marks the primary action and the selected row. A selected row also carries a 2 px leading bar, so the wash is not the only cue.
- Failure uses danger text plus the `result` string. It does not introduce a second filled color, and it does not explain which value was taken or whether an account exists.
- A successful command redraws from the returned body. `conflicts` are rows of `title`, `start`, and `end`. `continuesAfterWindow: true` is one separate sentence that the repetition continues after 90 days. That sentence is not a conflict entry and is not danger text.
- Do not add a shadow, a second accent, a dark theme, or a motion duration other than `motion.feedback` without a new proposal.
- Aliases in the JSON are the only indirection. A page does not point at a primitive color when a semantic color exists.

## 5. What this proposal does not decide

- Q-02 stays open. The mail message is not designed. S-02 and S-06 still submit a proof code.
- Q-03 stays open. No token names a product title. The scaffold title `My Desktop App` is not adopted.
- Q-04 stays open. No token chooses the first `from` and `to`.
- This file does not draw S-01 through S-09. Component contracts are in `11-component-specifications.md`.
