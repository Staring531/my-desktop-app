# Agent Entry Point and Engineering Guardrails

## Mandatory workflow startup
**Before any repository task, read `docs/process/DEVELOPMENT_WORKFLOW.md` in full.** It is the single source of truth for the repository-wide development lifecycle, stage order, approval gates, agent responsibilities, scope boundaries, and authorization rules. Chinese reference: `docs/process/DEVELOPMENT_WORKFLOW-zh.md`.

Then:
1. Identify the user's requested outcome and explicitly authorized actions.
2. Determine the current lifecycle stage from documented user approvals and canonical artifacts.
3. Read the relevant stage workflow in full: `docs/process/PRODUCT_DISCOVERY.md`, `docs/process/TECHNICAL_DESIGN.md`, or `docs/process/UI_UX_DESIGN.md`.
4. Read applicable PRD, decision log, review reports, technical/design artifacts, and app/package documentation.
5. State missing prerequisites or ambiguous approvals; do not advance stages by assumption.
6. Execute only the requested work at the current authorized stage.

The lifecycle flowchart is in `docs/process/DEVELOPMENT_WORKFLOW.md`. Follow that file for binding rules. Do not duplicate stage procedures here; update the canonical workflow first.

## Global engineering and safety rules
- Treat this repository as a multi-application TypeScript monorepo.
- Do not invent product requirements, domain entities, or business workflows. Preserve approved scope.
- Never commit secrets, credentials, private keys, tokens, or real customer data.
- Do not access production systems or credentials.
- Do not deploy, publish releases, modify cloud resources, or change repository permissions without explicit authorization.
- Do not delete repositories, branches, or user data.
- Create a focused branch from latest main. Never push directly to main or force-push.
- Keep commits small and descriptive. Open a PR with context and verification results.
- Do not merge your own PR unless explicitly instructed.
- TypeScript strict mode is enabled. Avoid `any`; validate untrusted input at boundaries.
- Prefer simple, maintainable designs. Keep application boundaries clear.
- Add/update tests for behavior changes. Update docs and environment examples when configuration changes.
- Do not silently change public APIs or persistence contracts.
- Run formatting, type checking, linting, unit tests, and build where applicable. Report checks that could not be run; never claim a check passed without output.

## Tooling and skill locations
- Shared Codex-compatible skills: `.agents/skills/`
- Claude workflows: `.claude/skills/`
- Tool-specific agent definitions: `.cursor/agents/` and `.claude/agents/`
- Skills define reusable procedures; they are not automatically isolated subagents.
- Reviewer roles require real native delegation and tool-level read-only controls where available. Prompt-only restrictions are not a security sandbox.
