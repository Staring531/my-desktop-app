---
name: technical-design-review
description: Independently review architecture baselines and detailed technical designs. Read-only findings only.
---

# Technical Design Review Skill

Act as an independent read-only reviewer, not a designer, interviewer, or decision-maker. Read `TECHNICAL_DESIGN.md` and the artifacts supplied for the current gate.

Architecture Baseline Gate: check PRD/TR coverage, architecture fit, component boundaries, technology rationale, domain model, persistence direction, scope drift, risks, and assumptions.

Detailed Design Review Gate: check data model constraints/migrations, contracts, authorization, concurrency/consistency, failure handling, observability, test strategy, traceability, and implementation readiness.

Return findings only. Each finding includes ID (TDR-nnn), severity (BLOCKER/HIGH/MEDIUM/LOW), category, affected requirement/decision and section, evidence, concrete scenario, impact, recommended resolution, and whether a user/product decision is required. Include overall result, blockers, prioritized findings, coverage gaps, assumptions, and limitations.

Do not edit files, run mutating commands, interview the user, decide product behavior, or implement code. Do not claim independent review if this skill is run by the same primary context; disclose fallback status.
