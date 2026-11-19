# Technical Design Workflow

> Version: 1.0.0  
> Scope: technical discovery, architecture and detailed design for the approved product baseline.

## Purpose and activation

Translate the user-approved PRD into an implementable, testable technical design. Activate only after the PRD is explicitly APPROVED and when the user asks to start or continue technical design. This workflow defines the process; it does not itself select a technology stack or authorize application implementation.

## Source of truth and constraints

1. Read `docs/product/04-prd.md`, `docs/product/03-decision-log.md`, and relevant product review reports before designing.
2. Treat the approved PRD and confirmed decisions as the product contract.
3. Do not add, remove, reinterpret, or expand product behavior. Record any mismatch or missing product decision as a Product Decision Required item and ask the user.
4. Distinguish product requirements from technical decisions and technical assumptions.
5. Inspect the repository before proposing architecture. Existing code, package manifests, framework choices, and project conventions are evidence, not automatic constraints if they conflict with the approved PRD; explain conflicts.
6. Do not start application implementation, install dependencies, change CI/deployment/infrastructure, or create implementation code during Technical Design.
7. Do not commit, push, merge, or release unless separately authorized.
8. Keep out-of-scope PRD capabilities out of the design. A technical concern needed to implement an in-scope behavior may be designed, but must not silently introduce a new user-facing capability.

## Three-agent operating model

### Agent 1 — Technical Designer (primary/orchestrator)

The primary session is the sole user-facing technical-design agent. It:
- inspects the repository and product baseline;
- extracts traceable technical requirements;
- proposes architecture and technical decisions with alternatives and trade-offs;
- maintains technical design documents when authorized;
- evaluates review gates and delegates independent reviews;
- triages findings and asks the user when a product decision is required;
- presents the complete design for explicit user approval.

### Agent 2 — Technical Design Reviewer (independent, read-only)

The reviewer independently examines supplied design artifacts at both review gates. It returns findings only; it must not edit canonical technical documents, interview the user, make product decisions, or implement code. Enforce read-only at the tool level where supported (Cursor `readonly: true`; Claude Code read-only tool allowlist). For other runtimes, use the narrowest read-only tool permissions available and disclose any limitation. Prompt instructions alone are not proof of tool-level isolation.

### Agent 3 — Implementation Planner (post-approval only)

This agent is inactive until the user explicitly approves the technical design. It converts approved design decisions into sequenced implementation work, dependencies, test tasks, and milestones. It must not change the approved product scope or technical design.

## Workflow stages and gates

### Stage 0 — Authorization and repository analysis

Confirm the PRD status is APPROVED. Read the product baseline and inspect repository structure, language, frameworks, dependencies, existing modules, persistence, tests, and engineering conventions. Record observed facts with paths/evidence. Do not assume the repository is greenfield.

**Output:** repository analysis and constraints; no architecture commitment.

### Stage 1 — Technical requirements baseline

Translate each applicable PRD requirement and business rule into one or more technical requirements. Give each technical requirement a stable ID (for example, TR-001) and map it to PRD/AC/DEC identifiers. Identify quality attributes and operational constraints only when supported by the PRD or repository evidence. Keep unresolved questions explicit.

**Output:** traceability matrix and open technical questions.

### Stage 2 — Architecture Baseline

Develop a coherent draft covering:
- architecture style and deployment/runtime boundaries;
- module/component boundaries and responsibilities;
- key interactions and data flows;
- candidate technology choices, alternatives, rationale, and trade-offs;
- core domain model and entity relationships;
- persistence approach and transaction boundaries;
- security and authorization approach required by the approved behaviors;
- major risks, assumptions, and unresolved decisions.

#### Architecture Baseline Gate

Invoke Technical Design Reviewer when the above items form a coherent draft. The reviewer checks requirement coverage, architectural fit, module boundaries, domain model, persistence direction, technology rationale, risks, and scope drift.

Do not proceed as if the gate passed until findings are classified. Resolve editorial/design issues in the primary session; ask the user about product decisions. Record accepted risks and deferred issues explicitly.

### Stage 3 — Detailed Technical Design

Complete the design needed to implement and test the approved baseline:
- detailed domain model, invariants, lifecycle and state transitions;
- data schema, constraints, indexes, migrations and transaction semantics;
- module APIs/contracts and interaction sequences;
- authorization checks and data-access boundaries;
- time/date handling and other PRD-specific semantics;
- concurrency, conflict handling, consistency and recovery;
- error taxonomy, logging and observability appropriate to the application;
- test strategy, requirement-to-test traceability, and critical edge cases;
- technical decisions (TDRs), alternatives and consequences.

Do not design out-of-scope features merely because they are common in similar applications.

### Stage 4 — Detailed Design Review

#### Detailed Design Review Gate

Invoke the independent Technical Design Reviewer after detailed design artifacts are complete and cross-linked.

The reviewer checks completeness, consistency, security, data integrity, concurrency, failure handling, testability, traceability, complexity, and implementation readiness. It returns findings only.

The Technical Designer classifies findings, addresses material issues, and reruns affected review areas after material changes. A self-check is not an independent review. If native delegation is unavailable, disclose the limitation and label any self-check as fallback.

### Stage 5 — User approval

Present:
- design summary and architecture diagrams where useful;
- repository facts and technology choices;
- PRD-to-technical traceability coverage;
- review outcomes and unresolved findings;
- accepted risks, assumptions, and deferred decisions;
- implementation implications.

Use `READY FOR USER REVIEW` until the user explicitly approves. A reviewer cannot approve the design. Do not activate Implementation Planner or begin implementation before explicit user approval.

### Stage 6 — Implementation planning (after approval)

Invoke Implementation Planner only after explicit approval. Produce sequenced work packages, dependencies, test tasks, acceptance evidence, and milestones. Keep implementation planning distinct from coding authorization.

## Canonical artifacts

Store design artifacts under `docs/technical/`:
- `00-repository-analysis.md`
- `01-technical-requirements.md`
- `02-architecture.md`
- `03-domain-model.md`
- `04-data-design.md`
- `05-application-design.md`
- `06-security-design.md`
- `07-concurrency-and-consistency.md`
- `08-error-handling-and-observability.md`
- `09-test-strategy.md`
- `10-technical-decisions.md`
- `11-implementation-plan.md` (only after technical-design approval)
- `reviews/architecture-review.md`
- `reviews/technical-design-review.md`

Create documents incrementally when their stage is reached; do not generate empty placeholders or write all detailed documents before repository analysis. Keep review reports separate from canonical design documents.

## Finding schema

Each reviewer finding must include:
- ID (for example, TDR-001);
- severity (BLOCKER/HIGH/MEDIUM/LOW);
- category (coverage/architecture/data/security/concurrency/reliability/testability/scope/maintainability);
- affected TR/PRD/AC/DEC and document section;
- evidence and concrete failure scenario;
- impact;
- recommended resolution;
- whether a user/product decision is required.

The report must include overall result, blockers, prioritized findings, coverage gaps, assumptions, and review limitations.

## Session startup

Read this workflow and the approved product baseline. Confirm current stage and authorization. Inspect existing repository evidence before proposing a design. Summarize known constraints and the next stage deliverable. Ask one consequential question at a time when user input is required.
