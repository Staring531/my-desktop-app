# UI/UX Design Workflow

> Version: 3.0.0  
> Status: Active workflow definition  
> Scope: UI/UX specification for one approved product PRD; not application implementation. Applies to every product and project in this repository and to every new project started from this workflow (section 8).  
> Design approach: System-First, brief-led, and evidence-checked. Each product records its own visual brief and reference sources in `09-visual-references.md`.

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
- Do not assume dark mode, theme switching, new settings, or new product surfaces unless the approved PRD includes them. Responsive behavior follows the platform and supported viewport or window sizes the approved requirements name.
- A reference supplies observable characteristics and a recorded source. Do not adopt that source's name, logo, wordmark, brand color, or objects this product does not have.
- Classify every design constraint as Scope or Taste (section 4A). Only Scope constraints bind a later visual redesign.

## 3. Agent model and responsibilities

### UI/UX Designer — primary/orchestrator
The primary session is the sole user-facing designer. It inspects existing UI code/assets/components/styles/tests; runs readiness analysis; writes the visual brief with the user; maintains canonical design artifacts; owns design-system coherence and PRD AC → flow → screen → component/interaction traceability; produces the rendered evidence required by Stage 6; delegates review; triages findings; and asks the user about product decisions. It never writes application code or changes approved PRD/Technical Design.

### UI/UX Design Reviewer — independent/read-only
Invoke only at the Design Review Gate. Inspect canonical artifacts, the visual brief, and the rendered screenshot evidence; return findings only. Do not edit files, interview the user, make product decisions, or write code. Use tool-level read-only restrictions where supported; prompt-only restrictions are not a sandbox.

No additional design agent is introduced. Implementation Planner remains inactive during UI/UX design.

## 4. System-First design principles

The design system is a binding design contract, not an optional style guide.

1. Establish repository constraints and approved product structure before visual decisions.
2. Confirm a visual brief (Stage 2) before proposing directions. The brief states what the product should feel like and what it must not feel like.
3. User approves one direction's openable page set before final token values are proposed. Those values are extracted from that set and extended under Stage 3.
4. User approves the Design Token baseline and core component patterns before high-fidelity page production at scale.
5. Pages consume semantic tokens and approved component specifications; avoid arbitrary per-page values and one-off components.
6. Every visual/interaction choice remains traceable to approved PRD behavior and Technical Design contracts.
7. A reference supplies observable characteristics and a recorded source. The approved openable page set is the visual authority for the direction. Reference imagery does not replace editable specs, token data, component contracts, or user approval.
8. If the stack already has a design system or component library, inspect and reuse it where appropriate; do not install or replace dependencies during design.
9. Visual quality is judged on rendered output. Token checks, traceability checks, and written descriptions do not establish it.

### 4A. Scope constraints versus taste constraints

- **Scope constraint:** comes from the approved PRD or Technical Design (excluded behavior, surfaces, data fields, platform limits, accessibility obligations). It binds every design stage and changes only through the owning workflow.
- **Taste constraint:** a visual preference such as column width, the presence of a navigation shell, card or elevation use, density, color, motion, or reference family. It is recorded in the visual brief with the approval date. The user may supersede it by approving a replacement page set. A superseding approval needs no PRD or Technical Design change.
- Design records and handoffs list the two classes separately. Write a taste constraint as a recorded preference. Do not write it as a prohibition that reads as scope. A navigation shell is a scope question only when the PRD excludes the destinations it would hold.

## 5. Stages and user-approval gates

### Stage 0 — Readiness Analysis
Inspect UI framework/renderer, navigation, reusable components, styling, fonts/icons/assets, platform window or viewport constraints, accessibility patterns, UI tests, and implementation-task dependencies. Produce a Readiness Report, candidate IA and screen inventory, initial AC-to-flow/screen/interaction mapping, reusable-asset inventory, constraints, risks, and open questions. Analysis only: no visual direction decision, wireframes, code, dependency installation, or plan edits. Stop for user review.

### Stage 1 — Information Architecture, User Flows, and Screen Inventory
Define navigation, role-aware destinations, journeys, entry/exit conditions, applicable PRD flows, and candidate screens. Map each flow/screen to requirement and AC IDs. Record uncertain product behavior as questions; do not resolve it by inventing UI. Obtain user acceptance of the structural baseline before visual-system work.

### Stage 2 — Visual Brief and Visual Direction (User Approval Gate 1)

**Visual brief.** Before directions are proposed, record in `09-visual-references.md`: the audience and context of use; the product's personality in three to five adjectives; anti-goals (what the product must not feel like, for example a plain document or a generic form page); density; shell and navigation posture; platform and supported viewports; brand assets and hard constraints; and every Taste constraint. The user confirms the brief. When the user gives no preference, the designer proposes a brief and the user confirms it. Directions do not start without a confirmed brief.

**Directions.** Propose at least two directions. They differ in layout posture, density, and expressiveness, not only in the reference site. At least one direction is contemporary and expressive in its use of hierarchy, surface, and color. No reference family is the default. For each direction record the reference source and attribution, the observable characteristics adopted, and the brand elements and foreign objects excluded. Cover density, hierarchy, layout posture, typography direction, color strategy, iconography, surfaces, and interaction tone.

**Page set.** Before approval, each direction includes an openable page set that uses fields the approved product actually returns:
1. the primary working screen;
2. an entry or form screen (sign-in, create, or edit);
3. a state-heavy screen or panel that shows failure, destructive, empty, and pending or success states;
4. the navigation shell, when the product has more than one destination.

The user approves one direction's page set. A principles table, or a single page, does not by itself complete the gate. A direction without a recorded source, a confirmed brief, or an openable page set is incomplete.

Do not present provisional colors as approved tokens. Stop until the user explicitly approves one direction's page set. A visual direction approved under an earlier workflow version remains that product's authority until the user approves a replacement under this version.

### Stage 3 — Design Tokens and Core Component System (User Approval Gate 2)
After Gate 1, extract primitive, semantic, and component tokens from the approved page set. Cover color, typography, spacing, sizing/layout, radii, borders, elevation, iconography, motion/reduced motion, and layering.

A state or role that the approved PRD or the UI/UX Engineering Standard (section 2.4) requires, and that no approved page shows, MUST be proposed in the same gate as an explicit extension. Examples are danger, error, success, warning, disabled, pending, selected, and empty. Record each extension in a state matrix in `10-design-tokens.md` and show it in the component gallery. Tokens must not leave a required state undefined, and silence on the approved page is not a reason to omit one. Extensions stay inside the approved visual posture and are approved by the user with the baseline. Provide an elevation and layering scale and a motion decision with reduced-motion behavior. If the approved direction deliberately has none, record that and the rationale.

Store that product's structured token data in its design package at `tokens/design-tokens.json`. A later product does not overwrite another product's token file. Document rationale and usage in `10-design-tokens.md`. Define core components and their anatomy, variants, states, accessibility, keyboard behavior, and usage in `11-component-specifications.md`. Produce a reviewable component gallery/specimen. Inspect the existing stack before choosing the token output format or mapping strategy. Do not add runtime dependencies or application code. Stop until the user approves the token baseline, the state matrix, and the core component system.

### Stage 4 — Wireframes and Page Specifications
Create editable, reviewable low-fidelity wireframes and page specifications using approved IA and component contracts. Specify layout regions, information hierarchy, controls, responsive-to-window behavior, keyboard/focus order, and relevant states. Map each screen to its PRD ACs and flows. Resolve structural issues before high-fidelity production.

### Stage 5 — High-Fidelity Visual Design and Interaction Specifications
Apply approved tokens/components to every in-scope screen. Define all applicable states from the approved state matrix and the interactions, including validation, success/failure/cancel, permission denial, destructive confirmation, loading/empty/error, and local-time edge cases required by the PRD. Record page-level deviations and justify them. Do not add unsupported product behavior.

### Stage 6 — Design-System and Visual Validation
Validate the high-fidelity specifications against the approved Gate 1 page set, tokens, component specifications, page specifications, accessibility, and traceability. Check token coverage, arbitrary-value exceptions, component reuse, typography/spacing hierarchy, state-matrix coverage, window-size behavior, and consistency across screens.

Rendered evidence is required. Render the approved pages and every in-scope high-fidelity screen or specimen at one narrow and one wide viewport, using the platform's real renderer where one exists. Store named screenshots with viewport metadata. Measure the contrast ratio of every text/background pair and every focus indicator against the applicable WCAG criteria and record the ratios. Check each rendered screen against the visual brief's adjectives and anti-goals and record a PASS or FAIL line for each. Record all of this in `13-visual-validation.md`.

Missing evidence is NOT RUN, never PASS. A package with NOT RUN rendered evidence does not leave Stage 6. Installing screenshot or measurement tooling is a dependency change and needs its own authorization. Without it, mark the evidence NOT RUN and say so. Do not substitute a written description for a screenshot.

This stage compares design artifacts with the approved page set. Comparison of the running implementation with that same page set belongs to Coding & Testing after separate authorization.

### Stage 7 — Independent Design Review Gate
When stages 1–6 form a coherent package, delegate the independent reviewer. Give the reviewer the confirmed brief and the screenshot files. The reviewer reads the images and returns findings on brief fit, visual hierarchy, and state coverage along with the existing checks. A review without screenshots states that visual quality was NOT REVIEWED. Save findings to `08-design-review.md`. Findings include severity, evidence, scenario, impact, recommendation, and product-decision flag. The primary designer resolves design issues; product decisions go to the user. Re-review material changes.

### Stage 8 — Implementation Readiness and User Approval
Check that every applicable PRD AC maps to a flow/screen/component/interaction or justified non-UI behavior; every UI contract respects Technical Design; token/component/page/state/accessibility coverage is complete; rendered evidence is present or recorded as NOT RUN; findings are resolved or explicitly tracked; and proposed UI tasks align with the Implementation Plan. Present any plan delta for approval rather than silently applying it. Status remains READY FOR USER REVIEW until explicit user approval.

### Stage 9 — Handoff
After UI/UX approval, prepare design handoff and any approved plan delta. The handoff lists Scope constraints and Taste constraints in separate sections. Handoff is not coding authorization. Wait for separate explicit authorization before implementation.

## 6. Token and component governance

- Token JSON is the machine-readable source for approved design values; Markdown documents explain semantics, rationale, constraints, and examples.
- English design documents are canonical; matching `-zh.md` files are translations and must stay semantically aligned.
- Use three token layers: primitive (raw values), semantic (purpose-based aliases), and component (component-specific aliases). Avoid direct primitive references from page specs when a semantic token exists.
- Do not invent final token values before Stage 2 user approval and the Stage 3 extraction. Mark provisional values clearly. Tokens record decisions visible on the approved page set, plus the Stage 3 extensions the user approved.
- Pages must use approved semantic/component tokens. Exceptions require a documented rationale and user/design-system owner disposition.
- A change to hierarchy, typography, spacing, color, or component behavior updates the approved page set first and waits for approval, then updates the affected tokens and screens.
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
| `09-visual-references.md` | Visual brief, Taste constraints, reference analysis, and approved visual direction |
| `10-design-tokens.md` | Token taxonomy, definitions, state matrix, and usage rules |
| `11-component-specifications.md` | Reusable component contracts |
| `12-page-specifications.md` | Per-page composition and behavior |
| `13-visual-validation.md` | Design artifact consistency, rendered screenshot evidence, contrast measurements, and brief-fit checks |
| `tokens/design-tokens.json` | Machine-readable token baseline |

Each Markdown document has a matching `-zh.md` translation. English files are canonical. Keep translations semantically aligned. A later approved product keeps these file names inside its own design package and does not overwrite another product's token baseline or visual authority. Do not create implementation code or install packages as part of this workflow.

## 8. Applicability and migration

- This workflow applies to every product and project in this repository and to every new project started from it. A project may not skip the visual brief, the page set, the state matrix, or the rendered evidence without a deviation that records rationale, approver, and review date, as `docs/ui-ux/ENGINEERING-STANDARD.md` section 1 requires.
- A project outside this repository adopts the workflow through `docs/ui-ux/PROJECT-ADOPTION-CHECKLIST.md` and records the workflow version it follows.
- Visual authorities approved under an earlier workflow version stay in force until the user approves a replacement. Version 3.0.0 governs every new or replacement direction. It does not reopen an approval.

## 9. Why version 3.0.0 exists

The Personal Time website was first built to an Agenda direction and later replaced by a modern workspace design. The repository history shows the causes, and each maps to a rule above.

| Cause in the Agenda package | Rule in this version |
|---|---|
| Tokens were extracted only from a 111-line single page. No danger, error, disabled, pending, or elevation token existed, and the handoff said there was no danger hue. | Stage 3 state matrix and required extensions |
| A taste preference (one column, no navigation rail, no cards) sat beside real scope exclusions in the handoff. | Section 4A |
| Both directions came from quiet, list-style references, and the reference family named by the workflow was a restrained tooling style. | Stage 2 visual brief, posture-different directions, no default family |
| No brief said what the product should feel like or must not feel like. | Stage 2 visual brief with anti-goals |
| Validation recorded that contrast was not measured and no screenshot was taken. | Stage 6 rendered evidence, Stage 7 review of images |
| A refinement pass changed CSS but not the token baseline, so polish could not repair a system-level gap. | Stage 3 extensions and Gate 2 approval before page work |
