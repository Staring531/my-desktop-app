# Visual Validation

## Scope
This stage validates design artifacts and specifications. It does not claim pixel-perfect runtime validation of an implemented application. Runtime screenshot comparison is deferred until Coding & Testing is separately authorized.

## Design-time validation
1. **Token integrity:** valid token file, resolved references, approved statuses, semantic/component layering, no undocumented raw values.
2. **Component integrity:** approved component references, consistent variants/states, accessibility and keyboard contracts.
3. **Page consistency:** typography, spacing, alignment, hierarchy, density, surfaces, iconography, and feedback patterns.
4. **Coverage:** every in-scope screen and applicable state is represented.
5. **Traceability:** PRD AC → flow → screen → component/interaction → planned implementation task.
6. **Desktop behavior:** supported window constraints, resizing, overflow, focus, and keyboard behavior.
7. **Accessibility:** contrast, labels, focus visibility, non-color cues, and reduced-motion requirements where applicable.

## Evidence
Record artifact path/version, check, expected result, observed result, status (PASS/FAIL/NOT CHECKED), evidence/reference, and owner for each issue. Do not mark a check PASS without evidence.

## Runtime validation handoff
After separate implementation authorization, define deterministic viewport/window sizes, fixture data, application states, screenshot capture method, comparison tolerance, and regression ownership. Compare actual screenshots with approved high-fidelity references; report deviations and re-test after fixes. Do not add screenshot tooling or dependencies during design.
