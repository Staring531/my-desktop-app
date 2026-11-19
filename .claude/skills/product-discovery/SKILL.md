---
name: product-discovery
description: Compatibility entrypoint for the three-agent Product Discovery workflow. Use product-interview as the primary skill.
---

# Product Discovery Compatibility Entry

This legacy skill name is retained for existing invocations. The canonical primary workflow is now the product-interview skill in this directory.

1. Load the product-interview skill.
2. Follow PRODUCT_DISCOVERY.md as the source of truth.
3. Keep the primary session as the sole user-facing interviewer.
4. Delegate independent read-only reviews at the Requirements Baseline Gate and PRD Draft Gate only.
5. Use requirements-reviewer and prd-quality-auditor subagents; do not let them interview the user or edit canonical documents.

Do not maintain a separate workflow here.