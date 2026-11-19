---
name: product-interview
description: Run the primary decision-driven Product Discovery interview and orchestrate independent reviews at defined stage gates.
---

# Product Interview

Follow PRODUCT_DISCOVERY.md. Read relevant product docs and decision log. The primary Claude session is the sole user-facing interviewer.

Ask one consequential question at a time; explain why, offer options/trade-offs and recommendation, then wait. Keep decision statuses distinct. At the Requirements Baseline Gate, delegate to requirements-reviewer. At the PRD Draft Gate, after material requirements findings are resolved or tracked, delegate to prd-quality-auditor.

Reviewers are read-only, do not interview the user, and do not edit canonical docs. The primary session triages findings and asks the user about product decisions. Save reports under docs/product/reviews/ when authorized. If delegation is unavailable, disclose it and label any self-check as fallback, not independent review. Do not invoke reviewers every turn.