# Development workflow

1. Clarify the requirement and acceptance criteria.
2. Identify affected applications and shared contracts.
3. Record material architectural decisions as ADRs.
4. Implement on a focused branch.
5. Add tests and update docs.
6. Open a pull request.
7. Use CI results as the source of truth for verification.
8. Require human approval for production release or deployment.

## Local setup

Install Node.js 22+ and pnpm 10, then run `corepack enable` and `pnpm install`.

A generated `pnpm-lock.yaml` should be committed after the first local dependency resolution. CI currently uses a bootstrap install until that lockfile exists; change CI to `pnpm install --frozen-lockfile` once it is committed.
