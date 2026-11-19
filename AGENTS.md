# Agent Engineering Instructions

## Scope and safety
- Treat this repository as a multi-application TypeScript monorepo.
- Read relevant app/package documentation before changing code.
- Do not invent product requirements, domain entities, or business workflows.
- Never commit secrets, credentials, private keys, tokens, or real customer data.
- Do not access production systems or credentials.
- Do not deploy, publish releases, modify cloud resources, or change repository permissions without explicit authorization.
- Do not delete repositories, branches, or user data.

## Git workflow
- Create a focused branch from latest main. Never push directly to main or force-push.
- Keep commits small and descriptive. Open a PR with context and verification results.
- Do not merge your own PR unless explicitly instructed.

## Implementation standards
- TypeScript strict mode is enabled. Avoid any; validate untrusted input at boundaries.
- Prefer simple, maintainable designs. Keep application boundaries clear.
- Add/update tests for behavior changes. Update docs and environment examples when configuration changes.
- Do not silently change public APIs or persistence contracts.

## Verification
Run formatting, type checking, linting, unit tests, and build where applicable. Report checks that could not be run; never claim a check passed without output.

## Product discovery workflow
For product discovery, follow PRODUCT_DISCOVERY.md as canonical.
- The primary agent is the sole user-facing Product Interviewer and orchestrator.
- Ask one decision question at a time. Recommendations, assumptions, silence, and reviewer findings are not user approval.
- Use only CONFIRMED, PROPOSED, ASSUMPTION, OPEN, REJECTED.
- Read docs/product/03-decision-log.md and reuse known context.
- Do not modify application code, install dependencies, change architecture, or implement during discovery.
- Edit product documents only when authorized. Do not commit/push/merge/release unless separately authorized.

## Required independent review orchestration
- Use the product-interview skill for the primary workflow.
- At the Requirements Baseline Gate in PRODUCT_DISCOVERY.md, delegate an independent read-only review to requirements-review when subagent support is available.
- At the PRD Draft Gate, after material requirements findings are resolved or tracked, delegate an independent read-only audit to prd-quality-audit.
- Do not invoke reviewers every turn. Evaluate gates at stage checkpoints.
- Reviewers must not interview the user, edit canonical PRD/decision/business-rule files, or decide product behavior.
- The primary agent handles findings and asks the user about product choices. Rerun affected reviews after material changes.
- If native delegation is unavailable, disclose it and label any self-check as fallback, not independent review.

## Skill locations
Shared Codex-compatible skills live in .agents/skills/. Equivalent Claude workflows live in .claude/skills/. Tool-specific agent definitions live in .cursor/agents/ and .claude/agents/.

## Technical design workflow
After the user explicitly approves the PRD, follow `TECHNICAL_DESIGN.md` as canonical.
- The primary session is the sole user-facing Technical Designer and orchestrator.
- Inspect repository source/configuration and read approved product artifacts before recommending architecture or technology.
- Keep the approved PRD scope frozen; do not invent product behavior or modify the PRD.
- Build traceability from PRD requirements/acceptance criteria to technical design and verification.
- At Architecture Baseline Gate and Detailed Design Review Gate, delegate an independent read-only review when native subagent support is available.
- Reviewer returns findings only; it must not edit design documents, interview the user, decide product behavior, or write code.
- Use tool-level read-only controls where supported; prompt-only restrictions are not a sandbox.
- If delegation is unavailable, disclose it and label any self-check as fallback, not independent review.
- Do not write application code, install dependencies, or change CI/deployment during Technical Design.
- Activate Implementation Planner only after explicit user approval of the complete Technical Design. Planning does not authorize coding.


## UI/UX design workflow
After the approved PRD, Technical Design, and Implementation Plan are available, follow UI_UX_DESIGN.md when the user asks to begin UI/UX Design.
- The primary session is the sole user-facing UI/UX Designer and orchestrator.
- Begin with Stage 0 Readiness Analysis; wait for user review before design artifacts.
- Preserve approved scope and Technical Design contracts. Maintain PRD AC → flow → screen → interaction traceability.
- Delegate the independent read-only reviewer at the Design Review Gate when native subagent support exists.
- Reviewers return findings only. The primary agent triages findings and asks the user about product decisions.
- Do not write application code, install dependencies, or directly modify Implementation Plan during design.
- UI/UX approval does not authorize coding; wait for separate explicit user authorization.
- Disclose unavailable native delegation; self-check is fallback, not independent review.
