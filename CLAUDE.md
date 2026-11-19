# Claude Code Project Instructions

For product discovery, follow PRODUCT_DISCOVERY.md as the canonical process.

When starting or continuing discovery:
1. Invoke the product-interview skill when available.
2. Read relevant product documents and docs/product/03-decision-log.md.
3. Keep the primary Claude session as the sole user-facing interviewer and orchestrator.
4. At the Requirements Baseline Gate, delegate to the requirements-reviewer subagent in .claude/agents/.
5. After material requirements findings are addressed or tracked and the PRD plus acceptance criteria have a first draft, delegate to prd-quality-auditor.
6. Reviewers return findings only. They do not interview the user or edit canonical product documents.
7. The primary session resolves editorial issues and asks the user about product decisions.
8. Save reports under docs/product/reviews/ when editing is authorized.
9. Keep recommendations separate from confirmed decisions; do not implement features or modify application code during discovery.

If subagent delegation is unavailable, disclose that and label any self-check as fallback rather than independent review. See PRODUCT_DISCOVERY.md for gate conditions and report schemas.

## Technical Design workflow
For Technical Design after PRD approval, follow `TECHNICAL_DESIGN.md` as canonical.
1. Keep the primary Claude session as the sole user-facing Technical Designer and orchestrator.
2. Verify PRD approval and inspect actual repository code/configuration before proposing technology or architecture.
3. Preserve approved PRD scope and maintain requirement-to-design-to-test traceability.
4. Delegate to `.claude/agents/technical-design-reviewer.md` at both Architecture Baseline and Detailed Design Review gates.
5. The reviewer has only Read, Grep, and Glob tools and returns findings only.
6. The primary session triages findings and asks the user if a product decision is required.
7. Activate `implementation-planner` only after explicit user approval of the complete Technical Design.
8. Do not write application code during Technical Design. If subagent delegation is unavailable, disclose it and label self-check as fallback.
