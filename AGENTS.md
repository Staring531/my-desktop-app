# Agent Engineering Instructions

## Scope and safety
- Treat this repository as a multi-application TypeScript monorepo.
- Read the relevant app and package documentation before changing code.
- Do not invent product requirements, domain entities, or business workflows. Ask for clarification when they materially affect implementation.
- Never commit secrets, credentials, private keys, access tokens, or real customer data.
- Do not access production systems, production databases, or production credentials.
- Do not deploy, publish releases, modify cloud resources, or change repository permissions without explicit human authorization.
- Do not delete repositories, branches, or user data.

## Git workflow
- Create a focused branch from the latest `main`.
- Never push directly to `main` or force-push.
- Keep commits small and descriptive.
- Open a pull request with context, implementation notes, and test results.
- Do not merge your own pull request unless explicitly instructed.

## Implementation standards
- TypeScript strict mode is enabled. Avoid `any`; validate untrusted input at boundaries.
- Prefer simple, maintainable designs over speculative abstractions.
- Keep application boundaries clear. Share code only when there is a real reuse case.
- Add or update tests for behavior changes.
- Update documentation and environment examples when configuration changes.
- Do not silently change public APIs or persistence contracts.

## Verification
Before requesting review, run formatting, type checking, linting, unit tests, and build where applicable. Report checks that could not be run. Never claim a check passed unless its output confirms it.


## Product discovery workflow

When the user asks to explore, define, refine, or validate product requirements, follow `PRODUCT_DISCOVERY.md` as the canonical workflow.

- Treat Product Discovery as a decision-driven requirements interview, not a coding task.
- Ask one primary decision question at a time; explain its significance, options, trade-offs, and recommendation.
- Never convert an assistant recommendation, assumption, or silence into a user-confirmed requirement.
- Use the statuses `CONFIRMED`, `PROPOSED`, `ASSUMPTION`, `OPEN`, and `REJECTED` exactly as defined in `PRODUCT_DISCOVERY.md`.
- Read `docs/product/03-decision-log.md` before recording or changing product decisions.
- Reuse known context and existing confirmed decisions; do not ask the user to repeat information already documented.
- During discovery, do not modify application code, install dependencies, change architecture, or perform implementation work.
- Edit product documents only when the user has authorized those documentation changes. Keep unconfirmed proposals visibly labeled.
- Do not commit, push, merge, or release as part of discovery unless separately authorized.
- Start the workflow when the user says "开始 Product Discovery", "开始需求访谈", or an equivalent request.
