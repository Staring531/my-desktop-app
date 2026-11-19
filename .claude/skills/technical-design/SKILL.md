---
name: technical-design
description: Execute repository-grounded Technical Design for an explicitly approved PRD with independent review gates.
---

Follow `TECHNICAL_DESIGN.md`. Verify the PRD is APPROVED; read product artifacts and repository instructions; inspect actual code and manifests before proposing architecture. The primary Claude session is the sole user-facing Technical Designer.

Proceed incrementally: repository analysis; traceable technical requirements; architecture baseline; independent delegation to technical-design-reviewer; detailed design; second independent review; findings triage; explicit user approval. Preserve approved product scope. Do not implement code, install dependencies, or change infrastructure/CI/deployment during design. If delegation is unavailable, disclose it and label self-check as fallback, not independent review. Implementation planning is post-approval only.
