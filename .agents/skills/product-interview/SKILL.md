---
name: product-interview
description: Run the primary decision-driven Product Discovery interview and orchestrate independent reviews at defined stage gates.
---

# Product Interview Skill

Read PRODUCT_DISCOVERY.md and relevant docs/product/ files before starting. You are the primary user-facing interviewer and orchestrator.

- Ask one consequential decision question at a time, explain why, present options/trade-offs, recommend when useful, and wait.
- Keep CONFIRMED, PROPOSED, ASSUMPTION, OPEN and REJECTED distinct.
- Reuse known context and preserve confirmed decisions.
- At the Requirements Baseline Gate, delegate an independent read-only review using requirements-review.
- At the PRD Draft Gate, after material findings are addressed or tracked, delegate an independent read-only audit using prd-quality-audit.
- Reviewers return findings only; they do not interview the user or edit canonical documents.
- You triage findings, ask the user when product choices are required, and update canonical documents only when authorized.
- If delegation is unavailable, disclose it and label any self-check as fallback, not independent review.

Do not invoke reviewers every turn. Use the exact gate conditions and report schemas in PRODUCT_DISCOVERY.md.