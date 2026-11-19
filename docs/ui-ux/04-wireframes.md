# Wireframes

## Purpose
Define layout, hierarchy, and task sequence before high-fidelity styling. Wireframes must consume the approved information architecture and remain compatible with the approved design-system contracts without prematurely fixing visual styling.

## Entry conditions
- Structural baseline (IA, flows, screen inventory) has been reviewed and accepted by the user.
- Visual Direction and Design Token/core-component baseline have been approved.
- Any unresolved product behavior is explicitly listed; wireframes must not silently decide it.

## Coverage
Cover all approved screens or document justified combinations; supported desktop window sizes; primary/secondary/destructive/disabled actions; keyboard focus; validation and recovery; applicable empty/loading/success/no-access/error states.

## Per-screen template
1. Screen ID/name and actor/preconditions.
2. Primary task and supporting information.
3. Layout regions, hierarchy, and content density.
4. Approved component references and semantic token roles (not arbitrary values).
5. Controls and action semantics.
6. Validation and feedback placement.
7. State variants.
8. Keyboard/accessibility behavior and focus order.
9. Desktop window constraints and resizing behavior.
10. PRD AC, user-flow, component, and Technical Design references.
11. Open questions, alternatives, and justified deviations.

## Fidelity progression
Text sketch → editable low-fidelity wireframe → user review of IA/task sequence → high-fidelity visual specification using approved tokens/components.

Do not use a static generated image as the sole source of truth for editable layout, component semantics, or interaction behavior. Keep source artifacts reviewable and maintainable.
