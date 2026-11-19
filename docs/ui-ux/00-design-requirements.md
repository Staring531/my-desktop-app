# UI/UX Design Requirements

- Status: Design baseline; not a product-scope change.
- Authority: approved PRD (DEC-011), approved Technical Design, and current Implementation Plan.
- Purpose: specify how approved Version 1 behavior is presented and operated in the desktop app.

## Principles
1. PRD is the sole authority for user-visible behavior. Add no capabilities, actors, workflows, or business rules.
2. Technical Design governs architecture, process boundaries, data ownership, persistence, and security.
3. Design only one team on one computer, member/invitation lifecycle, single schedule events, visibility, and busy/free views.
4. Website, Admin, and API are not Version 1 UI surfaces unless the user explicitly changes approved artifacts.
5. Do not introduce login, email verification, multi-team, sync, reminders, recurring events, all-day events, or other excluded behavior.
6. Design is a specification, not implementation authorization. No application code, dependency installation, or Implementation Plan edits.
7. Separate confirmed requirements, proposals, assumptions, and open questions.
8. Trace every screen and interaction to PRD requirements and approved technical contracts.

## Required outcomes
Information architecture; user-flow maps; screen inventory/specifications; low-fidelity wireframes before high-fidelity visuals; interaction and UI-state specs; lightweight design system; accessibility and desktop-window requirements; PRD/Technical Design/Implementation Plan traceability; independent review; explicit user approval.

## UI states
Consider applicable initial, loading, populated, empty, validation error, operation error, disabled, success, permission denied, and unavailable states. Do not invent states for behavior that is not approved.

## Gates
Readiness Analysis is analysis only. Structural design must be reviewed before high-fidelity work. Independent review occurs after the design package is coherent. Keep READY FOR USER REVIEW until explicit user approval. UI/UX approval does not authorize coding.
