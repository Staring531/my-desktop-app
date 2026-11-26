# UI/UX Design Workflow

> Version: 2.1.0  
> Status: Active workflow definition  
> Scope: UI/UX specification for one approved product PRD; not application implementation.  
> Design approach: System-First. Each product records its own reference sources in `09-visual-references.md`.

## 1. Authority, activation, and startup

Activate only after the PRD and Technical Design are approved and the Implementation Plan exists. The user must explicitly request UI/UX work. Every participating agent first reads `docs/process/DEVELOPMENT_WORKFLOW.md`, `AGENTS.md`, this file, approved PRD/Decision Log, Technical Design/reviews, Implementation Plan, and relevant repository/package documentation.

Authority order: approved PRD (behavior and scope) → approved Technical Design (architecture and technical contracts) → confirmed Implementation Plan (task sequencing) → user-approved UI/UX decisions (presentation and interaction only).

Do not modify higher-authority artifacts. Ask the user when design exposes a product ambiguity. Record technical conflicts and request a Technical Design change through its workflow. A design proposal, gate completion, reviewer PASS, or merged documentation PR is not user approval.

## 2. Non-negotiable constraints

- Preserve the approved PRD scope of the product being designed. Do not add behavior that product's PRD excludes.
- Design only the surfaces named by that product's approved PRD and Technical Design. A surface approved for another product stays out of scope.
- Do not write application code, install dependencies, change architecture/PRD, or silently modify the Implementation Plan.
- Do not commit, push, merge, or release without separate authorization.
- A design proposal or reviewer finding is not user approval.
- A Skill is a reusable procedure, not an isolated subagent. Disclose when native delegation is unavailable; do not claim self-review is independent.
- Do not assume dark mode, theme switching, responsive mobile layouts, new settings, or new product surfaces. Design only what that product's approved requirements and existing technical constraints support.
- A reference supplies observable characteristics and a recorded source. Do not adopt that source's name, logo, wordmark, brand color, or objects this product does not have.

## 3. Agent model and responsibilities

### UI/UX Designer — primary/orchestrator
The primary session is the sole user-facing designer. It inspects existing UI code/assets/components/styles/tests; runs readiness analysis; maintains canonical design artifacts; owns design-system coherence and PRD AC → flow → screen → component/interaction traceability; delegates review; triages findings; and asks the user about product decisions. It never writes application code or changes approved PRD/Technical Design.

### UI/UX Design Reviewer — independent/read-only
Invoke only at the Design Review Gate. Inspect canonical artifacts and evidence; return findings only. Do not edit files, interview the user, make product decisions, or write code. Use tool-level read-only restrictions where supported; prompt-only restrictions are not a sandbox.

No additional design agent is introduced. Implementation Planner remains inactive during UI/UX design.

## 4. System-First design principles

The design system is a binding design contract, not an optional style guide.

1. Establish repository constraints and approved product structure before visual decisions.
2. User approves one direction's openable primary-screen page before final token values are proposed. Those values are extracted from that page.
3. User approves the Design Token baseline and core component patterns before high-fidelity page production at scale.
4. Pages consume semantic tokens and approved component specifications; avoid arbitrary per-page values and one-off components.
5. Every visual/interaction choice remains traceable to approved PRD behavior and Technical Design contracts.
6. A reference supplies observable characteristics and a recorded source. The approved openable page is the visual authority for the direction. Reference imagery does not replace editable specs, token data, component contracts, or user approval.
7. If the stack already has a design system or component library, inspect and reuse it where appropriate; do not install or replace dependencies during design.

## 5. Stages and user-approval gates

### Stage 0 — Readiness Analysis
Inspect UI framework/renderer, navigation, reusable components, styling, fonts/icons/assets, desktop window constraints, accessibility patterns, UI tests, and implementation-task dependencies. Produce a Readiness Report, candidate IA and screen inventory, initial AC-to-flow/screen/interaction mapping, reusable-asset inventory, constraints, risks, and open questions. Analysis only: no visual direction decision, wireframes, code, dependency installation, or plan edits. Stop for user review.

### Stage 1 — Information Architecture, User Flows, and Screen Inventory
Define navigation, role-aware destinations, journeys, entry/exit conditions, applicable PRD flows, and candidate screens. Map each flow/screen to requirement and AC IDs. Record uncertain product behavior as questions; do not resolve it by inventing UI. Obtain user acceptance of the structural baseline before visual-system work.

### Stage 2 — Visual Direction (User Approval Gate 1)
Propose at least two visual directions from different reference families, grounded in repository constraints and user preference. For each direction record the reference source and attribution, the observable characteristics adopted, and the brand elements and foreign objects excluded. Cover density, hierarchy, layout posture, typography direction, color strategy, iconography, surfaces, and interaction tone.

Before approval, each direction includes an openable page of the product's primary screen. That page uses fields the approved product actually returns. The user approves that page. A principles table does not by itself complete the gate. A direction without a recorded source or without an openable page is incomplete.

Do not present provisional colors as approved tokens. Stop until the user explicitly approves one direction's page. A visual direction approved under workflow 2.0.0 remains that product's authority until the user approves a replacement page under this version.

### Stage 3 — Design Tokens and Core Component System (User Approval Gate 2)
After Gate 1, extract primitive, semantic, and component tokens from the approved page. Cover color, typography, spacing, sizing/layout, radii, borders, elevation, iconography, motion/reduced motion, and layering only where that page shows them. Tokens record decisions already visible on that page. They do not reinterpret the page into another visual posture. Store that product's structured token data in its design package at `tokens/design-tokens.json`. The Version 1 package path is `docs/ui-ux/tokens/design-tokens.json`. A later product does not overwrite another product's token file. Document rationale and usage in `10-design-tokens.md`. Define core components and their anatomy, variants, states, accessibility, keyboard behavior, and usage in `11-component-specifications.md`. Produce a reviewable component gallery/specimen. Inspect the existing stack before choosing the token output format or mapping strategy. Do not add runtime dependencies or application code. Stop until the user approves the token baseline and core component system.

### Stage 4 — Wireframes and Page Specifications
Create editable, reviewable low-fidelity wireframes and page specifications using approved IA and component contracts. Specify layout regions, information hierarchy, controls, responsive-to-window behavior, keyboard/focus order, and relevant states. Map each screen to its PRD ACs and flows. Resolve structural issues before high-fidelity production.

### Stage 5 — High-Fidelity Visual Design and Interaction Specifications
Apply approved tokens/components to every in-scope screen. Define all applicable states and interactions, including validation, success/failure/cancel, permission denial, destructive confirmation, loading/empty/error, and local-time edge cases required by the PRD. Record page-level deviations and justify them. Do not add unsupported product behavior.

### Stage 6 — Design-System and Visual Validation
Validate the high-fidelity specifications against the Gate 1 approved page. Also validate the design package against approved tokens, component specifications, page specs, accessibility, and traceability. Check token coverage, arbitrary-value exceptions, component reuse, typography/spacing hierarchy, visual-state coverage, window-size behavior, and consistency across screens. Record results and evidence in `13-visual-validation.md`. This stage compares design artifacts with the approved page. Comparison of the running implementation with that same page belongs to Coding & Testing after separate authorization.

### Stage 7 — Independent Design Review Gate
When stages 1–6 form a coherent package, delegate the independent reviewer. Save findings to `08-design-review.md`. Findings include severity, evidence, scenario, impact, recommendation, and product-decision flag. The primary designer resolves design issues; product decisions go to the user. Re-review material changes.

### Stage 8 — Implementation Readiness and User Approval
Check that every applicable PRD AC maps to a flow/screen/component/interaction or justified non-UI behavior; every UI contract respects Technical Design; token/component/page/state/accessibility coverage is complete; findings are resolved or explicitly tracked; and proposed UI tasks align with the Implementation Plan. Present any plan delta for approval rather than silently applying it. Status remains READY FOR USER REVIEW until explicit user approval.

### Stage 9 — Handoff
After UI/UX approval, prepare design handoff and any approved plan delta. Handoff is not coding authorization. Wait for separate explicit authorization before implementation.

## 6. Token and component governance

- Token JSON is the machine-readable source for approved design values; Markdown documents explain semantics, rationale, constraints, and examples.
- English design documents are canonical; matching `-zh.md` files are translations and must stay semantically aligned.
- Use three token layers: primitive (raw values), semantic (purpose-based aliases), and component (component-specific aliases). Avoid direct primitive references from page specs when a semantic token exists.
- Do not invent final token values before Stage 2 user approval and the Stage 3 extraction. Mark provisional values clearly. Tokens record decisions visible on the approved page.
- Pages must use approved semantic/component tokens. Exceptions require a documented rationale and user/design-system owner disposition.
- A change to hierarchy, typography, spacing, color, or component behavior updates the approved page first and waits for approval, then updates the affected tokens and screens.
- Component specs define purpose, anatomy, variants, states, keyboard/accessibility behavior, resizing, and usage/anti-patterns.
- A token or component change that affects multiple screens requires impact analysis and updates to affected specs; it must not silently fork the system.

## 7. Canonical documents

Under `docs/ui-ux/`:

| File | Purpose |
|---|---|
| `00-design-requirements.md` | Scope, design constraints, outcomes, and gates |
| `01-information-architecture.md` | Navigation and information structure |
| `02-user-flows.md` | Requirement-traceable user journeys |
| `03-screen-inventory.md` | Screen/surface inventory |
| `04-wireframes.md` | Low-fidelity structure and layout |
| `05-visual-design.md` | Approved visual direction and high-fidelity specifications |
| `06-interaction-specifications.md` | Interaction and state contracts |
| `07-design-system.md` | Design-system overview and governance |
| `08-design-review.md` | Independent review findings and disposition |
| `09-visual-references.md` | Reference analysis and approved visual direction |
| `10-design-tokens.md` | Token taxonomy, definitions, and usage rules |
| `11-component-specifications.md` | Reusable component contracts |
| `12-page-specifications.md` | Per-page composition and behavior |
| `13-visual-validation.md` | Design artifact consistency and validation evidence |
| `tokens/design-tokens.json` | Machine-readable token baseline |

Each Markdown document has a matching `-zh.md` translation. English files are canonical. Keep translations semantically aligned. A later approved product keeps these file names inside its own design package and does not overwrite another product's token baseline or visual authority. Do not create implementation code or install packages as part of this workflow.
