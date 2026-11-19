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