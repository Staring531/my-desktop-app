# UI/UX Design Requirements

- Status: Design baseline; not a product-scope change.
- Authority: approved PRD (DEC-011), approved Technical Design, and confirmed Implementation Plan.
- Purpose: specify how approved Version 1 behavior is presented and operated in the desktop app.

## Principles
1. PRD is the sole authority for user-visible behavior. Add no capabilities, actors, workflows, or business rules.
2. Technical Design governs architecture, process boundaries, data ownership, persistence, and security.
3. Design only the approved single-team, single-computer Version 1 behavior and its documented member, invitation, event, visibility, and busy/free workflows.
4. Website, Admin, and API are not Version 1 UI surfaces unless the user explicitly changes approved artifacts.
5. Do not introduce login, email verification, multi-team, sync, reminders, recurring events, all-day events, theme preferences, or other excluded behavior.
6. Design is a specification, not implementation authorization. No application code, dependency installation, or Implementation Plan edits.
7. Separate confirmed requirements, proposals, assumptions, and open questions.
8. Trace every screen, component, and interaction to PRD requirements and approved technical contracts.
9. Use System-First sequencing: structure → approved Visual Direction → approved tokens/core components → page design → validation/review.
10. Linear is a visual reference only; do not copy brand assets or add product-specific capabilities.

## Required outcomes
Readiness report; information architecture and user-flow maps; screen inventory; approved Visual Direction; primitive/semantic/component token baseline; reusable component contracts; low-fidelity wireframes; high-fidelity page specs; interaction/UI-state specs; accessibility and desktop-window requirements; traceability; design-system validation; independent review; explicit user approval.

## UI states
Consider applicable initial, loading, populated, empty, validation error, operation error, disabled, success, permission denied, and unavailable states. Do not invent states for behavior that is not approved.

## Gates
Readiness Analysis is analysis only. Structural design is reviewed before visual-system work. User approves Visual Direction before final token proposals, and approves tokens/core components before high-fidelity design at scale. Independent review occurs after the package is coherent. Keep READY FOR USER REVIEW until explicit user approval. UI/UX approval does not authorize coding.
