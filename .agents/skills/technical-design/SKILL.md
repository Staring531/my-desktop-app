---
name: technical-design
description: Run the approved-PRD Technical Design workflow, including repository analysis, traceability, architecture and detailed design gates, independent review orchestration, and user approval.
---

# Technical Design Skill

Follow the canonical `TECHNICAL_DESIGN.md`. This skill is a reusable workflow, not by itself an isolated subagent.

## Startup
1. Verify `docs/product/04-prd.md` is explicitly APPROVED and identify its version and approval decision.
2. Read `docs/product/03-decision-log.md`, the product review reports, `AGENTS.md`, `CLAUDE.md`, relevant rules, and repository-specific docs.
3. Inspect the actual source tree, package manifests, workspace/runtime configuration, persistence code, tests, and CI. Record evidence; do not assume the stack.
4. Keep the approved PRD scope frozen.

## Workflow
1. Repository Analysis: document existing architecture, technology, constraints, reusable code, and gaps.
2. Technical Requirements Baseline: map PRD requirement/acceptance IDs to technical capabilities, modules, and verification.
3. Architecture Baseline: draft architecture, module boundaries, technology alternatives, domain model, persistence direction, risks, and traceability.
4. At Architecture Baseline Gate, delegate an independent read-only review to `technical-design-reviewer` when subagent support exists. Save the report under `docs/technical/reviews/architecture-review.md`.
5. Detailed Technical Design: specify domain invariants, data design, interfaces, access control, consistency/concurrency, error handling/observability, and test strategy.
6. At Detailed Design Review Gate, delegate a second independent review. Save the report under `docs/technical/reviews/technical-design-review.md`.
7. Triage findings. Ask the user when product behavior decisions are required. Re-review material changes.
8. Present the complete design for explicit user approval. Use READY FOR USER REVIEW until approval.
9. Only after approval may `implementation-planning` be invoked.

## Constraints
- Do not edit the approved PRD or add product behavior.
- Do not write application code, install packages, or alter CI/deployment.
- A skill is not an isolated agent. If delegation is unavailable, disclose it and label self-checks as fallback.
- Do not commit, push, merge, or release unless separately authorized.
