# Project Adoption Checklist

Use this checklist when applying the UI/UX Engineering Standard to a project.

## Project profile
- Project:
- Standard version:
- UI/UX Design workflow version followed:
- Product/platform:
- UI technology:
- Supported viewport/window sizes:
- Product requirements source and approval:
- Design source and approval:
- Technical architecture source and approval:
- QA owner:

## Required adoption evidence
- [ ] Design system layers and naming rules documented.
- [ ] Canonical token source identified.
- [ ] Runtime token generation or deterministic synchronization check configured.
- [ ] Token alias, duplicate, unused-token, and unresolved-reference checks configured.
- [ ] Component inventory and component state matrix documented.
- [ ] Screen/flow/interaction identifiers assigned.
- [ ] Traceability registry links requirements, design, UI source, backend operations, and tests.
- [ ] Registry schema and reference validation run in CI.
- [ ] Minimum and representative viewport/runtime test matrix defined.
- [ ] Screenshot evidence naming and storage convention defined.
- [ ] Keyboard, focus, semantic markup, and contrast checks included.
- [ ] Critical user flows have automated tests.
- [ ] Manual acceptance checklist and PASS/FAIL/BLOCKED/NOT RUN rules adopted.
- [ ] Deviations have approver, rationale, scope, and review date.
- [ ] Visual brief confirmed by the user: audience, personality adjectives, anti-goals, density, shell posture.
- [ ] Scope constraints and Taste constraints listed separately.
- [ ] Gate 1 page set covers the primary screen, an entry or form screen, a state-heavy screen, and the navigation shell.
- [ ] State matrix defines every state the requirements need, including danger, success, warning, and empty where they apply.
- [ ] Rendered screenshots at one narrow and one wide viewport are stored with viewport metadata.
- [ ] Contrast ratios are measured and recorded for every text/background and focus-indicator pair.

## Acceptance record
| Gate | Status | Evidence | Owner |
|---|---|---|---|
| Design system | NOT RUN | | |
| Token runtime | NOT RUN | | |
| Component conformance | NOT RUN | | |
| Traceability | NOT RUN | | |
| Functional verification | NOT RUN | | |
| Visual verification | NOT RUN | | |
| Visual brief fit | NOT RUN | | |
| Accessibility | NOT RUN | | |
| Manual acceptance | NOT RUN | | |

A gate without evidence remains NOT RUN. Build success alone does not satisfy visual or manual acceptance.
