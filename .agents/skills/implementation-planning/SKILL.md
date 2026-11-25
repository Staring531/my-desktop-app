---
name: implementation-planning
description: After explicit Technical Design approval, create a traceable implementation plan without writing application code.
---

# Implementation Planning Skill

Follow `docs/process/TECHNICAL_DESIGN.md`.

## Preconditions
- PRD status is APPROVED.
- Technical Design status is explicitly APPROVED by the user.
- Approved document versions and review reports are identified.

If any precondition is absent, stop and report it.

## Procedure
1. Read the approved PRD, Decision Log, Technical Design, TDRs, and review reports.
2. Decompose the design into epics and small implementation tasks with stable IDs.
3. Map every task to PRD requirement IDs, design sections/TDRs, and verification cases.
4. Identify prerequisites, dependencies, critical path, milestones, parallel work, risks, and integration points.
5. Define deliverables, test layers, acceptance criteria, and definition of done.
6. Save `docs/technical/10-implementation-plan.md` only when authorized.
7. Wait for separate implementation authorization.

Do not change approved requirements/design, invent product scope, or write/execute application code.
