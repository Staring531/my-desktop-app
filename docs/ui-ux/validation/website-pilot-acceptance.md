# Website UI/UX Pilot Acceptance

- Project: `apps/website`
- Runtime: Next.js 15 / React 19 / Chromium-based browser (record exact browser per run)
- Standard: `docs/ui-ux/ENGINEERING-STANDARD.md`
- Method: `docs/ui-ux/WEB-UI-ENGINEERING-METHOD.md`
- Status: IN PROGRESS
- Branch: `feat/website-ui-ux-pilot`
- Baseline commit: `a537f8e8322f77d525e754431542bb5afa13374c`

## Automated verification

| Check | Command | Status | Evidence |
|---|---|---|---|
| Website token generation | `pnpm ui-ux:website:tokens:check` | NOT RUN | Pending CI |
| Website traceability | `pnpm ui-ux:website:traceability:check` | NOT RUN | Pending CI |
| TypeScript | `pnpm --filter @app/website typecheck` | NOT RUN | Pending CI |
| Prettier | `pnpm --filter @app/website lint` | NOT RUN | Pending CI |
| Unit/component tests | `pnpm --filter @app/website test` | NOT RUN | Pending CI |
| Production build | `pnpm --filter @app/website build` | NOT RUN | Pending CI |

## Browser viewport matrix

| Route / surface | 1440×900 | 1024×768 | 768×1024 | 390×844 | 320 CSS px |
|---|---|---|---|---|---|
| Shared page shell | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN |
| Registration | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN |
| Calendar | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN |
| Event editor | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN |
| Account | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN |

For each browser run record: commit SHA, browser/version, route, viewport, zoom, screenshot path, expected behavior, actual behavior, reviewer, date, and status.

## Accessibility and interaction

| Check | Status | Evidence |
|---|---|---|
| Landmark and heading structure | NOT RUN | |
| Accessible field names | NOT RUN | |
| Keyboard-only navigation and focus order | NOT RUN | |
| Enter / Space activation | NOT RUN | |
| Pending / success / error announcements | NOT RUN | |
| Visible focus and contrast measurement | NOT RUN | |
| 200% zoom and reduced motion | NOT RUN | |
| Responsive overflow | NOT RUN | |

## Route traceability

See `docs/traceability/website-ui-traceability.json`. Routes with empty test arrays remain unverified. A shared component test does not imply that every route or API flow is covered.

## Review record

| Reviewer | Role | Date | Commit | Result | Evidence |
|---|---|---|---|---|---|
| | Implementer | | | NOT RUN | |
| | Independent reviewer (Cursor Ask + human review) | | | NOT RUN | |

## Exit decision

Pilot acceptance remains blocked until automated checks pass, browser evidence is captured, accessibility and keyboard checks are recorded, and independent review is complete. Do not convert NOT RUN to PASS based on code inspection alone.
