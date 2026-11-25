# Project Adoption Checklist

Use this checklist when applying the UI/UX Engineering Standard to a project.

## Project profile
- Project:
- Standard version:
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

## Acceptance record
| Gate | Status | Evidence | Owner |
|---|---|---|---|
| Design system | NOT RUN | | |
| Token runtime | NOT RUN | | |
| Component conformance | NOT RUN | | |
| Traceability | NOT RUN | | |
| Functional verification | NOT RUN | | |
| Visual verification | NOT RUN | | |
| Accessibility | NOT RUN | | |
| Manual acceptance | NOT RUN | | |

A gate without evidence remains NOT RUN. Build success alone does not satisfy visual or manual acceptance.
