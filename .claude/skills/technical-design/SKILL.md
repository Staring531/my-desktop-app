---
name: technical-design
description: Execute the approved-PRD Technical Design workflow with two independent review gates and explicit user approval.
---

Follow `TECHNICAL_DESIGN.md`. Verify PRD approval, inspect repository evidence before choosing technologies, build requirement traceability, and work incrementally from repository analysis to architecture baseline and detailed design. Delegate independent read-only reviews to `technical-design-reviewer` at both defined gates. The primary session owns findings triage and asks the user about product decisions. Do not modify the approved PRD, expand scope, or write application code. A skill is not itself an isolated subagent; disclose when native delegation is unavailable. Activate `implementation-planner` only after explicit user approval of the completed Technical Design.
