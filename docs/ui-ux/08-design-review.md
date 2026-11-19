# UI/UX Design Review and Readiness Gate

## Reviewer role
Independent and read-only; returns findings only. It must not edit canonical files, interview the user, make product decisions, or write code. Use tool-level read-only restrictions where supported; prompt-only restrictions are not a sandbox.

## Gate conditions
Invoke after IA/flows, screen inventory/wireframes, visual/design-system specs, interaction/state specs, accessibility/window behavior, traceability, risks, and open questions form a coherent package.

## Checklist
1. PRD scope fidelity.
2. Actor and permission fidelity.
3. All applicable PRD flows represented.
4. Every relevant AC maps to a screen or interaction.
5. Applicable success/failure/cancel/empty/loading/disabled/denied states.
6. Local time, ambiguous/nonexistent time, unchanged instants.
7. Truthful confirmation and outcomes for destructive actions.
8. Keyboard, focus, labels, contrast, and non-color cues.
9. Consistency with approved architecture and module boundaries.
10. Alignment with implementation tasks; propose plan deltas, do not silently apply them.

## Finding schema
ID, severity (CRITICAL/HIGH/MEDIUM/LOW), affected screen/flow, PRD AC and design references, concrete scenario, user impact, recommendation, and product-decision flag.

## Readiness result
Report PRD/technical traceability, screen/flow/interaction/state/accessibility coverage, review disposition, Implementation Plan alignment, residual risks, and open questions. Status remains READY FOR USER REVIEW until explicit user approval. UI/UX approval does not authorize coding.
