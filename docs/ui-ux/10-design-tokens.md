# Design Tokens

## Status and authority
Token baseline is DRAFT until the user approves it at the Design System Gate. The machine-readable companion is `tokens/design-tokens.json`. Do not copy example values into the application or treat provisional values as approved.

## Required layers
1. **Primitive tokens:** raw values grouped by color, typography, spacing, sizing, radius, border, elevation, motion, iconography, and layering as needed.
2. **Semantic tokens:** purpose-based aliases for canvas/background, surfaces, text, borders, focus, actions, status, busy/free, and disabled states as applicable.
3. **Component tokens:** component-specific aliases referencing semantic tokens (for example button height/background/radius or input border/focus).

## Rules
- Choose token format and runtime mapping only after Stage 0 confirms the actual stack.
- Use the existing styling/theming mechanism where practical; do not install dependencies during design.
- Page and component specs should reference semantic/component tokens rather than raw primitive values.
- Every token has a stable name, value, type/unit, description, intended usage, and status (PROPOSED/APPROVED/DEPRECATED).
- Color tokens require contrast checks and must not be the sole encoding of business state.
- Define scales rather than unrelated one-off values; avoid excessive token proliferation.
- Document aliases, inheritance, theme applicability (only if approved), and migration/deprecation rules.
- Any raw value exception must include location, rationale, impact, and approval/disposition.
- Keep JSON valid and deterministic; do not put comments or prose in the JSON file.

## Review checklist
Schema validity; duplicate/unused tokens; unresolved references; invalid units; semantic aliases mapped to primitives; component aliases mapped to semantic tokens; contrast and state coverage; no unapproved final values.
