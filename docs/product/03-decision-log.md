# Product Decision Log

> Purpose: durable record of product decisions made through Decision-driven Requirements Interview.  
> Rule: an AI recommendation is never a user-confirmed decision.

## Status definitions

- `CONFIRMED` — explicitly selected or approved by the user.
- `PROPOSED` — recommended or suggested, awaiting user approval.
- `ASSUMPTION` — temporary premise, not yet validated.
- `OPEN` — unresolved question or missing information.
- `REJECTED` — explicitly declined by the user.

Only `CONFIRMED` decisions may be treated as approved product requirements.

## Decision index

| ID | Topic | Status | Related area | Notes |
|---|---|---|---|---|
| — | No decisions have been migrated into this log yet | — | — | Populate from explicit user-confirmed decisions; do not infer approval |

## Decision record template

Copy this section for each decision.

### DEC-001 — [Short decision title]

- **Status:** OPEN
- **Date:** [YYYY-MM-DD, if known]
- **Topic:** [Product area]
- **Context / question:** [Why this decision is needed]
- **Options considered:**
  - A. [Option and trade-offs]
  - B. [Option and trade-offs]
- **Assistant recommendation:** [Recommendation and rationale; not approval]
- **User's choice:** [Exact choice or faithful summary; leave pending if not decided]
- **Final business rule:** [Precise, testable rule; write "Pending" until confirmed]
- **Rationale:** [User-stated reason, if known]
- **Consequences / scope impact:** [UX, data, engineering, MVP, migration, etc.]
- **Related decisions:** [DEC-xxx]
- **Change history:** [Superseded decisions or later amendments]

---

## Recording rules

1. Assign stable, sequential IDs: `DEC-001`, `DEC-002`, etc. Never reuse an ID.
2. Create a record when a material product decision is raised, even if it remains OPEN.
3. Keep the user's choice separate from the assistant recommendation.
4. Set status to CONFIRMED only after explicit user approval.
5. If only part of a decision is confirmed, split it into separate records or clearly isolate the confirmed portion.
6. When a decision changes, preserve traceability: record the replacement decision and mark the prior one as superseded in its change history.
7. Link business rules and acceptance criteria back to relevant decision IDs where practical.
8. Do not fabricate dates, rationales, or user statements.
9. Review this log at each stage checkpoint and before PRD approval.
