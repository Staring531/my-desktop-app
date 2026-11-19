# UI/UX Design Workflow

> Version: 1.0.0  
> Status: Active workflow definition  
> Scope: UI/UX specification for the approved Version 1 PRD; not application implementation.

## Authority and activation
Activate only after the PRD and Technical Design are approved and the Implementation Plan is available. Read the approved PRD, Decision Log, Technical Design, review reports, Implementation Plan, and repository evidence.

Authority order: approved PRD (behavior and scope) → approved Technical Design (architecture and technical contracts) → Implementation Plan (task sequencing) → UI/UX Design (presentation and interaction only).

Do not modify higher-authority artifacts. Ask the user when design exposes a product ambiguity. Record technical conflicts and request a Technical Design change through its workflow. Never invent behavior to resolve either.

## Non-negotiable constraints
- Preserve approved PRD scope. Do not add authentication/email verification, multi-team, cross-device sync, reminders, recurring/all-day events, or other excluded behavior.
- Version 1 is one desktop app and one local team record on one computer.
- Website, Admin, and API are not Version 1 UI surfaces unless approved artifacts are explicitly changed by the user.
- Do not write application code, install dependencies, or change architecture/PRD.
- Do not directly modify the Implementation Plan. Propose a traceable delta for user approval if needed.
- Do not commit, push, merge, or release without separate authorization.
- A design proposal or reviewer finding is not user approval.
- A Skill is a reusable procedure, not an isolated subagent. Disclose when native delegation is unavailable; do not claim self-review is independent.

## Two-agent model
### UI/UX Designer — primary/orchestrator
The primary session is the sole user-facing designer. It inspects existing UI code/assets/components/styles/tests; performs readiness analysis; creates and maintains design artifacts when authorized; maintains PRD AC → flow → screen → interaction traceability; delegates independent review; triages findings; and asks the user about product decisions. It never writes application code or changes approved PRD/Technical Design.

### UI/UX Design Reviewer — independent/read-only
Invoke only at the Design Review Gate. Inspect canonical artifacts and evidence; return findings only. Do not edit files, interview the user, make product decisions, or write code. Use tool-level read-only restrictions where supported; prompt-only restrictions are not a sandbox.

## Stages and gates
### Stage 0 — Readiness Analysis
Inspect UI framework/renderer, navigation, reusable components, styling, fonts/icons/assets, desktop window constraints, accessibility patterns, UI tests, and implementation-task dependencies. Produce a Readiness Report, proposed IA, proposed screen inventory, initial AC-to-flow/screen/interaction mapping, reusable-asset inventory, risks, and open questions. Analysis only: no wireframes or code. Stop for user review.

### Stage 1 — Information Architecture and User Flows
Define navigation, role-aware destinations, journeys, entry/exit conditions, and every applicable PRD flow. Map flows to requirement/AC IDs. User reviews and accepts the structural baseline before proceeding.

### Stage 2 — Screen Inventory and Low-fidelity Wireframes
Create screen inventory and low-fidelity wireframes. Specify layout hierarchy, controls, content, permissions, states, keyboard navigation, and desktop resizing. Do not begin high-fidelity design before structural baseline acceptance.

### Stage 3 — Interaction and Visual Design
Specify control behavior, validation, operation feedback, cancel/failure semantics, destructive confirmations, local-time edge cases, and UI states. Define a lightweight design system and high-fidelity visual specs limited to approved product surfaces.

### Stage 4 — Design Review Gate
When stages 1–3 are coherent and traceability is present, delegate the independent reviewer. Save the report to `docs/ui-ux/08-design-review.md`. Findings include severity, evidence, scenario, impact, recommendation, and product-decision flag. The primary designer resolves design issues; product decisions go to the user. Re-review material changes.

### Stage 5 — Implementation Readiness and User Approval
Check that every applicable PRD AC maps to a flow/screen/interaction or justified non-UI behavior; every UI contract respects Technical Design; screen/state/accessibility coverage is complete; findings are resolved or tracked; and proposed UI tasks align with the Implementation Plan. Present any plan delta for approval rather than silently applying it. Status remains READY FOR USER REVIEW until explicit user approval.

### Stage 6 — Handoff
After UI/UX approval, prepare design handoff and any approved plan delta. Handoff is not coding authorization. Wait for separate explicit authorization before implementation.

## Canonical documents
See `docs/ui-ux/`: `00-design-requirements.md`, `01-information-architecture.md`, `02-user-flows.md`, `03-screen-inventory.md`, `04-wireframes.md`, `05-visual-design.md`, `06-interaction-specifications.md`, `07-design-system.md`, `08-design-review.md`. Chinese translations use the matching `-zh.md` suffix. English files are canonical; keep translations semantically aligned.
