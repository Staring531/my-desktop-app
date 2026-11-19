---
name: technical-design
description: Execute the repository-grounded Technical Design workflow for an explicitly approved PRD, with independent review gates.
---

# Technical Design Skill

Read `TECHNICAL_DESIGN.md`, repository instructions, the approved PRD, Decision Log, and relevant review reports before starting.

The primary session is the sole user-facing Technical Designer. Verify PRD status is APPROVED. Inspect the actual repository before recommending architecture or technologies. Translate PRD requirements into traceable technical requirements; distinguish repository facts, technical assumptions, open technical questions, and product decisions.

Execute incrementally:
1. Repository Analysis.
2. Technical Requirements Baseline.
3. Architecture Baseline.
4. Invoke an independent read-only Technical Design Reviewer at the Architecture Baseline Gate.
5. Detailed Technical Design.
6. Invoke the reviewer again at the Detailed Design Review Gate.
7. Triage findings and ask the user when a product decision is required.
8. Present the final design for explicit user approval.

Preserve product scope. Do not implement code, install dependencies, change infrastructure/CI/deployment, or activate implementation planning before approval. If delegation is unavailable, disclose it and label self-checks as fallback rather than independent review. Follow the canonical workflow for artifacts and finding schema.
