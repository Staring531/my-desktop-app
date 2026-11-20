# Design System

## Purpose and status
A lightweight application-level design contract for the approved Version 1 desktop UI, not a generalized component platform. The system is **DRAFT until the user approves the Visual Direction and token/component baseline**. Do not treat example values or references as approved design decisions.

## Governance
- Visual Direction is approved before final token values.
- Primitive, semantic, and component token layers are documented in `10-design-tokens.md` and machine-readable `tokens/design-tokens.json`.
- Core component contracts are documented in `11-component-specifications.md`.
- Pages use approved semantic/component tokens and approved components; deviations require rationale and disposition.
- English documents are canonical; matching Chinese translations must stay aligned.
- Changes affecting multiple pages require impact analysis and updates to affected specifications.

## Token layers
1. **Primitive:** raw palette, spacing, type, radius, border, elevation, motion, and sizing values.
2. **Semantic:** purpose-based aliases such as canvas/surface/text/border/focus/status/action.
3. **Component:** component-specific aliases that reference semantic tokens.

Page specifications should reference semantic or component tokens, not raw primitive values. Do not invent final values before approval.

## Component patterns
Only define components required by approved screens: app shell/navigation; buttons; text/email/date/time inputs; selectors and visibility controls; event rows/cards and busy/free indicators; member/invitation items; dialogs; validation/notifications; loading/empty/error/no-access states. Reuse existing project components when suitable.

## Component specification
For each component record purpose, anatomy, variants, states, token dependencies, keyboard behavior, accessible name/description, resizing behavior, usage examples, and anti-patterns.

## Accessibility baseline
Keyboard operation and logical focus order; visible focus; programmatic labels and associated errors; sufficient contrast; never convey busy/free, visibility, or permission by color alone; respect reduced motion where motion exists.

## Validation
Validate token references, missing/undefined tokens, undocumented raw values, component reuse, variant/state coverage, and cross-page consistency. Runtime screenshot comparison is deferred to implementation after separate coding authorization.
