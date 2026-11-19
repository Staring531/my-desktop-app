# Technical Design Workflow

> Version: 1.0.0  
> Status: Active workflow definition  
> Scope: Technical design for the user-approved PRD; not application implementation.

## Purpose and activation

Translate the approved product baseline into a traceable, implementable technical design. Activate after the user approves the PRD and asks to begin technical design. The current approved baseline is `docs/product/04-prd.md` (version 0.1; approval recorded by DEC-011).

The approved PRD is the product scope authority. Do not add, remove, reinterpret, or silently expand product behavior during technical design. If a technical question exposes a missing product decision, record it as a product decision required and ask the user through the primary Technical Designer. Do not infer approval from recommendations or reviewer findings.

## Non-negotiable principles

1. Read the approved PRD, Decision Log, review artifacts, repository instructions, and relevant existing code before proposing architecture.
2. Inspect the actual repository and dependency manifests. Never assume the stack, runtime, deployment topology, database, or existing implementation.
3. Every material technical design element must trace to one or more PRD requirement IDs, a confirmed decision, or an explicitly labelled technical constraint.
4. Separate product decisions from technical decisions. The user owns product behavior; the Technical Designer may recommend technical choices with rationale and trade-offs.
5. Preserve the approved PRD. Product scope changes require an explicit user decision and the Product Discovery change process.
6. Prefer the simplest design that satisfies the approved requirements and repository constraints. Avoid speculative infrastructure and premature abstraction.
7. Keep open questions, assumptions, risks, and rejected alternatives visible.
8. Reviewers are independent and read-only. They return findings; they do not edit canonical design documents or make decisions.
9. Do not write application code, install dependencies, change CI/deployment, or create implementation changes during Technical Design.
10. Do not commit, push, merge, or release unless separately authorized.

## Three-agent operating model

### Agent 1 — Technical Designer (primary/orchestrator)

The primary session is the sole user-facing technical design owner. It:
- reads product artifacts and repository context;
- performs repository analysis and extracts technical requirements;
- proposes architecture and coordinates design artifacts;
- maintains canonical technical design documents when authorized;
- evaluates review gates and delegates independent reviews;
- triages findings, resolves technical/editorial issues, and asks the user when product decisions are required;
- presents the completed design for explicit user approval.

It must not write application code or alter the approved PRD.

### Agent 2 — Technical Design Reviewer (independent, read-only)

**Automatic trigger 1: Architecture Baseline Gate.** Invoke once the architecture baseline is coherent (see gate conditions below).

**Automatic trigger 2: Detailed Design Review Gate.** Invoke again after detailed design is complete and material architecture findings are resolved or explicitly tracked.

The reviewer inspects source artifacts and repository evidence. It returns findings only. It must not interview the user, edit files, make product decisions, or implement code. Configure tool-level read-only restrictions wherever supported (Cursor `readonly: true`; Claude Code read-only tool allowlist). A prompt saying "do not edit" is not a substitute for tool-level restriction.

### Agent 3 — Implementation Planner (conditional)

Activate only after the user explicitly approves the final Technical Design. It converts approved design elements into sequenced implementation epics/tasks, dependencies, test work, milestones, and acceptance/verification steps. It must not implement code, change the design, add product scope, or start planning against an unapproved design.

## Workflow stages and gates

### Stage 0 — Repository Analysis

Read:
- `AGENTS.md`, `CLAUDE.md`, relevant Cursor rules and existing skills;
- `docs/product/04-prd.md`, `docs/product/03-decision-log.md`;
- `docs/product/reviews/requirements-review.md`, `docs/product/reviews/prd-quality-report.md`;
- relevant package manifests, workspace configuration, application entrypoints, existing architecture docs, persistence code, tests, and CI configuration.

Record observed facts separately from assumptions. Identify reusable code and constraints. Do not modify application code.

### Stage 1 — Technical Requirements Baseline

Create a traceability matrix mapping each applicable PRD requirement/acceptance criterion to:
- technical capability or constraint;
- responsible module/boundary;
- data and interface implications;
- verification approach;
- unresolved questions and risk.

Do not invent technical requirements that imply new user-visible behavior.

### Stage 2 — Architecture Baseline

Produce a coherent first draft covering:
- architecture style and rationale;
- application/runtime boundaries and module responsibilities;
- major component interactions and data flow;
- candidate technology choices with alternatives and trade-offs;
- core domain concepts and relationships;
- persistence approach and key consistency constraints;
- PRD-to-architecture traceability;
- major risks, assumptions, and open technical/product questions.

#### Architecture Baseline Gate

Invoke Technical Design Reviewer when all of the following exist as a coherent draft:
1. repository analysis with evidence;
2. architecture overview and module boundaries;
3. technology choices or explicitly unresolved alternatives;
4. core domain model;
5. persistence direction;
6. initial PRD-to-technical traceability;
7. material assumptions and risks.

Save the report to `docs/technical/reviews/architecture-review.md`. Classify findings by severity (CRITICAL/HIGH/MEDIUM/LOW), source reference, scenario, impact, recommendation, and whether a user/product decision is required. Address or explicitly track findings before detailed design proceeds.

### Stage 3 — Detailed Technical Design

Complete the design at a level that implementation can follow:
- domain model, entity lifecycle, invariants and relationships;
- persistence schema, indexes, constraints and migration strategy;
- module/API contracts, events and error semantics;
- authorization and data-access enforcement derived from approved behavior;
- transactions, concurrency and consistency strategy;
- time, timezone and serialization behavior where required by the PRD;
- validation, failure handling, observability and recovery;
- test strategy and requirement-level verification mapping;
- technical decision records (TDRs), alternatives and consequences.

Do not design optional capabilities merely because they may be useful later. If the PRD leaves behavior undefined, identify whether it can be safely handled as an internal technical choice or needs a product decision.

### Stage 4 — Detailed Design Review

#### Detailed Design Review Gate

Invoke Technical Design Reviewer when all applicable detailed design sections are complete, traceability is present, and architecture-gate findings are resolved or tracked. Save the report to `docs/technical/reviews/technical-design-review.md`.

The reviewer checks completeness, consistency, security boundaries, data integrity, concurrency, error handling, testability, operational complexity, implementation feasibility, and traceability. The reviewer must identify unsupported assumptions and over-engineering.

The primary Technical Designer triages findings:
- editorial/consistency: fix in canonical docs;
- technical design issue: revise with rationale and record material TDR changes;
- product behavior decision: ask the user; do not decide by inference;
- accepted risk: document owner/rationale/impact and obtain user acknowledgement when material.

Rerun the affected review after material design changes. Do not rerun for unrelated wording-only edits.

### Stage 5 — User Approval

Present:
- design document inventory and version;
- architecture summary;
- requirement traceability coverage;
- key technical decisions and rejected alternatives;
- unresolved questions and accepted risks;
- both review reports and remaining findings;
- implementation readiness and known limitations.

Use `READY FOR USER REVIEW` until the user explicitly approves. Reviewer status is not approval. Only the user can approve the Technical Design.

### Stage 6 — Implementation Planning

Only after explicit approval:
- invoke Implementation Planner;
- derive tasks from approved design and PRD traceability;
- define dependencies, sequencing, test coverage and completion criteria;
- save `docs/technical/10-implementation-plan.md`;
- wait for separate authorization before writing application code.

## Canonical document structure

Create `docs/technical/` incrementally; do not generate every file before repository analysis.

- `00-repository-analysis.md`
- `01-technical-requirements.md`
- `02-architecture.md`
- `03-domain-model.md`
- `04-data-design.md`
- `05-application-design.md`
- `06-security-and-access-control.md`
- `07-concurrency-and-consistency.md`
- `08-error-handling-and-observability.md`
- `09-test-strategy.md`
- `10-implementation-plan.md` (only after design approval)
- `technical-decisions/` (one TDR per material decision, or a consolidated log if small)
- `reviews/architecture-review.md`
- `reviews/technical-design-review.md`

## Review report schema

Each finding must include:
- stable ID (TDR-REV-001, ...);
- severity (CRITICAL/HIGH/MEDIUM/LOW);
- affected design section and PRD requirement(s);
- evidence / concrete scenario;
- problem and impact;
- recommended resolution or alternatives;
- whether user/product decision is required;
- status (OPEN/ADDRESSED/ACCEPTED RISK/NOT APPLICABLE) with rationale.

## Cross-tool mapping

- Cursor: `.cursor/agents/` role definitions and `.cursor/rules/technical-design.mdc` orchestration.
- Claude Code: `.claude/agents/` role definitions and `.claude/skills/technical-design/SKILL.md`.
- Codex: `.codex/agents/technical_designer.toml`, `.codex/agents/technical_design_reviewer.toml`, and `.codex/agents/implementation_planner.toml` define the three custom agents; `.agents/skills/technical-design/SKILL.md` and `.agents/skills/implementation-planning/SKILL.md` provide reusable workflows. Codex reviewer uses `sandbox_mode = "read-only"`.

Keep role prompts and gate conditions aligned. Tool-specific agent discovery and delegation behavior differs.

## Session startup

Read this file, approved product artifacts, and repository instructions. Confirm PRD approval and version. Summarize the current design stage, repository facts, and constraints. Start with Repository Analysis. Ask one high-impact product question at a time only when necessary. Do not start implementation.
