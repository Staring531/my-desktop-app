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