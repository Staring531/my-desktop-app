# Repository Analysis: Personal Time Management

- Stage: 0 — Repository Analysis
- Date: 2026-11-24
- Status: APPROVED by the user on 2026-11-24. This approval does not authorize application code.
- Product authority: `docs/product/06-prd-personal-time.md`, version 0.1, status APPROVED (DEC-080, 2026-11-24)
- This analysis does not modify `docs/product/06-prd-personal-time.md` or `docs/product/04-prd.md`.
- Existing `docs/technical/00-repository-analysis.md` through `docs/technical/10-implementation-plan.md` remain the approved design for `docs/product/04-prd.md`. They are not this product's design and are not edited here.

Labels:

- **Fact** — observed in a named file during this inspection.
- **Inference** — a conclusion drawn from those facts. It is not a design decision.
- **Open** — unresolved. It is not a product or technology decision.

## 1. Product baseline

### Facts

- The user approved `docs/product/06-prd-personal-time.md` version 0.1 on 2026-11-24. DEC-080 records that approval. It does not change DEC-012 through DEC-079, does not supersede `docs/product/04-prd.md`, and does not authorize technical design by itself. The user then asked to start technical design.
- `docs/product/04-prd.md` remains APPROVED for the earlier one-computer, one-team desktop product (DEC-011).
- `docs/process/TECHNICAL_DESIGN.md` still names `docs/product/04-prd.md` as the current approved baseline. This session follows the user's later approval and request: the personal time PRD.
- The personal time first delivery is a browser, with business data held by a server. It includes registration, email verification, login, password recovery, one personal Calendar, timed Events, public and private visibility, daily, weekly, and monthly repetition, conflict warnings, calendar timezone, and account deletion.
- Search, the personal calendar page, sharing links, and teams are confirmed and are outside the first delivery. Desktop is last and uses the same server, identity, rules, and data.
- DEC-013 states that no web framework, server framework, or desktop shell is selected.
- DEC-023 leaves username characters and length, password rules, verification-message lifetime, recovery-proof lifetime, and changing the account email unresolved.
- DEC-079 leaves performance, availability, and accessibility unresolved. No response time, availability proportion, or accessibility standard is a requirement.
- DEC-038 does not set a session length. DEC-022 does not decide deletion of an account that still belongs to a team. DEC-014 does not decide how many personal Calendars one user may own beyond the personal calendar page.
- The latest personal-time PRD audit recorded readiness READY FOR USER REVIEW and did not itself approve the PRD. Current approval is the PRD status plus DEC-080.

### Inference

- The approved local-only technical design cannot be reused as this product's architecture. TD-001 keeps one team record on one computer and rejects a shared server record. The personal time PRD requires the server to hold the business data.

## 2. Repository facts

### Workspace and toolchain

- Root `package.json` names the repo `my-desktop-app` at version `0.1.0`, private, package manager `pnpm@10.8.0`, Node `>=22.0.0`.
- Scripts run dev for desktop, website, admin, and API; recursive build, typecheck, lint, and test; and Prettier format or check.
- Root dev dependencies are `prettier` `^3.5.3` and `typescript` `^5.8.2`.
- `pnpm-workspace.yaml` includes `apps/*` and `packages/*`.
- `tsconfig.base.json` sets TypeScript `strict`, `noUncheckedIndexedAccess`, and `exactOptionalPropertyTypes`.
- `.github/workflows/ci.yml` runs on pull requests, manual dispatch, and pushes to `main`. It uses pnpm `10.8.0` and Node `22`, then typecheck, lint, test, and build. Install uses `--no-frozen-lockfile`.
- `docs/decisions/0001-monorepo.md` is accepted. It keeps applications independently buildable and says cloud and deployment choices remain open.

### Applications present

- `@app/api` (`apps/api/package.json`) depends on NestJS 11 (`@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`). `apps/api/src/main.ts` listens on `PORT` or `4000`. `apps/api/src/health.controller.ts` returns `{ status: 'ok' }` from `GET /health`.
- `@app/website` (`apps/website/package.json`) depends on Next.js `^15.3.0` and React `^19.0.0`. `apps/website/app/page.tsx` renders a scaffold heading and the sentence "The public website scaffold is ready for product content."
- `@app/admin` (`apps/admin/package.json`) depends on Next.js `^15.3.0` and React `^19.0.0` and uses port `3001`.
- `@app/desktop` (`apps/desktop/package.json`) depends on Electron `^35.0.0`, `electron-vite`, React 19, and `@js-temporal/polyfill`. `apps/desktop/src/main/store/index.ts` reads and replaces `team-record.json` on the local filesystem.
- `@app/shared` and `@app/api-client` export TypeScript entrypoints and have no runtime dependencies in their manifests.

### Persistence

- A search of `*.json`, `*.ts`, `*.md`, and `*.yml` found no Prisma, Postgres, SQLite, TypeORM, or Drizzle dependency or reference.
- The only observed business persistence is the desktop team's local JSON file.

### Existing technical design

- `docs/technical/02-architecture.md` status is APPROVED by the user on 2026-11-19 for `docs/product/04-prd.md`.
- `docs/technical/technical-decisions/log.md` records TD-001: one computer, one local record, no shared database for that version.
- `docs/architecture/overview.md` describes the four-application workspace and says database, authentication provider, hosting, observability, and release distribution are undecided. Its product-domain line says business workflows were awaiting requirements. That sentence is older than both approved PRDs.

## 3. What this inspection does not decide

- Whether the first delivery reuses the Next.js website, the NestJS API, both, or neither.
- Which database, if any, holds the server data.
- How a session is stored. The PRD requires login and says recovery ends open sessions. It does not set a session length.
- Hosting, mail delivery for the verification and recovery proofs, and desktop packaging. The proofs must be sent to an email address. The transport is not selected.
- Any change to the approved desktop design for `docs/product/04-prd.md`.

## 4. Next stage

The user approved this technical design on 2026-11-24. The next document is the implementation plan. Application code still waits for a separate authorization.
