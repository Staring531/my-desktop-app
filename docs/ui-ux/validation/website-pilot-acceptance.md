# Website UI/UX Pilot Acceptance

- Project: `apps/website`
- Runtime: Next.js 15 / React 19 / browser
- Standard: `docs/ui-ux/ENGINEERING-STANDARD.md`
- Method: `docs/ui-ux/WEB-UI-ENGINEERING-METHOD.md`
- Status: IN PROGRESS — automated engineering gates pass; browser and independent acceptance remain NOT RUN
- Branch: `feat/website-ui-ux-pilot-main`
- Base commit: `d4b4a8c756d5f237f2a77c21b0a74817076e101c`
- Verified commit: `8699df21daa8bdbfa1946e9f7e2f49de0d261551`
- CI run: [45584107804](https://github.com/Staring531/my-desktop-app/actions/runs/45584107804)

## Automated verification

| Check | Actual CI evidence | Status |
|---|---|---|
| Website token synchronization | Website design tokens synchronized (68 tokens). | PASS |
| Website route traceability | Registry structurally valid (11 routes). | PASS |
| Website TypeScript | `apps/website typecheck: Done` in repository CI. | PASS |
| Website formatting | `apps/website lint: All matched files use Prettier code style`. | PASS |
| Website unit/component tests | 2 test files, 15 tests passed. | PASS |
| Website production build | Next.js 15 production build compiled; all 13 route outputs generated. | PASS |

The workflow also runs repository-wide checks, including an Electron smoke test. That test is a separate repository regression gate and is **not** counted as evidence for the Web UI pilot.

## Browser viewport matrix

No real-browser screenshot or manual viewport review has been recorded yet.

| Route / surface | 1440×900 | 1024×768 | 768×1024 | 390×844 | 320 CSS px |
|---|---|---|---|---|---|
| Home / shared page shell | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN |
| Registration and authentication | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN |
| Calendar | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN |
| Event editor | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN |
| Account | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN |

For each browser run record: commit SHA, browser/version, route, viewport, zoom, screenshot path, expected behavior, actual behavior, reviewer, date, and status.

## Accessibility and interaction

| Check | Status | Evidence |
|---|---|---|
| Landmark and heading structure in running browser | NOT RUN | Component semantics have automated tests; route-level browser review pending |
| Accessible field names | NOT RUN | Shared TextField has component test; full route review pending |
| Keyboard-only navigation and focus order | NOT RUN | |
| Enter / Space activation | NOT RUN | |
| Pending / success / error announcements | NOT RUN | Component tests cover role semantics; screen-reader/browser verification pending |
| Visible focus and rendered contrast measurement | NOT RUN | |
| 200% zoom and reduced motion | NOT RUN | |
| Responsive overflow | NOT RUN | |

## Route traceability

See `docs/traceability/website-ui-traceability.json`. All 11 routes are registered. Test mappings are recorded only where existing component tests provide relevant coverage; an empty test array means no verified automated mapping exists. Component tests do not constitute route-level browser E2E coverage.

## Cursor Ask review

- Prompt: `docs/ui-ux/WEB-UI-CURSOR-ASK-REVIEW.md`
- Status: NOT RUN. This repository change prepares the review protocol; it does not claim that Cursor Ask has executed.
- After review, record the Ask model/version, date, commit SHA, files inspected, findings, false positives, and human disposition.

## Review record

| Reviewer | Role | Date | Commit | Result | Evidence |
|---|---|---|---|---|---|
| | Implementer | | | NOT RUN | |
| | Independent reviewer (Cursor Ask + human review) | | | NOT RUN | |

## Exit decision

Automated engineering gates are PASS at the verified commit. The pilot is **not accepted yet**. Acceptance remains blocked until real-browser screenshots, responsive checks, keyboard and accessibility evidence, and independent read-only review are recorded. Do not convert NOT RUN to PASS based on code inspection or CI build success alone.
