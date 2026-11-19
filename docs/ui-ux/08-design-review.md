# UI/UX Design Review and Readiness Gate

## Reviewer role
Independent and read-only; returns findings only. It must not edit canonical files, interview the user, make product decisions, or write code. Use tool-level read-only restrictions where supported; prompt-only restrictions are not a sandbox.

## Gate conditions
Invoke after structural design, approved Visual Direction, approved token/core-component baseline, wireframes/page specs, high-fidelity visual and interaction/state specs, accessibility/window behavior, validation evidence, traceability, risks, and open questions form a coherent package.

## Checklist
1. PRD scope fidelity and actor/permission fidelity.
2. All applicable PRD flows represented; every relevant AC maps to a screen/component/interaction or justified non-UI behavior.
3. Approved Visual Direction followed without copying protected branding or introducing unsupported product patterns.
4. Token taxonomy is coherent; semantic/component aliases are used correctly; missing tokens and undocumented raw values are identified.
5. Components are reused consistently; variants, states, accessibility, keyboard, and resizing behavior are specified.
6. Typography, spacing, alignment, hierarchy, density, surfaces, and iconography are consistent across pages.
7. Applicable success/failure/cancel/empty/loading/disabled/denied states.
8. Local time, ambiguous/nonexistent time, unchanged instants.
9. Truthful confirmation and outcomes for destructive actions.
10. Keyboard, focus, labels, contrast, and non-color cues.
11. Consistency with approved architecture and module boundaries.
12. Alignment with implementation tasks; propose plan deltas, do not silently apply them.
13. Distinguish design-artifact validation from actual runtime screenshot comparison.

## Finding schema
ID, severity (CRITICAL/HIGH/MEDIUM/LOW), affected screen/artifact, PRD AC and design references, concrete scenario, evidence, user impact, recommendation, and product-decision flag.

## Readiness result
Report PRD/technical traceability, token/component/page compliance, screen/flow/interaction/state/accessibility coverage, validation evidence, review disposition, Implementation Plan alignment, residual risks, and open questions. Status remains READY FOR USER REVIEW until explicit user approval. UI/UX approval does not authorize coding.
