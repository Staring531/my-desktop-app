# Design Tokens

- Stage: 3 — Design Tokens and Core Component System, User Approval Gate 2
- Date: 2026-11-20
- Status: Approved by the user on 2026-11-20. This approval does not authorize application code, wireframe acceptance, or high-fidelity pages.
- Machine-readable source: `tokens/design-tokens.json`
- Stack: the desktop renderer is React on Electron, with no CSS framework, icon font, or token compiler in the repository. The proposed later mapping is plain CSS custom properties. This stage installs nothing and writes no application code.

## 1. How to read the layers

Primitive tokens hold raw values. Semantic tokens name a purpose and point at a primitive. Component tokens point at semantic tokens, except where the value is a shared size already expressed as a primitive dimension. Page specifications, when they exist, use semantic or component tokens.

There is one light theme. No dark values and no theme-preference token exist.

## 2. Color

The field is `#F4F5F6`. Primary text is `#1B1F24`. The single accent is `#0F5F66`, used for the primary button, the keyboard focus ring, and the selected-row mark. It is not used for busy, free, visibility, or failure.

| Pair | Values | Design-time contrast |
|---|---|---|
| Primary text on canvas | `#1B1F24` on `#F4F5F6` | About 14.6:1 |
| Secondary text on canvas | `#3E4651` on `#F4F5F6` | About 8.7:1 |
| Meta text on canvas | `#4A5160` on `#F4F5F6` | About 7.2:1 |
| White text on accent | `#FFFFFF` on `#0F5F66` | About 7.3:1 |
| Danger text on canvas | `#8E1B1B` on `#F4F5F6` | About 8.1:1 |

These ratios use the sRGB relative-luminance formula. They are design-time arithmetic, not a certified audit. Hairline `#D0D5DB` separates regions and rows and is not a text color. The input edge is `semantic.color.border-field`, `#6B7280`, about 4.8:1 on the white field and about 4.4:1 on the canvas. It was added on 2026-11-20 so the field boundary meets 3:1. It is not a status hue. Busy and free use the same primary text color; the difference is the word and the mark in component C-06.

## 3. Type, space, and shape

One operating-system sans family. Three roles: title 16/20 at weight 600, body 13/18 at weight 400, meta 12/18 at weight 400. No webfont and no display size.

Space steps are 4, 8, 12, 16, 24, and 32 px. Controls and rows are 32 px tall. Radius is 4 px on controls and 0 on the window. Elevation is none. Feedback duration is 0 ms, which is the reduced-motion behavior as well.

`size.window-width` and `size.window-height` record the existing 1200 by 800 Electron window. They do not request a new window size.

## 4. Usage rules

- A status that the PRD distinguishes is also written in words.
- The accent marks the primary action and the selected row. A selected row also carries a 2 px leading bar, so the wash is not the only cue.
- Failure and destructive actions use danger text and the action's name. They do not introduce a second filled brand color.
- Do not add a shadow, a second accent, or a motion duration other than `motion.feedback` without a new proposal.
- Aliases in the JSON are the only indirection. A page does not point at a primitive color when a semantic color exists.

## 5. What this proposal does not decide

Q-04 was closed by the user on 2026-11-20. The confirmation step uses the existing text, danger-button, and quiet-button tokens. No confirmation-surface tokens were added.
