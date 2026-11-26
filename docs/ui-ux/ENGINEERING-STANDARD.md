# UI/UX Engineering Standard

- Version: 1.1.0-draft
- Status: Pilot standard; validated in this repository before adoption elsewhere. Revision 1.1.0-draft records the Gate 1 page as visual authority and keeps each product's visual package separate.
- Owner: Product and engineering maintainers.
- Scope: UI-bearing applications in this repository. The rules are technology-neutral unless explicitly marked Electron/React.
- Normative language: MUST = release-gating requirement; SHOULD = expected unless an approved exception is recorded; MAY = optional practice.

## 1. Governance and authority

1. The approved product requirements define product behavior. The approved design package defines intended visual and interaction behavior. Implementation MUST NOT silently change either.
2. Every project MUST identify its product, technical, and design sources of truth, their owners, approval state, and version.
3. Design changes that affect hierarchy, typography, spacing, color, interaction, accessibility, or component behavior MUST be recorded and reviewed before implementation.
4. A deviation MUST record its rationale, affected screens/components, risk, approver, expiry or review date, and acceptance evidence.
5. This standard governs engineering quality, not a shared visual theme. Projects MAY have different brand, density, layout, and component language.
6. A product's visual authority is the Gate 1 approved openable page of its primary screen, together with the tokens and page specifications approved after that page. An earlier product's visual package is not authority for a later product.

## 2. Design-system requirements

1. Every UI project MUST define Primitive, Semantic, and Component token layers, or document why a layer is not applicable.
2. Primitive tokens MUST express raw scales and values; Semantic tokens MUST express purpose; Component tokens MUST express component-specific decisions.
3. Application screens SHOULD consume Semantic or Component tokens. Direct Primitive consumption is permitted only for foundational primitives with no suitable semantic alias; repeated direct consumption MUST trigger creation of an alias.
4. Components MUST define relevant states: default, hover, focus-visible, active, disabled, pending, error, and selected. Inapplicable states MUST be documented.
5. Layouts MUST define behavior at the supported minimum window/viewport sizes and prevent accidental overflow, clipped controls, and unstable wrapping.
6. Accessibility MUST cover semantic structure, keyboard operation, visible focus, accessible names, and applicable WCAG contrast criteria.

## 3. Token source and runtime requirements

1. A project MUST designate one canonical token source (JSON, typed data, or a design-token platform). Generated runtime artifacts MUST NOT become a second editable source of truth.
2. Token names MUST be stable, layered, purpose-oriented, and documented. Aliases MUST resolve without cycles or missing references.
3. Runtime token artifacts MUST be generated from the canonical source, or a deterministic validator MUST prove that manually maintained artifacts are synchronized. A hand-written stylesheet that copies token values is a runtime artifact and is subject to this check.
4. CI MUST fail on invalid token syntax, unresolved aliases, duplicate names, missing required runtime tokens, or generated-artifact drift.
5. UI code MUST consume runtime tokens for design decisions such as color, typography, spacing, sizing, borders, radius, elevation, and motion. Layout mechanics and resets (for example display, overflow, box-sizing, width: 100%, margin: 0) do not need tokens.
6. Exceptions to token use MUST be local, justified, and documented. Arbitrary one-off visual values SHOULD NOT be introduced.

## 4. Component and page implementation

1. Reusable controls MUST be implemented as components when repetition or shared behavior warrants it.
2. Components MUST consume the design tokens and expose accessible names, labels, focus behavior, and state feedback.
3. Pages MUST establish a clear hierarchy: page purpose, primary task or data, supporting information, and secondary actions.
4. Dense data MUST use stable columns, grid/flex constraints, or explicit responsive variants; uncontrolled flex wrapping MUST NOT be the default for structured records.
5. Empty, loading, pending, success, validation, permission, and failure states MUST be designed and tested where applicable.
6. Responsive behavior MUST be tested at the minimum supported viewport/window size and at a representative larger size.

## 5. Requirement-to-runtime traceability

1. Each meaningful screen, overlay, and critical interaction MUST have a stable identifier.
2. The traceability registry MUST link screen/interaction IDs to requirement IDs, business rules, flows, design specifications, component IDs, source files, backend operations, and tests where applicable.
3. Backend mapping MUST reflect the actual architecture (for example REST/API, IPC/preload, service, domain, persistence); projects MUST NOT force an artificial REST model onto non-HTTP architectures.
4. Traceability metadata MUST live in a single maintained registry or generated artifact, not scattered hard-coded annotations across page components.
5. The registry MUST be validated for schema correctness, duplicate IDs, missing references, and broken source/test paths.
6. QA reviewers MUST be able to inspect the current screen and follow its links to requirements, design, renderer, backend operation, and test evidence. Production exposure of debug metadata MUST be explicitly controlled.

## 6. Verification and acceptance

1. Build, typecheck, lint, and unit tests are necessary engineering checks; they do not prove visual acceptance.
2. Each screen MUST be verified in the real target runtime at supported viewport sizes. Browser-only previews are insufficient for platform-specific desktop/mobile behavior.
3. Visual verification MUST include named screenshots, viewport/runtime metadata, and comparison against the Gate 1 approved page or a later approved page specification derived from that page.
4. Critical flows MUST have automated interaction or integration coverage. Backend/domain behavior MUST be verified at the layer where it is implemented.
5. Manual acceptance MUST use a checklist that covers behavior, visual comparison with the Gate 1 approved page, visual hierarchy, content, responsive behavior, keyboard/focus, accessibility, and traceability. From the screen under review, QA MUST be able to see the linked requirements, design sources, and backend operations. Production builds MUST NOT show that inspection layer unless an approved product requirement includes it.
6. Acceptance status MUST distinguish PASS, FAIL, BLOCKED, and NOT RUN. Missing evidence is NOT RUN, never PASS.
7. Release MUST be blocked by unresolved MUST-level failures or unapproved deviations.

## 7. Standard adoption and pilot validation

1. A project adopts this standard by recording the standard version, applicability, deviations, and an implementation/verification plan.
2. Pilot evidence MUST record defects found, false positives, false negatives, automation coverage, reviewer effort, and required changes to the standard.
3. The standard MUST be revised from pilot findings before being declared stable for broad adoption.
4. The first pilot is this repository's Electron/React desktop application. A second, materially different UI stack is required before claiming cross-stack validation.

## 8. Current pilot-specific implementation

- Canonical token source: `docs/ui-ux/tokens/design-tokens.json`.
- Runtime target: Electron renderer CSS custom properties.
- Traceability source: `docs/traceability/ui-traceability.json`.
- Visual and page authority: `docs/ui-ux/05-visual-design.md` and `docs/ui-ux/12-page-specifications.md`.
- Product and business authority: approved PRD and business-rule/acceptance-criteria documents.
- The QA inspector is development-only and is not a product feature.
- The desktop pilot's approvals predate the Gate 1 openable-page requirement. Until the user approves a replacement page, the files listed above remain that product's visual authority.
