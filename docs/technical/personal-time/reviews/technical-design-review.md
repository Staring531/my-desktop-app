# Detailed design review: personal time management

- Date: 2026-11-24
- Reviewer: independent technical design reviewer
- Scope: `docs/technical/personal-time/00-repository-analysis.md` through `09-test-strategy.md`
- Result: READY FOR USER REVIEW. Findings below are addressed or closed. This review does not approve the technical design.

A later mail-outage rerun closed TDR-PT-201, TDR-PT-202, and TDR-PT-203. No HIGH or MEDIUM mail contradiction remains. That rerun does not approve the design.

| ID | Severity | User decision | Disposition |
|---|---|---|---|
| TDR-PT-101 | HIGH | no | Addressed. Account and series deletion name the child rows and do not delete detached Events through a series cascade. |
| TDR-PT-102 | HIGH | yes | Closed by DEC-082. While mail cannot be sent, every registration and every recovery start returns `send_failed` and writes nothing. |
| TDR-PT-103 | HIGH | no | Addressed. The read includes an unfrozen started occurrence, suppresses an absence by civil date, and keeps skip rules across later changes. |
| TDR-PT-104 | HIGH | no | Addressed. Detach is a separate route, Calendar reads are a finite range, and the occurrence object has its fields. |
| TDR-PT-105 | HIGH | no | Addressed. Registration, recovery start, and timezone change take the locks named by the review. |
| TDR-PT-106 | MEDIUM | no | Addressed. An ordinary recovery start uses the login failure result. |
| TDR-PT-107 | MEDIUM | no | Addressed. Argon2id, a 128-bit proof, `used_at`, and a matching proof purpose are specified. |
| TDR-PT-108 | MEDIUM | no | Addressed. The mail wait is finite, and an unexpected failure returns `operation_failed` without provider text. |
| TDR-PT-109 | MEDIUM | no | Addressed. A timezone is stored only when the server can resolve it. |
| TDR-PT-110 | MEDIUM | no | Addressed. Race tests run on PostgreSQL. |
| TDR-PT-111 | LOW | no | Addressed. The unused version column is gone. One Calendar per account is a first-delivery constraint. |
| TDR-PT-201 | HIGH | no | Addressed. Each attempt checks sendability again. A rejected message does not leave mail marked unable. |
| TDR-PT-202 | HIGH | no | Addressed. Waiting attempts return `send_failed` when a proof message is rejected. |
| TDR-PT-203 | MEDIUM | no | Addressed. The domain model and tests cite both mail modes. |

This review does not approve the technical design.
