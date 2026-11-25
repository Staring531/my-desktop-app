# Web UI Engineering Method

- Version: 1.0.0-pilot
- Applies to: `apps/website` (Next.js 15 App Router, React 19, TypeScript).
- Standard authority: `ENGINEERING-STANDARD.md`.
- Status: pilot method; not yet approved for broad adoption.

## 1. Purpose and boundaries

This method makes the UI/UX Engineering Standard executable for browser-rendered applications. It governs the Web UI from requirement intake through implementation and acceptance. It does not use Electron Main, Preload, IPC, native-window, or packaged-installer checks.

The website is the pilot target. Existing product behavior and API contracts remain authoritative; visual work must not change business rules, routes, request payloads, authentication behavior, or data semantics without separate approval.

## 2. Sources of truth

| Concern | Canonical source |
|---|---|
| Engineering rules | `docs/ui-ux/ENGINEERING-STANDARD.md` |
| Web-specific procedure | This document |
| Website token source | `apps/website/tokens/design-tokens.json` |
| Generated browser tokens | `apps/website/app/tokens.generated.css` (never edit by hand) |
| Website shared components | `apps/website/components/ui.tsx` |
| Website routes | `apps/website/app/**/page.tsx` |
| Website traceability | `docs/traceability/website-ui-traceability.json` |
| Automated tests | `apps/website/**/*.test.tsx` |
| Pilot evidence | `docs/ui-ux/validation/website-pilot-acceptance.md` |

The website owns its own token source. The Electron token source remains separate; sharing a repository does not imply sharing a brand theme or runtime artifact.

## 3. Delivery method

### Gate A — Discover and scope

1. Identify route inventory, page purpose, actors, critical flows, and current API behavior.
2. Record the supported browser matrix and viewport matrix.
3. Link each in-scope route to requirement, flow, design decision, component, source, and test identifiers.
4. Mark unknown requirements and missing evidence as NOT VERIFIED; do not infer them from implementation.

### Gate B — Define design decisions

1. Define Primitive, Semantic, and Component token layers in the website token source.
2. Record typography, color, spacing, content width, control size, focus, and responsive behavior.
3. Define shared component contracts and default, hover, focus-visible, active, disabled, pending, success, validation, and failure states as applicable.
4. Record any exception with rationale, owner, affected routes, and review date.

### Gate C — Implement

1. Implement shared primitives before page-specific styling.
2. Pages consume shared components and semantic/component tokens; generated CSS is not hand-edited.
3. Preserve route behavior, request payloads, business rules, and server/API boundaries.
4. Use semantic landmarks, one page-level H1, explicit navigation names, programmatic field labels, native controls, and live status/alert semantics.
5. Use responsive constraints; structured data must not rely on uncontrolled wrapping.
6. Implement visible focus and reduced-motion behavior.

### Gate D — Verify in layers

Run from the repository root:

```bash
pnpm ui-ux:check
pnpm --filter @app/website typecheck
pnpm --filter @app/website lint
pnpm --filter @app/website test
pnpm --filter @app/website build
```

Run the browser application:

```bash
pnpm --filter @app/website dev
```

Open `http://localhost:3000` in a real browser. Verify at minimum 1440×900, 1024×768, 768×1024, and 390×844. Include 320 CSS px as a narrow-width overflow check. Record browser/version, viewport, route, commit SHA, and screenshot path.

### Gate E — Browser and accessibility review

For every in-scope route:

- Confirm no horizontal page overflow at supported widths.
- Confirm content hierarchy, spacing, typography, and token usage.
- Exercise default, hover, keyboard focus, active, disabled, pending, success, validation, empty, and failure states where applicable.
- Navigate with keyboard only; verify logical Tab order and Enter/Space behavior.
- Verify accessible names, landmarks, heading order, field labels, and live status announcements.
- Check text contrast against WCAG 2.2 AA (4.5:1 normal text, 3:1 large text; relevant non-text UI boundaries 3:1). Automated estimates are not a substitute for rendered-state measurement.
- Verify at 200% zoom and reduced-motion preference.
- Use browser DevTools and an accessibility scanner where available; record tool/version and findings.

### Gate F — Acceptance and independent review

1. Record PASS, FAIL, BLOCKED, NOT RUN, or NOT VERIFIED for each gate.
2. PASS requires a reproducible test or review artifact. Missing evidence is never PASS.
3. Fix MUST-level failures before pilot acceptance.
4. A reviewer who did not implement the change performs the read-only review.
5. Record false positives, false negatives, reviewer effort, uncovered routes, and proposed standard changes.

## 4. Website pilot scope

The first implementation slice covers the shared page shell, navigation, form controls, command buttons, result feedback, token runtime, and representative registration/calendar/event flows. The route registry lists all current website routes; an empty test list means no verified automated test mapping exists for that route.

The pilot is a browser-runtime and Next.js architecture validation. Because the website and desktop renderer both use React, this pilot alone does not satisfy the separate requirement for validation on a materially different UI framework.

## 5. Cursor Ask review protocol

Use Cursor **Ask** mode after implementation and automated checks. Ask must be read-only: it may inspect source, docs, tests, and CI evidence, but must not edit files, run write commands, or mark missing evidence PASS.

Paste the prompt from `docs/ui-ux/WEB-UI-CURSOR-ASK-REVIEW.md`. Save the resulting review report under `docs/ui-ux/validation/` only after a human has checked its findings. Record Ask model/version, review date, commit SHA, files inspected, and any false positives or missed issues.

## 6. Exit criteria

The pilot is accepted only when:
- website token generation and website traceability validation pass in CI;
- website typecheck, lint, unit tests, and production build pass;
- all in-scope routes are reviewed in a real browser at the viewport matrix;
- critical user flows have automated interaction coverage;
- accessibility checks have recorded evidence;
- screenshots and test evidence are linked from the acceptance record;
- independent read-only review is complete;
- all MUST-level findings are resolved or formally excepted.

Passing build or unit tests alone is not visual or accessibility acceptance.
