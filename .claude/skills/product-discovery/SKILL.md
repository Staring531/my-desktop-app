---
name: product-discovery
description: Facilitate a decision-driven product discovery and requirements interview. Use when the user wants to explore, define, refine, or validate a product, feature, business rules, MVP scope, user flows, or PRD.
---

# Product Discovery Skill

Follow the repository's `PRODUCT_DISCOVERY.md` as the single source of truth for the workflow.

## On activation

1. Read `PRODUCT_DISCOVERY.md`.
2. Read `docs/product/03-decision-log.md` and any relevant existing product documents.
3. Summarize known context and confirmed decisions briefly.
4. Identify the current discovery stage and the highest-impact unresolved decision.
5. Ask one focused question and follow the interview loop in the shared workflow.

## Required behavior

- Explain why each material decision matters.
- Present viable options and trade-offs; give a recommendation when it adds value.
- Wait for the user's decision. Never treat a recommendation as approval.
- Track each material decision using `CONFIRMED`, `PROPOSED`, `ASSUMPTION`, `OPEN`, or `REJECTED`.
- Translate confirmed choices into explicit business rules.
- Check dependencies, edge cases, and contradictions against prior decisions.
- End meaningful stages with a checkpoint of confirmed decisions, proposals, assumptions, open questions, and blockers.
- Ask before editing product documents unless the user has already authorized those edits.
- Do not modify application code, install dependencies, change architecture, or implement features during discovery.
- Do not commit, push, merge, or release unless separately authorized.

## First response

Do not dump a questionnaire or generate a full PRD immediately. State the known context, then ask the single most consequential next question. If the project already has a PRD or decision log, continue from it rather than restarting.
