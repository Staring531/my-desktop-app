# Repository Analysis

- Stage: 0 — Repository Analysis
- Date: 2026-11-19
- Status: Recorded for Technical Design. This document does not approve architecture or technology.
- Product authority: `docs/product/04-prd.md`, version 0.1 draft, status APPROVED (DEC-011, 2026-11-19)
- Evidence inspected: approved PRD, Decision Log DEC-001 through DEC-011, requirements review, PRD quality audit, root and package manifests, TypeScript configs, application entrypoints, shared packages, CI, and existing architecture notes.

Labels used below:

- **Fact** — observed in a named file during this inspection.
- **Inference** — a conclusion drawn from those facts. It is not a design decision.
- **Assumption** — a working premise for later design stages. It is not confirmed.
- **Open** — unresolved. It is not a product or technology decision.

## 1. Product baseline

### Facts

- `docs/product/04-prd.md` status is `APPROVED`. Version text is `0.1 draft`. Source decisions are DEC-001 through DEC-010. DEC-011 records the user's approval on 2026-11-19 and states that approval did not add, remove, or change those requirements.
- Version 1 lets one small team see busy and free time from each member's own schedule events.
- In scope: one team, one maintainer, invitation and acceptance, single schedule events, team-visible and only-self visibility, and a per-member busy/free view that includes past single events.
- Out of scope: start and invite reminders, recurring events, all-day or date-only events, activity registration, incident management, shared-meeting booking as the primary job, shift assignment, and a second team at the same time.
- The PRD states that proving control of an email, and how the team record moves between devices, are outside the behavioral contract.
- Business rules are BR-1 through BR-7. Acceptance criteria are AC-001 through AC-051. Section 9 records no open product questions.
- `docs/product/reviews/requirements-review.md` final re-review found no material gap. Earlier findings RR-01 through RR-39 are closed by DEC-002 through DEC-009.
- `docs/product/reviews/prd-quality-report.md` found no critical gap, scored completeness 86/100, and recorded readiness as READY FOR USER REVIEW at audit time. Its disposition says editorial fixes were applied to the PRD. That report does not approve the PRD. Current approval is the PRD status plus DEC-011.

### Inference

- The audit report's readiness line is historical. The approved PRD text is the current product scope.

## 2. Repository facts

### Workspace and toolchain

- Root `package.json` names the repo `my-desktop-app` at version `0.1.0`, private, package manager `pnpm@10.8.0`, Node `>=22.0.0`.
- Scripts run dev for desktop, website, admin, and API; recursive build, typecheck, lint, and test; and Prettier format or check.
- Root dev dependencies are `prettier` `^3.5.3` and `typescript` `^5.8.2`.
- `pnpm-workspace.yaml` includes `apps/*` and `packages/*`.
- No `pnpm-lock.yaml` is present. `docs/development/workflow.md` says CI uses a bootstrap install until the first lockfile is committed.
- `tsconfig.base.json` sets `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, target `ES2022`, module `ESNext`, module resolution `Bundler`, and `noEmit: true`.
- `.prettierrc.json` sets single quotes, semicolons, trailing commas, and print width 100.
- No ESLint configuration is present. Package `lint` scripts run `prettier --check`.
- `.github/workflows/ci.yml` runs on pull requests, workflow dispatch, and pushes to `main`. It uses pnpm `10.8.0`, Node 22, `pnpm install --no-frozen-lockfile`, then typecheck, lint, test, and build.
- `.gitignore` ignores `node_modules/`, build outputs, `.env`, and allows `!.env.example`.

### Applications and packages

| Path | Package | Observed runtime | Observed behavior |
|---|---|---|---|
| `apps/desktop` | `@app/desktop` | Electron `^35`, electron-vite `^3`, React `^19`, Vite `^6`, Vitest `^3` | One 1200×800 window. Preload exposes `desktop.platform` only. Renderer shows placeholder text. |
| `apps/website` | `@app/website` | Next.js `^15.3`, React `^19`, port 3000 | Placeholder home page. |
| `apps/admin` | `@app/admin` | Next.js `^15.3`, React `^19`, port 3001 | Placeholder page stating authentication and authorization are not configured. |
| `apps/api` | `@app/api` | NestJS `^11`, Express platform, port from `PORT` or 4000 | `GET /health` returns `{ status: 'ok' }`. |
| `packages/shared` | `@app/shared` | No runtime dependency | Exports `HealthStatus = 'ok' \| 'degraded' \| 'unavailable'`. |
| `packages/api-client` | `@app/api-client` | No runtime dependency | `createApiClient` performs HTTP GET and can send `Authorization: Bearer`. |

- Desktop web preferences set `contextIsolation: true`, `nodeIntegration: false`, and `sandbox: true` (`apps/desktop/src/main/index.ts`).
- Desktop preload uses `contextBridge.exposeInMainWorld` and exposes only `platform` (`apps/desktop/src/preload/index.ts`).
- API `.env.example` contains `PORT=4000` only.
- No application source imports `@app/shared` or `@app/api-client`. No application imports another application's source.
- No test files and no `describe(` or `it(` tests are present. Every package test script is `vitest run --passWithNoTests`.
- No database client, persistence module, domain state library, or domain IPC channel is present.

### Existing written architecture

- `docs/architecture/overview.md` describes four independently deployable apps, TypeScript, pnpm, Electron, Next.js, and NestJS. It says database, authentication provider, hosting, observability, and release distribution are undecided, and that the product domain is awaiting requirements. It also says the API is the trust boundary and the desktop renderer is untrusted input.
- `docs/decisions/0001-monorepo.md` is an accepted ADR dated 2026-11-18: use one pnpm workspace and keep applications independently buildable. Cloud and deployment remain open.
- `README.md` and `docs/requirements/README.md` say the repository is initializing and that product requirements have not yet been supplied.
- `docs/deployment/README.md` says no cloud provider or production target has been selected.

## 3. Inferences

- No current module implements a team, roster, invite, event, busy/free projection, or conflicting-write rule. Approved behavior cannot be reused from existing domain code because that code does not exist.
- Reusable material is the workspace and process shell: pnpm workspace boundaries, strict TypeScript, Prettier, a Vitest script entry, the CI quality sequence, the desktop process split, and a preload that exposes a narrow bridge.
- `HealthStatus`, `GET /health`, and `createApiClient` have no approved product behavior attached to them. The client assumes an HTTP base URL and an optional bearer token. Nothing in the repo calls it.
- BR-7 requires a completed write to become the record, an incomplete write to leave the prior record, and the first completed write to win. The repository has no record store and no completion boundary that can enforce that.
- AC-014, AC-016, AC-028, AC-029, and AC-042 require absolute instants, device-local civil time, and a named daylight-saving gap or overlap. The repository has no time-zone conversion code.

## 4. Assumptions

These premises are for Stage 1 and later design. They are not decisions.

- The approved PRD remains the scope authority. Website, admin, and API scaffolds are repository facts, not approved user-facing features.
- Framework names in `docs/architecture/overview.md` and ADR 0001 describe the initialized repository. They are not the technology choices of this Technical Design.
- Because record transport between devices is outside the behavioral contract, Stage 1 records its effect on storage and consistency without adding a sync feature.

## 5. Open items

- **Q-REC.** BR-7 says a member who is viewing sees a completed change, and a member who is not viewing sees it on the next view. Other members do not need to be online. The PRD also places movement of the team record between devices outside the behavioral contract. Where the record lives, and how a later view reads the committed result, is unresolved. A solution that adds user-visible behavior beyond the PRD needs a product decision. Choosing an internal storage mechanism does not, by itself, decide that product question.
- **Q-ACT.** Several criteria speak as a named email opening or operating the app. Proving control of an email is outside the behavioral contract. How a running session is treated as that email, without adding a proof or login product flow, is unresolved.
- **Q-RUN.** Whether the existing website, admin app, or API process participates in version 1 is unresolved. Stage 0 does not assign them a product role.

## 6. Constraints, gaps, and risks

### Constraints observed in the repo

- Node 22 and pnpm 10.8.0.
- TypeScript strictness flags listed above.
- Applications are separate packages. Shared packages exist only as scaffolds.
- The desktop renderer is isolated from Node integration in the current shell.
- CI installs without a frozen lockfile.

### Gaps relative to the approved PRD

- No domain modules, persistence, authorization enforcement, write-completion boundary, timezone conversion, or acceptance-level tests.

### Risks

- Treating the initialized "API is the trust boundary" sentence, or the unused bearer client, as the version 1 architecture would introduce network identity and deployment before record transport is designed.
- CI dependency resolution can change until a lockfile exists.
- `docs/architecture/overview.md`, `README.md`, and `docs/requirements/README.md` still say requirements are absent. Later design must cite the approved PRD and Decision Log, not those sentences.

## 7. Non-decisions

This analysis does not select a database, hosting provider, authentication mechanism, UI framework change, or which existing app owns version 1 behavior. It does not modify the PRD. It does not call the Technical Design Reviewer.
